import {
  applyThemeChoice,
  PRE_HYDRATION_THEME_SCRIPT,
  readThemeChoice,
  THEME_CHOICES,
  THEME_STORAGE_KEY,
} from "../theme";

describe("theme choice", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("offers light, system and dark, with system between the extremes", () => {
    expect(THEME_CHOICES).toEqual(["light", "system", "dark"]);
  });

  it("reads system when no explicit choice was ever made", () => {
    expect(readThemeChoice()).toBe("system");
  });

  it.each(["light", "dark"] as const)(
    "stamps %s on the root and remembers it",
    (choice) => {
      applyThemeChoice(choice);
      expect(document.documentElement.getAttribute("data-theme")).toBe(choice);
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(choice);
      expect(readThemeChoice()).toBe(choice);
    },
  );

  /* The whole design rests on this: system is the absence of the attribute, so
     the prefers-color-scheme media query is what decides again. Leaving a
     data-theme behind would pin the palette and silently ignore the OS. */
  it("removes the attribute and the stored value when going back to system", () => {
    applyThemeChoice("dark");
    applyThemeChoice("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(readThemeChoice()).toBe("system");
  });

  it("still applies the choice when storage throws", () => {
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    expect(() => applyThemeChoice("dark")).not.toThrow();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    setItem.mockRestore();
  });

  it("ignores a value that is neither light nor dark", () => {
    document.documentElement.setAttribute("data-theme", "sepia");
    expect(readThemeChoice()).toBe("system");
  });

  describe("pre-hydration script", () => {
    const run = () => new Function(PRE_HYDRATION_THEME_SCRIPT)();

    it("restores a stored choice before paint", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      run();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("leaves the root untouched with nothing stored", () => {
      run();
      expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    });

    it("leaves the root untouched on a tampered value", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
      run();
      expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    });
  });
});
