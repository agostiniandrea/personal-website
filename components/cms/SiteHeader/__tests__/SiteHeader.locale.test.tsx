import { useRouter } from "next/router";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import SiteHeader from "../index";
import { defaultSiteHeader } from "../model";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockUseRouter = useRouter as jest.Mock;
const push = jest.fn();

const useLocale = (locale: "en" | "it", asPath: string) =>
  mockUseRouter.mockReturnValue({ asPath, locale, pathname: "/", push });

/* Next never sees the #hash the mobile views write to the URL, so `asPath` is
   the address the page was loaded with. The language switch has to take the
   hash from the live URL instead. */
describe("SiteHeader language switch", () => {
  beforeEach(() => push.mockReset());
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("keeps the current view's hash when switching to Italian", async () => {
    const user = userEvent.setup();
    useLocale("en", "/");
    window.history.replaceState(null, "", "/#journey");
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);

    await user.click(screen.getByRole("button", { name: "Switch to Italian" }));

    expect(push).toHaveBeenCalledWith("/#journey", "/#journey", {
      locale: "it",
      scroll: false,
    });
  });

  it("keeps the hash when switching back to English, and the query string", async () => {
    const user = userEvent.setup();
    useLocale("it", "/?preview=1");
    window.history.replaceState(null, "", "/it?preview=1#forest");
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);

    await user.click(screen.getByRole("button", { name: "Passa a Inglese" }));

    expect(push).toHaveBeenCalledWith(
      "/?preview=1#forest",
      "/?preview=1#forest",
      {
        locale: "en",
        scroll: false,
      },
    );
  });

  it("does not add a hash when there is none", async () => {
    const user = userEvent.setup();
    useLocale("en", "/privacy");
    window.history.replaceState(null, "", "/privacy");
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);

    await user.click(screen.getByRole("button", { name: "Switch to Italian" }));

    expect(push).toHaveBeenCalledWith("/privacy", "/privacy", {
      locale: "it",
      scroll: false,
    });
  });

  it("replaces a stale hash from the page load with the live one", async () => {
    const user = userEvent.setup();
    useLocale("en", "/#forest");
    window.history.replaceState(null, "", "/#work");
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);

    await user.click(screen.getByRole("button", { name: "Switch to Italian" }));

    expect(push).toHaveBeenCalledWith("/#work", "/#work", {
      locale: "it",
      scroll: false,
    });
  });
});
