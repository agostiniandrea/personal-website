import {
  captureProlificSession,
  getProlificCompletionUrl,
  getProlificSession,
  parseProlificSession,
  PROLIFIC_STORAGE_KEY,
} from "../prolific";

const PID = "5f2a1b9c4d3e2f1a0b9c8d7e";
const STUDY = "60d5f8a2b1c3d4e5f6a7b8c9";
const SESSION = "70e6a9b3c2d4e5f6a7b8c9d0";
const FULL_SEARCH = `?PROLIFIC_PID=${PID}&STUDY_ID=${STUDY}&SESSION_ID=${SESSION}`;

/* jsdom gives a real sessionStorage but keeps it between tests. */
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("parseProlificSession", () => {
  it("reads all three identifiers", () => {
    expect(parseProlificSession(FULL_SEARCH)).toEqual({
      prolificPid: PID,
      studyId: STUDY,
      sessionId: SESSION,
    });
  });

  it("returns null for an ordinary visit", () => {
    expect(parseProlificSession("")).toBeNull();
    expect(parseProlificSession("?utm_source=linkedin")).toBeNull();
  });

  it("keeps the participant when only the pid arrives", () => {
    expect(parseProlificSession(`?PROLIFIC_PID=${PID}`)).toEqual({
      prolificPid: PID,
    });
  });

  it("ignores identifiers that are not shaped like ids", () => {
    const parsed = parseProlificSession(
      `?PROLIFIC_PID=${PID}&STUDY_ID=${"x".repeat(65)}&SESSION_ID=has%20space`,
    );
    expect(parsed).toEqual({ prolificPid: PID });
  });

  /* Opening the configured study link outside Prolific leaves the placeholders
     unsubstituted; that must not read as a participant. */
  it("rejects Prolific's unsubstituted placeholder", () => {
    expect(
      parseProlificSession("?PROLIFIC_PID={{%PROLIFIC_PID%}}"),
    ).toBeNull();
  });

  it("rejects an empty pid", () => {
    expect(parseProlificSession("?PROLIFIC_PID=")).toBeNull();
  });
});

describe("captureProlificSession", () => {
  it("stores the session for the tab", () => {
    window.history.replaceState({}, "", `/${FULL_SEARCH}`);
    const captured = captureProlificSession();

    expect(captured).toEqual({
      prolificPid: PID,
      studyId: STUDY,
      sessionId: SESSION,
    });
    expect(getProlificSession()).toEqual(captured);
  });

  it("writes nothing on an ordinary visit", () => {
    captureProlificSession();

    expect(sessionStorage.getItem(PROLIFIC_STORAGE_KEY)).toBeNull();
    expect(getProlificSession()).toBeNull();
  });

  /* Navigating around the site can land on a URL without the parameters; the
     ids captured on arrival have to survive that. */
  it("keeps a stored session when the parameters are gone", () => {
    window.history.replaceState({}, "", `/${FULL_SEARCH}`);
    captureProlificSession();

    window.history.replaceState({}, "", "/#forest");
    expect(captureProlificSession()).toEqual({
      prolificPid: PID,
      studyId: STUDY,
      sessionId: SESSION,
    });
  });

  it("replaces the stored session for a different participant", () => {
    window.history.replaceState({}, "", `/${FULL_SEARCH}`);
    captureProlificSession();

    const otherPid = "80f7b0c4d3e5f6a7b8c9d0e1";
    window.history.replaceState({}, "", `/?PROLIFIC_PID=${otherPid}`);

    expect(captureProlificSession()).toEqual({ prolificPid: otherPid });
    expect(getProlificSession()).toEqual({ prolificPid: otherPid });
  });
});

describe("getProlificSession", () => {
  it("discards a hand-edited entry", () => {
    sessionStorage.setItem(PROLIFIC_STORAGE_KEY, "not json");
    expect(getProlificSession()).toBeNull();

    sessionStorage.setItem(
      PROLIFIC_STORAGE_KEY,
      JSON.stringify({ prolificPid: "bad pid" }),
    );
    expect(getProlificSession()).toBeNull();
  });

  it("drops a bad companion id but keeps the participant", () => {
    sessionStorage.setItem(
      PROLIFIC_STORAGE_KEY,
      JSON.stringify({ prolificPid: PID, sessionId: "not a session id" }),
    );
    expect(getProlificSession()).toEqual({ prolificPid: PID });
  });
});

describe("getProlificCompletionUrl", () => {
  const original = process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = original;
  });

  it("returns the configured completion URL", () => {
    const url = "https://app.prolific.com/submissions/complete?cc=ABC123";
    process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = url;
    expect(getProlificCompletionUrl()).toBe(url);
  });

  it("returns null when no study is running", () => {
    delete process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL;
    expect(getProlificCompletionUrl()).toBeNull();
  });

  it("refuses anything that is not an https URL", () => {
    process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = "javascript:alert(1)";
    expect(getProlificCompletionUrl()).toBeNull();

    process.env.NEXT_PUBLIC_PROLIFIC_COMPLETION_URL = "app.prolific.com/x";
    expect(getProlificCompletionUrl()).toBeNull();
  });
});
