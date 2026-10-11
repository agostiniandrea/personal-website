import type { NextApiRequest, NextApiResponse } from "next";

import handler from "../../../pages/api/feedback";

/* The handler is exercised with a fake Supabase client: what matters here is
   which row it inserts and whether it revalidates, not the database. Lives
   under lib/ because jest's testMatch does not cover pages/. */

type Row = Record<string, unknown>;

let inserted: Row[] = [];
let recentCount = 0;
let insertError: { message: string } | null = null;

/* A thenable query builder: `.eq().gte()` chains end in `await`. */
const queryBuilder = () => {
  const builder = {
    eq: () => builder,
    gte: () => builder,
    then: (resolve: (value: { count: number }) => unknown) =>
      resolve({ count: recentCount }),
  };
  return builder;
};

/* A spy in front of the fake, so a test can also assert that the handler never
   even created a client (the content rules run before that). */
const mockCreateClient = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

const fakeClient = () => ({
  from: () => ({
    select: () => queryBuilder(),
    insert: (row: Row) => {
      inserted.push(row);
      return Promise.resolve({ error: insertError });
    },
  }),
});

const MESSAGE = "The Forest section is clear and the page loads quickly.";

const PROLIFIC = {
  prolificPid: "5f2a1b9c4d3e2f1a0b9c8d7e",
  studyId: "60d5f8a2b1c3d4e5f6a7b8c9",
  sessionId: "70e6a9b3c2d4e5f6a7b8c9d0",
};

const REDDIT = {
  source: "reddit",
  medium: "paid_social",
  campaign: "forest200",
  content: "hero-a",
  term: "trees",
};

const ATTRIBUTION_COLUMNS = [
  "attribution_source",
  "attribution_medium",
  "attribution_campaign",
  "attribution_content",
  "attribution_term",
] as const;

const post = async (body: Row) => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    revalidate: jest.fn().mockResolvedValue(undefined),
  };
  const req = {
    method: "POST",
    body: { category: "UX", message: MESSAGE, ...body },
    headers: { "x-forwarded-for": "203.0.113.7" },
    socket: { remoteAddress: "203.0.113.7" },
  };
  await handler(
    req as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

const lastRow = () => inserted[inserted.length - 1];

beforeEach(() => {
  inserted = [];
  recentCount = 0;
  insertError = null;
  mockCreateClient.mockReset();
  mockCreateClient.mockImplementation(() => fakeClient());
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("/api/feedback — attribution", () => {
  it("stores a Reddit visitor's attribution and keeps them community feedback", async () => {
    const res = await post({ attribution: REDDIT });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(inserted).toHaveLength(1);
    expect(lastRow()).toMatchObject({
      source: "community",
      attribution_source: "reddit",
      attribution_medium: "paid_social",
      attribution_campaign: "forest200",
      attribution_content: "hero-a",
      attribution_term: "trees",
    });
    expect(lastRow().prolific_pid).toBeNull();
  });

  it("still revalidates the Forest pages for an attributed community submission", async () => {
    const res = await post({ attribution: REDDIT });

    expect(res.revalidate).toHaveBeenCalledTimes(2);
    expect(res.revalidate).toHaveBeenCalledWith("/");
    expect(res.revalidate).toHaveBeenCalledWith("/it");
  });

  it("leaves every attribution field null when there is no UTM", async () => {
    await post({});

    expect(lastRow().source).toBe("community");
    for (const column of ATTRIBUTION_COLUMNS) {
      expect(lastRow()[column]).toBeNull();
    }
  });

  it("does not invent a direct source for an empty attribution", async () => {
    await post({ attribution: {} });

    for (const column of ATTRIBUTION_COLUMNS) {
      expect(lastRow()[column]).toBeNull();
    }
  });

  it("normalises the values it stores", async () => {
    await post({ attribution: { source: "  Reddit ", campaign: "Forest200" } });

    expect(lastRow()).toMatchObject({
      attribution_source: "reddit",
      attribution_campaign: "forest200",
      attribution_medium: null,
    });
  });

  it("drops malformed and oversized values field by field", async () => {
    await post({
      attribution: {
        source: "reddit",
        medium: "<script>alert(1)</script>",
        campaign: "c".repeat(101),
        content: "bad;value",
        term: "ok",
      },
    });

    expect(lastRow()).toMatchObject({
      source: "community",
      attribution_source: "reddit",
      attribution_medium: null,
      attribution_campaign: null,
      attribution_content: null,
      attribution_term: "ok",
    });
  });

  it.each([
    ["a string", "reddit"],
    ["an array", ["reddit"]],
    ["a number", 7],
    ["null", null],
  ])("ignores an attribution that is %s", async (_label, attribution) => {
    const res = await post({ attribution });

    expect(res.status).toHaveBeenCalledWith(200);
    for (const column of ATTRIBUTION_COLUMNS) {
      expect(lastRow()[column]).toBeNull();
    }
  });

  it("never lets attribution decide the source", async () => {
    await post({
      attribution: {
        source: "usability_study",
        medium: "analytics",
        campaign: "research_assisted",
        sourceType: "self_review",
        source_reference: "evil",
      },
    });

    expect(lastRow().source).toBe("community");
    expect(lastRow().source_reference).toBeUndefined();
    expect(lastRow().trees_planted).toBeUndefined();
    expect(lastRow().status).toBeUndefined();
  });

  it("ignores a client-supplied source", async () => {
    await post({ source: "analytics", attribution: REDDIT });

    expect(lastRow().source).toBe("community");
  });
});

describe("/api/feedback — Prolific", () => {
  it("stores no attribution for a study participant, even with UTM", async () => {
    await post({ prolific: PROLIFIC, attribution: REDDIT });

    expect(lastRow().source).toBe("usability_study");
    for (const column of ATTRIBUTION_COLUMNS) {
      expect(lastRow()[column]).toBeNull();
    }
  });

  it("keeps the study identifiers and source exactly as before", async () => {
    await post({ prolific: PROLIFIC, attribution: REDDIT });

    expect(lastRow()).toMatchObject({
      source: "usability_study",
      prolific_pid: PROLIFIC.prolificPid,
      prolific_study_id: PROLIFIC.studyId,
      prolific_session_id: PROLIFIC.sessionId,
    });
  });

  it("does not revalidate for a study submission", async () => {
    const res = await post({ prolific: PROLIFIC, attribution: REDDIT });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("de-duplicates by Prolific submission as it always did", async () => {
    recentCount = 1;
    const res = await post({ prolific: PROLIFIC });

    expect(res.status).toHaveBeenCalledWith(429);
    expect(inserted).toHaveLength(0);
  });

  it("treats a malformed pid as an ordinary visitor, attribution included", async () => {
    await post({
      prolific: { prolificPid: "{{%PROLIFIC_PID%}}" },
      attribution: REDDIT,
    });

    expect(lastRow().source).toBe("community");
    expect(lastRow().prolific_pid).toBeNull();
    expect(lastRow().attribution_source).toBe("reddit");
  });
});

describe("/api/feedback — existing behaviour", () => {
  it("rejects anything but POST", async () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handler(
      { method: "GET" } as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("rejects an unknown category and a too-short message", async () => {
    expect((await post({ category: "Nope" })).status).toHaveBeenCalledWith(400);
    expect((await post({ message: "short" })).status).toHaveBeenCalledWith(400);
    expect(inserted).toHaveLength(0);
  });

  it("swallows a honeypot submission without inserting", async () => {
    const res = await post({ _hp: "bot", attribution: REDDIT });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(inserted).toHaveLength(0);
  });

  it("keeps the 24h IP cooldown for ordinary visitors", async () => {
    recentCount = 1;
    const res = await post({ attribution: REDDIT });

    expect(res.status).toHaveBeenCalledWith(429);
    expect(inserted).toHaveLength(0);
  });

  it("inserts the same fields as before alongside the new ones", async () => {
    await post({ name: " Ada ", email: "ada@example.com" });

    expect(lastRow()).toMatchObject({
      category: "UX",
      message: MESSAGE,
      name: "Ada",
      email: "ada@example.com",
      public_acknowledgment: false,
      source: "community",
      prolific_pid: null,
      ip: "203.0.113.7",
    });
  });

  it("answers 500 and does not revalidate when the insert fails", async () => {
    insertError = { message: "boom" };
    const res = await post({ attribution: REDDIT });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.revalidate).not.toHaveBeenCalled();
  });
});

/* ---------------------------------------------------------------------------
 * Content rules and limits
 * ------------------------------------------------------------------------- */

const REFUSED = {
  error: "This message can't be accepted.",
  code: "content_rejected",
};

/* One clearly abusive message per rule. Every one must get the same answer. */
const ABUSIVE_BY_RULE: [string, string][] = [
  ["slur", "this faggot website is trash and so are you"],
  ["threat", "I will kill you if you do not take this site down"],
  ["sexual abuse", "send nudes and then I will tell you what I think"],
  [
    "directed abuse",
    "easily vibecoded 5 mins shit, it looks like an ai slop and im sick of it, at least put in some effort u dumbfuck",
  ],
  [
    "link spam",
    "buy now a.com/x b.com/y c.com/z d.com/w and more at www.e.com/deals",
  ],
  ["personal hostility (you suck)", "the layout is slow and honestly you suck"],
  ["personal hostility (I hate you)", "I hate you so much, delete this site"],
  ["personal hostility (clause)", "I hate you, honestly. The menu is fine."],
];

const loggedText = () =>
  [console.warn, console.error, console.log, console.info]
    .flatMap((fn) => (fn as jest.Mock).mock?.calls ?? [])
    .map((args: unknown[]) => args.map(String).join(" "))
    .join("\n");

describe("/api/feedback — content rules", () => {
  it.each(ABUSIVE_BY_RULE)(
    "refuses a %s message with the one generic 400 and stores nothing",
    async (_rule, message) => {
      const res = await post({ message });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(REFUSED);
      expect(inserted).toHaveLength(0);
      expect(res.revalidate).not.toHaveBeenCalled();
    },
  );

  it("refuses before any Supabase client exists, any query runs or the cooldown is touched", async () => {
    recentCount = 1;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const res = await post({ message: ABUSIVE_BY_RULE[3][1] });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status).not.toHaveBeenCalledWith(429);
    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("applies the same rules to a study participant", async () => {
    const res = await post({
      prolific: PROLIFIC,
      message: ABUSIVE_BY_RULE[0][1],
    });

    expect(res.json).toHaveBeenCalledWith(REFUSED);
    expect(inserted).toHaveLength(0);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("refuses abuse in the name, not only in the message", async () => {
    const res = await post({ name: "I will kill you" });

    expect(res.json).toHaveBeenCalledWith(REFUSED);
    expect(inserted).toHaveLength(0);
  });

  it("still lets the honeypot win: a bot gets its silent success, nothing is stored", async () => {
    const res = await post({ _hp: "bot", message: ABUSIVE_BY_RULE[0][1] });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(inserted).toHaveLength(0);
  });

  it("never echoes the matched text and never logs the message", async () => {
    const MARKER = "zq7marker";
    const SLUR = "faggot";
    const res = await post({
      message: `${MARKER} you ${SLUR} I will kill you ${MARKER}`,
      name: `Name${MARKER}`,
    });

    expect(res.status).toHaveBeenCalledWith(400);
    const answered = JSON.stringify((res.json as jest.Mock).mock.calls);
    for (const text of [MARKER, SLUR, "kill"]) {
      expect(answered).not.toContain(text);
      expect(loggedText()).not.toContain(text);
    }
    // A reason code is all the log carries.
    expect(loggedText()).toMatch(/refused by content rules: (slur|threat)/);
  });

  it.each([
    "this navigation sucks and the menu does not open",
    "I hate this navigation, it hides the projects page",
    "How do you suck the colour out of this image in CSS?",
  ])(
    "accepts criticism and technical questions that use the same verbs: %s",
    async (message) => {
      const res = await post({ message });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(lastRow().message).toBe(message);
    },
  );

  it("accepts harsh but constructive criticism untouched", async () => {
    const message =
      "easily vibecoded in 5 mins, it looks like ai slop and im sick of it, at least put in some effort";
    const res = await post({ message });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(lastRow().message).toBe(message);
    expect(loggedText()).not.toContain("moderation flag");
  });

  describe("profanity that is not abuse", () => {
    const SWEARING = "The contrast is shit and the navigation is slow.";

    it("is stored as an ordinary pending community submission", async () => {
      const res = await post({ message: SWEARING });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(lastRow()).toMatchObject({
        message: SWEARING,
        source: "community",
      });
      /* No status, no trees: the database defaults ('pending', 0) apply, as
         for every submission. The flag approves nothing and rewards nothing. */
      expect(lastRow()).not.toHaveProperty("status");
      expect(lastRow()).not.toHaveProperty("trees_planted");
    });

    it("keeps attribution, revalidation and the cooldown exactly as before", async () => {
      const res = await post({ message: SWEARING, attribution: REDDIT });

      expect(lastRow().attribution_source).toBe("reddit");
      expect(res.revalidate).toHaveBeenCalledWith("/");
      expect(res.revalidate).toHaveBeenCalledWith("/it");

      recentCount = 1;
      const again = await post({ message: SWEARING });
      expect(again.status).toHaveBeenCalledWith(429);
    });

    it("keeps study identifiers and the no-revalidation rule for a participant", async () => {
      const res = await post({ message: SWEARING, prolific: PROLIFIC });

      expect(lastRow()).toMatchObject({
        source: "usability_study",
        prolific_session_id: PROLIFIC.sessionId,
      });
      expect(res.revalidate).not.toHaveBeenCalled();
    });

    it("notes the flag by reason code only, once the row is stored", async () => {
      await post({ message: SWEARING });

      expect(loggedText()).toContain(
        "stored with a moderation flag: profanity",
      );
      expect(loggedText()).not.toContain("contrast");
    });

    it("does not note a flag for a submission that was not stored", async () => {
      insertError = { message: "boom" };
      await post({ message: SWEARING });

      expect(loggedText()).not.toContain("moderation flag");
    });
  });
});

describe("/api/feedback — limits", () => {
  const url = (prefix: string, length: number) =>
    prefix + "a".repeat(length - prefix.length);

  it("accepts a message of exactly 2000 characters and refuses 2001", async () => {
    expect(
      (await post({ message: "x".repeat(2000) })).status,
    ).toHaveBeenCalledWith(200);

    const tooLong = await post({ message: "x".repeat(2001) });
    expect(tooLong.status).toHaveBeenCalledWith(400);
    expect(tooLong.json).toHaveBeenCalledWith({ error: "Message is too long" });
    expect(inserted).toHaveLength(1);
  });

  it("measures the message after trimming, as the minimum does", async () => {
    const res = await post({ message: `   ${"x".repeat(2000)}   ` });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(lastRow().message).toBe("x".repeat(2000));
  });

  it("keeps the existing 100-character name limit", async () => {
    expect((await post({ name: "n".repeat(100) })).status).toHaveBeenCalledWith(
      200,
    );
    const res = await post({ name: "n".repeat(101) });
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid name" });
  });

  it("limits an e-mail address to 254 characters", async () => {
    const at = (length: number) => `${"a".repeat(length - 6)}@a.com`;

    expect((await post({ email: at(254) })).status).toHaveBeenCalledWith(200);
    const res = await post({ email: at(255) });
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid email" });
  });

  it("limits each optional link to 2048 characters", async () => {
    const linkedin = "https://www.linkedin.com/in/";
    const github = "https://github.com/";
    const website = "https://example.com/";

    expect(
      (await post({ linkedin: url(linkedin, 2048) })).status,
    ).toHaveBeenCalledWith(200);
    expect(
      (await post({ github: url(github, 2048) })).status,
    ).toHaveBeenCalledWith(200);
    expect(
      (await post({ website: url(website, 2048) })).status,
    ).toHaveBeenCalledWith(200);

    expect(
      (await post({ linkedin: url(linkedin, 2049) })).json,
    ).toHaveBeenCalledWith({
      error: "Invalid LinkedIn URL",
    });
    expect(
      (await post({ github: url(github, 2049) })).json,
    ).toHaveBeenCalledWith({
      error: "Invalid GitHub URL",
    });
    expect(
      (await post({ website: url(website, 2049) })).json,
    ).toHaveBeenCalledWith({
      error: "Invalid website URL",
    });
  });
});

describe("/api/feedback — malformed requests", () => {
  const rawPost = async (body: unknown) => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      revalidate: jest.fn().mockResolvedValue(undefined),
    };
    await handler(
      {
        method: "POST",
        body,
        headers: {},
        socket: { remoteAddress: "203.0.113.7" },
      } as unknown as NextApiRequest,
      res as unknown as NextApiResponse,
    );
    return res;
  };

  it.each([undefined, null, "just a string", 42, []])(
    "answers 400 for a body of %p",
    async (body) => {
      const res = await rawPost(body);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(inserted).toHaveLength(0);
    },
  );

  it.each([
    ["an array", ["I will kill you"]],
    ["a number", 1e30],
    ["an object", { toString: () => "I will kill you" }],
  ])(
    "treats a message that is %s as too short, never as text",
    async (_t, message) => {
      const res = await rawPost({ category: "UX", message });

      expect(res.json).toHaveBeenCalledWith({ error: "Message is too short" });
      expect(inserted).toHaveLength(0);
    },
  );

  it.each([{ first: "Ada" }, ["Ada"], 7, true])(
    "refuses a non-text name: %p",
    async (name) => {
      const res = await rawPost({ category: "UX", message: MESSAGE, name });

      expect(res.json).toHaveBeenCalledWith({ error: "Invalid name" });
      expect(inserted).toHaveLength(0);
    },
  );

  it.each([
    ["email", { a: 1 }],
    ["email", ["a@b.co"]],
    ["website", { a: 1 }],
    ["linkedin", 5],
    ["github", []],
  ])("refuses a non-text %s", async (field, value) => {
    const res = await rawPost({
      category: "UX",
      message: MESSAGE,
      [field]: value,
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(inserted).toHaveLength(0);
  });

  it("does not let a malformed attribution or study object break moderation", async () => {
    const res = await rawPost({
      category: "UX",
      message: MESSAGE,
      attribution: "utm_source=reddit",
      prolific: 7,
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(lastRow().source).toBe("community");
  });
});
