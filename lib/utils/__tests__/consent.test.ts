import { CONSENT_KEY, readConsent, writeConsent } from "../consent";

const blockStorage = () => {
  const denied = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(denied);
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(denied);
};

describe("consent storage", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it("reads back what it wrote", () => {
    expect(readConsent()).toBeNull();
    expect(writeConsent("accepted")).toBe(true);
    expect(localStorage.getItem(CONSENT_KEY)).toBe("accepted");
    expect(readConsent()).toBe("accepted");
  });

  it("treats unreadable storage as no choice yet instead of throwing", () => {
    blockStorage();
    expect(() => readConsent()).not.toThrow();
    expect(readConsent()).toBeNull();
  });

  it("reports a failed write instead of throwing", () => {
    blockStorage();
    expect(() => writeConsent("rejected")).not.toThrow();
    expect(writeConsent("rejected")).toBe(false);
  });

  it("survives the storage object itself being inaccessible", () => {
    jest.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    expect(readConsent()).toBeNull();
    expect(writeConsent("custom")).toBe(false);
  });
});
