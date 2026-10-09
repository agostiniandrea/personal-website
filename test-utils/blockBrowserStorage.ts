/* Simulates a browser that refuses site data (blocked cookies, some private
   modes, some embedded browsers): reads and writes throw, as they do there.
   `area` limits it to one of the two stores. Undo with jest.restoreAllMocks(). */
type Area = "local" | "session" | "both";

export function blockBrowserStorage(area: Area = "both") {
  const originalGet = Storage.prototype.getItem;
  const originalSet = Storage.prototype.setItem;

  const isBlocked = (storage: Storage) =>
    area === "both" ||
    storage ===
      (area === "local" ? window.localStorage : window.sessionStorage);

  const deny = () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  };

  jest.spyOn(Storage.prototype, "getItem").mockImplementation(function (
    this: Storage,
    key: string,
  ) {
    if (isBlocked(this)) deny();
    return originalGet.call(this, key);
  });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(function (
    this: Storage,
    key: string,
    value: string,
  ) {
    if (isBlocked(this)) deny();
    return originalSet.call(this, key, value);
  });
}

/* An error thrown inside an event handler or effect does not fail a test by
   itself: React reports it on `window`. This collects those so a test can
   assert that none happened. */
export function captureUncaughtErrors() {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error);
    event.preventDefault();
  };
  window.addEventListener("error", onError);
  return {
    errors,
    stop: () => window.removeEventListener("error", onError),
  };
}
