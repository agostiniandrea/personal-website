import { historyEntryState } from "../mobileNav";

describe("historyEntryState", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("keeps Next's `as` in step with the URL being written", () => {
    window.history.replaceState(
      { __N: true, as: "/it#forest", url: "/" },
      "",
      "/it#forest",
    );

    expect(historyEntryState({ mobileView: "work" }, "/it#work")).toEqual({
      __N: true,
      as: "/it#work",
      mobileView: "work",
      url: "/",
    });
  });

  it("lets the extra fields override the copied ones", () => {
    window.history.replaceState({ as: "/", mobileView: "home" }, "", "/");

    expect(historyEntryState({ mobileView: "forest" }, "/#forest")).toEqual(
      expect.objectContaining({ mobileView: "forest" }),
    );
  });

  it("does not invent an `as` when there is no Next state", () => {
    window.history.replaceState({ mobileView: "home" }, "", "/");

    expect(historyEntryState({ mobileView: "work" }, "/#work")).toEqual({
      mobileView: "work",
    });
  });

  it("copes with an empty history state", () => {
    window.history.replaceState(null, "", "/");

    expect(historyEntryState({ mobileView: "work" }, "/#work")).toEqual({
      mobileView: "work",
    });
  });
});
