import { useEffect, useState } from "react";

import Link from "next/link";

import styled from "styled-components";

import { TreeIcon } from "@components/molecules/ForestIcons";
import { AdminForestSummary, AdminSummary } from "@lib/admin/feedbackAdmin";
import { milestoneProgress } from "@lib/utils/forestMilestones";

/* The admin home: one card per section, with the number worth glancing at.
   Loads from /api/admin/summary, which checks the caller on every request. */

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space.md};
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
`;

const Card = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: ${({ theme }) => theme.radii.sm};
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.lg};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

const CardTitle = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Figure = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1;
`;

const Note = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

/* The forest, as a small treat at the top of the admin: the running total, a
   bar toward the next milestone, and the numbers behind it. Cached values from
   forest_sync, so it costs no Tree-Nation call. */
const ForestCard = styled.section`
  background: ${({ theme }) => theme.colors.button};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.button_text};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  grid-column: 1 / -1;
  padding: ${({ theme }) => theme.space.lg};
`;

const ForestLabel = styled.p`
  align-items: center;
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${({ theme }) => theme.space.xs};
  letter-spacing: 0.12em;
  margin: 0;
  opacity: 0.85;
  text-transform: uppercase;
`;

const ForestCount = styled.p`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  gap: ${({ theme }) => theme.space.sm};
  margin: 0;

  strong {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.md};
    opacity: 0.85;
  }
`;

const Track = styled.div`
  background: rgba(255, 255, 255, 0.22);
  border-radius: ${({ theme }) => theme.radii.full};
  height: 0.625rem;
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  background: #f3d68a;
  border-radius: ${({ theme }) => theme.radii.full};
  height: 100%;
  transition: width 0.6s ease-out;
  width: ${({ $pct }) => $pct}%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ForestNote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

const ForestFoot = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
  opacity: 0.8;
`;

/* In the browser's own timezone — wherever the admin is right now — and named,
   so "synced 10:30 GMT+7" cannot be misread. */
const formatSynced = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
  });

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const Forest: React.FC<{ forest: AdminForestSummary }> = ({ forest }) => {
  const { target, complete, pct } = milestoneProgress(forest.treeCount);
  const togo = target - forest.treeCount;
  const foot = [
    forest.monthCount != null && `+${forest.monthCount} this month`,
    forest.contributions > 0 &&
      `${plural(forest.dedicatedTrees, "tree")} dedicated to feedback`,
    forest.syncedAt && `synced ${formatSynced(forest.syncedAt)}`,
  ].filter(Boolean);

  return (
    <ForestCard aria-label="Forest">
      <ForestLabel>
        <TreeIcon size={16} />
        Forest
      </ForestLabel>
      <ForestCount>
        <strong>{forest.treeCount}</strong>
        <span>trees planted</span>
      </ForestCount>
      <Track
        role="progressbar"
        aria-label={`Progress to ${target} trees`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={forest.treeCount}
      >
        <Fill $pct={pct} />
      </Track>
      <ForestNote>
        {complete
          ? `Milestone reached: ${target} trees.`
          : `${plural(togo, "tree")} to go to the ${target} milestone.`}
      </ForestNote>
      {foot.length > 0 && <ForestFoot>{foot.join(" · ")}</ForestFoot>}
    </ForestCard>
  );
};

const Signed = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0 0 ${({ theme }) => theme.space.lg};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.headline};
  margin: 0;
`;

const AdminOverview: React.FC = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/summary", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          throw new Error(
            process.env.NODE_ENV === "development"
              ? "You are not signed in as an admin. Locally, set ADMIN_DEV_BYPASS=1 in .env.local and restart yarn dev."
              : "You are not signed in as an admin.",
          );
        }
        if (!response.ok) throw new Error("The summary could not be loaded.");
        return (await response.json()) as AdminSummary;
      })
      .then(setSummary)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error ? reason.message : "Something went wrong.",
        );
      });
    return () => controller.abort();
  }, []);

  if (error) return <ErrorText role="alert">{error}</ErrorText>;
  if (!summary) return <Note>Loading…</Note>;

  const { counts } = summary.feedback;
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <>
      <Signed>Signed in as {summary.email}</Signed>
      <Grid>
        {summary.forest && <Forest forest={summary.forest} />}
        <Card href="/admin/feedback">
          <CardTitle>Feedback</CardTitle>
          <Figure aria-label={`${counts.pending} pending`}>
            {counts.pending}
          </Figure>
          <Note>
            pending · {total} in total · {counts.implemented} implemented
          </Note>
        </Card>
      </Grid>
    </>
  );
};

export default AdminOverview;
