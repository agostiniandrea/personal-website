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

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => queryBuilder(),
      insert: (row: Row) => {
        inserted.push(row);
        return Promise.resolve({ error: insertError });
      },
    }),
  }),
}));

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
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  jest.spyOn(console, "error").mockImplementation(() => undefined);
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
