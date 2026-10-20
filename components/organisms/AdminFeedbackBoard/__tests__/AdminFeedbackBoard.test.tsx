import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import AdminFeedbackBoard from "../index";

const ROW = {
  id: "5f2a1b9c-4d3e-4f1a-8b9c-8d7e60d5f8a2",
  category: "UX",
  message: "The Forest counter is easy to find.",
  name: "Sam",
  email: "sam@example.com",
  linkedin: null,
  github: null,
  website: null,
  public_acknowledgment: true,
  status: "pending",
  source: "community",
  trees_planted: 0,
  attribution_source: "reddit",
  attribution_campaign: "forest200",
  created_at: "2026-10-01T09:00:00.000Z",
};

const LIST = {
  items: [ROW],
  total: 1,
  page: 1,
  pageSize: 20,
  counts: { pending: 4, accepted: 2, rejected: 1, implemented: 3 },
};

const mockFetch = jest.fn();

const respond = (status: number, body: unknown = {}) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

/* Waits for the board to be idle again (no button locked while a save is
   in flight), so no state update lands after the test has finished. */
const settle = () =>
  waitFor(() =>
    expect(
      screen
        .getByRole("group", { name: "Set status" })
        .querySelector("button:disabled"),
    ).toBeNull(),
  );

const urls = () => mockFetch.mock.calls.map(([url]) => String(url));

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(() => respond(200, LIST));
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("AdminFeedbackBoard", () => {
  it("opens on the pending feedback and shows each status count", async () => {
    renderWithTheme(<AdminFeedbackBoard />);

    expect(
      await screen.findByText("The Forest counter is easy to find."),
    ).toBeInTheDocument();
    expect(urls()[0]).toContain("status=pending");
    expect(screen.getByRole("button", { name: "Pending (4)" })).toBeVisible();
    expect(screen.getByRole("button", { name: "All (10)" })).toBeVisible();
    expect(screen.getByText(/via reddit \/ forest200/)).toBeVisible();
  });

  it("shows the trees a feedback earned, and nothing for one that earned none", async () => {
    mockFetch.mockImplementation(() =>
      respond(200, {
        ...LIST,
        items: [
          { ...ROW, trees_planted: 3 },
          {
            ...ROW,
            id: "6a3b2c1d-5e4f-4a2b-9c0d-9e8f71e6a9b3",
            message: "Second one.",
            trees_planted: 0,
          },
        ],
      }),
    );
    renderWithTheme(<AdminFeedbackBoard />);

    await screen.findByText("Second one.");
    expect(screen.getAllByText(/trees? planted for this/)).toHaveLength(1);
    expect(screen.getByText("3 trees planted for this")).toBeVisible();
  });

  describe("assigning trees", () => {
    const serve = (row: Record<string, unknown>) =>
      mockFetch.mockImplementation(() =>
        respond(200, { ...LIST, items: [{ ...ROW, ...row }] }),
      );

    const statusButton = (name: string) => screen.getByRole("button", { name });

    it("shows the grey pair on pending and rejected feedback, but disabled", async () => {
      for (const status of ["pending", "rejected"]) {
        serve({ status });
        const { unmount } = renderWithTheme(<AdminFeedbackBoard />);
        await screen.findByText("The Forest counter is easy to find.");

        expect(
          screen.getByRole("button", { name: "Assign 2 trees" }),
        ).toBeDisabled();
        expect(
          screen.getByText(/Available once the feedback is accepted/),
        ).toBeVisible();
        unmount();
      }
    });

    it("asks for a confirmation, then awards the pair through PATCH", async () => {
      serve({ status: "accepted" });
      const user = userEvent.setup();
      renderWithTheme(<AdminFeedbackBoard />);
      await screen.findByText("The Forest counter is easy to find.");
      expect(
        screen.getByText("One for the author, one matched by you."),
      ).toBeVisible();
      mockFetch.mockClear();

      await user.click(screen.getByRole("button", { name: "Assign 2 trees" }));
      expect(mockFetch).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Assign 2 trees to this feedback\?/),
      ).toBeVisible();

      await user.click(screen.getByRole("button", { name: "Confirm" }));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/admin/feedback");
      expect(init.method).toBe("PATCH");
      expect(JSON.parse(init.body)).toEqual({ id: ROW.id, assignTrees: true });
      expect(mockFetch.mock.calls[1][1]?.method).toBeUndefined();
      await settle();
    });

    it("changes nothing when the confirmation is cancelled", async () => {
      serve({ status: "implemented" });
      const user = userEvent.setup();
      renderWithTheme(<AdminFeedbackBoard />);
      await screen.findByText("The Forest counter is easy to find.");
      mockFetch.mockClear();

      await user.click(screen.getByRole("button", { name: "Assign 2 trees" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Assign 2 trees" }),
      ).toBeEnabled();
    });

    it("locks feedback that already has its trees: no award control, no way back to pending or rejected", async () => {
      serve({ status: "accepted", trees_planted: 2 });
      renderWithTheme(<AdminFeedbackBoard />);
      await screen.findByText("2 trees planted for this");

      expect(
        screen.queryByRole("button", { name: "Assign 2 trees" }),
      ).toBeNull();
      expect(statusButton("Pending")).toBeDisabled();
      expect(statusButton("Rejected")).toBeDisabled();
      expect(statusButton("Accepted")).toBeEnabled();
      expect(statusButton("Implemented")).toBeEnabled();
    });

    it("says why when the server refuses the award", async () => {
      serve({ status: "accepted" });
      const user = userEvent.setup();
      renderWithTheme(<AdminFeedbackBoard />);
      await screen.findByText("The Forest counter is easy to find.");
      mockFetch.mockImplementation((_url, init) =>
        init?.method === "PATCH"
          ? respond(409, { error: "Not allowed for this feedback" })
          : respond(200, {
              ...LIST,
              items: [{ ...ROW, status: "accepted" }],
            }),
      );

      await user.click(screen.getByRole("button", { name: "Assign 2 trees" }));
      await user.click(screen.getByRole("button", { name: "Confirm" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        /can't be assigned/,
      );
      await settle();
    });
  });

  it("loads another status when its tab is chosen", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AdminFeedbackBoard />);
    await screen.findByText("The Forest counter is easy to find.");

    await user.click(screen.getByRole("button", { name: "Accepted (2)" }));

    await waitFor(() =>
      expect(urls().some((url) => url.includes("status=accepted"))).toBe(true),
    );
    await screen.findByText("The Forest counter is easy to find.");
    await settle();
  });

  it("sets a new status through PATCH and reloads the list", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AdminFeedbackBoard />);
    await screen.findByText("The Forest counter is easy to find.");
    mockFetch.mockClear();

    const actions = screen.getByRole("group", { name: "Set status" });
    await user.click(
      Array.from(actions.querySelectorAll("button")).find(
        (button) => button.textContent === "Accepted",
      )!,
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/admin/feedback");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ id: ROW.id, status: "accepted" });
    expect(mockFetch.mock.calls[1][1]?.method).toBeUndefined();
    await settle();
  });

  it("does nothing when the current status is clicked again", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AdminFeedbackBoard />);
    await screen.findByText("The Forest counter is easy to find.");
    mockFetch.mockClear();

    const actions = screen.getByRole("group", { name: "Set status" });
    await user.click(
      Array.from(actions.querySelectorAll("button")).find(
        (button) => button.textContent === "Pending",
      )!,
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("says so when the caller is not an admin", async () => {
    mockFetch.mockImplementation(() => respond(401, { error: "Unauthorized" }));
    renderWithTheme(<AdminFeedbackBoard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are not signed in as an admin.",
    );
  });

  it("shows an error, not a silent success, when a change is not saved", async () => {
    const user = userEvent.setup();
    renderWithTheme(<AdminFeedbackBoard />);
    await screen.findByText("The Forest counter is easy to find.");
    mockFetch.mockImplementationOnce(() => respond(500, { error: "x" }));

    const actions = screen.getByRole("group", { name: "Set status" });
    await user.click(
      Array.from(actions.querySelectorAll("button")).find(
        (button) => button.textContent === "Rejected",
      )!,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The change was not saved.",
    );
    await settle();
  });
});
