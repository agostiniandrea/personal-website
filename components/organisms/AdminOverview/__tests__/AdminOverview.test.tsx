import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import AdminOverview from "../index";

const SUMMARY = {
  email: "andrea@example.com",
  feedback: {
    counts: { pending: 4, accepted: 2, rejected: 1, implemented: 3 },
  },
  forest: {
    treeCount: 198,
    monthCount: 12,
    syncedAt: "2026-10-17T03:30:00.000Z",
    dedicatedTrees: 3,
    contributions: 2,
  },
};

const mockFetch = jest.fn();

const respond = (status: number, body: unknown = {}) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("AdminOverview", () => {
  it("shows who is signed in and links the feedback section with its numbers", async () => {
    mockFetch.mockImplementation(() => respond(200, SUMMARY));
    renderWithTheme(<AdminOverview />);

    expect(
      await screen.findByText("Signed in as andrea@example.com"),
    ).toBeVisible();
    const card = screen.getByRole("link", { name: /Feedback/ });
    expect(card).toHaveAttribute("href", "/admin/feedback");
    expect(card).toHaveTextContent("4");
    expect(card).toHaveTextContent("10 in total");
    expect(card).toHaveTextContent("3 implemented");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/admin/summary",
      expect.anything(),
    );
  });

  it("shows the forest total, the way to the next milestone and the numbers behind it", async () => {
    mockFetch.mockImplementation(() => respond(200, SUMMARY));
    renderWithTheme(<AdminOverview />);

    const forest = await screen.findByLabelText("Forest");
    expect(forest).toHaveTextContent("198");
    expect(forest).toHaveTextContent("trees planted");
    expect(forest).toHaveTextContent("2 trees to go to the 200 milestone.");
    expect(forest).toHaveTextContent("+12 this month");
    expect(forest).toHaveTextContent("3 trees dedicated to feedback");
    expect(
      screen.getByRole("progressbar", { name: "Progress to 200 trees" }),
    ).toHaveAttribute("aria-valuenow", "198");
  });

  it("celebrates a milestone that has just been reached", async () => {
    mockFetch.mockImplementation(() =>
      respond(200, {
        ...SUMMARY,
        forest: { ...SUMMARY.forest, treeCount: 200 },
      }),
    );
    renderWithTheme(<AdminOverview />);

    expect(await screen.findByLabelText("Forest")).toHaveTextContent(
      "Milestone reached: 200 trees.",
    );
  });

  it("still shows the feedback when the forest is unavailable", async () => {
    mockFetch.mockImplementation(() =>
      respond(200, { ...SUMMARY, forest: null }),
    );
    renderWithTheme(<AdminOverview />);

    expect(await screen.findByRole("link", { name: /Feedback/ })).toBeVisible();
    expect(screen.queryByLabelText("Forest")).not.toBeInTheDocument();
  });

  it("says so when the caller is not an admin", async () => {
    mockFetch.mockImplementation(() => respond(401, { error: "Unauthorized" }));
    renderWithTheme(<AdminOverview />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are not signed in as an admin.",
    );
  });
});
