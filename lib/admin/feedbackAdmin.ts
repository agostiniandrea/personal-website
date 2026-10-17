/* Shared by the admin feedback API and the admin page: the values the
   database allows, so the two can never disagree about them. They mirror the
   check constraints in supabase/schema.sql. */

export const FEEDBACK_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "implemented",
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_SOURCES = [
  "community",
  "usability_study",
  "self_review",
  "research_assisted",
  "analytics",
] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];

export const FEEDBACK_CATEGORIES = [
  "UX",
  "Accessibility",
  "Performance",
  "Design",
  "Content",
  "Bug",
  "General thoughts",
] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const ADMIN_PAGE_SIZE = 20;

/* Columns the admin list reads. Deliberately not `*`: the visitor's IP and the
   Prolific identifiers stay in the database and never reach the browser. */
export const ADMIN_FEEDBACK_COLUMNS =
  "id,category,message,name,email,linkedin,github,website,public_acknowledgment,status,source,trees_planted,attribution_source,attribution_campaign,created_at";

export interface AdminFeedbackRow {
  id: string;
  category: FeedbackCategory;
  message: string;
  name: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  public_acknowledgment: boolean;
  status: FeedbackStatus;
  source: FeedbackSource;
  trees_planted: number;
  attribution_source: string | null;
  attribution_campaign: string | null;
  created_at: string;
}

export interface AdminFeedbackList {
  items: AdminFeedbackRow[];
  total: number;
  page: number;
  pageSize: number;
  /* Whole-table totals per status, independent of the active filters, so the
     tabs always show how much is waiting. */
  counts: Record<FeedbackStatus, number>;
}

export const isFeedbackStatus = (value: unknown): value is FeedbackStatus =>
  typeof value === "string" &&
  (FEEDBACK_STATUSES as readonly string[]).includes(value);

export const isFeedbackSource = (value: unknown): value is FeedbackSource =>
  typeof value === "string" &&
  (FEEDBACK_SOURCES as readonly string[]).includes(value);

export const isFeedbackCategory = (value: unknown): value is FeedbackCategory =>
  typeof value === "string" &&
  (FEEDBACK_CATEGORIES as readonly string[]).includes(value);

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* What the admin home shows: who is signed in, and one entry per section. */
export interface AdminSummary {
  email: string;
  feedback: { counts: Record<FeedbackStatus, number> };
  /* Null when the cached Tree-Nation row cannot be read: the rest of the
     summary still loads. */
  forest: AdminForestSummary | null;
}

export interface AdminForestSummary {
  /* The last total synced from Tree-Nation (cached in forest_sync, never a
     live call from the admin). */
  treeCount: number;
  monthCount: number | null;
  syncedAt: string | null;
  /* Trees dedicated to feedback, and how many pieces of feedback earned them. */
  dedicatedTrees: number;
  contributions: number;
}

/* The admin sections, in navigation order. Adding a section is one entry here
   plus its page under pages/admin/. */
export const ADMIN_SECTIONS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/feedback", label: "Feedback" },
] as const;
