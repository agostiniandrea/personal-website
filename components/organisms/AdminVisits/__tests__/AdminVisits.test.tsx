import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import AdminVisits from "../index";

const OK = {
  status: "ok",
  fetchedAt: "2026-10-17T05:00:00.000Z",
  months: [
    { month: "2026-05", users: 10, sessions: 12, pageViews: 20 },
    { month: "2026-06", users: 30, sessions: 36, pageViews: 60 },
    { month: "2026-07", users: 40, sessions: 55, pageViews: 90 },
    { month: "2026-08", users: 0, sessions: 0, pageViews: 0 },
    { month: "2026-09", users: 25, sessions: 31, pageViews: 52 },
    { month: "2026-10", users: 12, sessions: 15, pageViews: 31 },
  ],
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

describe("AdminVisits", () => {
  it("shows this month's users, the month before and the cookie caveat", async () => {
    mockFetch.mockImplementation(() => respond(200, OK));
    renderWithTheme(<AdminVisits />);

    const card = await screen.findByLabelText("Visits");
    expect(await screen.findByText("users in Oct so far")).toBeVisible();
    expect(card).toHaveTextContent("12");
    expect(card).toHaveTextContent("15 sessions");
    expect(card).toHaveTextContent("31 page views");
    expect(card).toHaveTextContent("25 users in Sep");
    expect(card).toHaveTextContent("only visitors who accepted");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/admin/analytics",
      expect.anything(),
    );
  });

  it("describes the chart in words for screen readers", async () => {
    mockFetch.mockImplementation(() => respond(200, OK));
    renderWithTheme(<AdminVisits />);

    const chart = await screen.findByRole("img");
    expect(chart).toHaveAccessibleName(
      expect.stringContaining(
        "July 2026: 40 users, 55 sessions, 90 page views",
      ),
    );
    expect(chart).toHaveAccessibleName(
      expect.stringContaining("August 2026: 0 users"),
    );
  });

  it("links to Google Analytics and Clarity in a new tab", async () => {
    mockFetch.mockImplementation(() => respond(200, OK));
    renderWithTheme(<AdminVisits />);

    const ga = await screen.findByRole("link", {
      name: "Open Google Analytics",
    });
    expect(ga).toHaveAttribute("target", "_blank");
    expect(ga).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: "Open Clarity" })).toHaveAttribute(
      "href",
      expect.stringContaining("clarity.microsoft.com"),
    );
  });

  it("explains how to connect GA4 when it is not configured", async () => {
    mockFetch.mockImplementation(() =>
      respond(200, { status: "not_configured" }),
    );
    renderWithTheme(<AdminVisits />);

    expect(
      await screen.findByText(/Google Analytics is not connected yet/),
    ).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows an alert when Google does not answer, and keeps the links", async () => {
    mockFetch.mockImplementation(() => respond(502, { status: "error" }));
    renderWithTheme(<AdminVisits />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Google Analytics did not answer",
    );
    expect(
      screen.getByRole("link", { name: "Open Google Analytics" }),
    ).toBeVisible();
  });

  it("shows the same alert when the request itself fails", async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error("offline")));
    renderWithTheme(<AdminVisits />);

    expect(await screen.findByRole("alert")).toBeVisible();
  });
});
