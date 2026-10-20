import { useCallback, useEffect, useState } from "react";

import styled from "styled-components";

import { TreeIcon } from "@components/molecules/ForestIcons";
import {
  AdminFeedbackList,
  AdminFeedbackRow,
  canEarnTrees,
  FEEDBACK_CATEGORIES,
  FEEDBACK_SOURCES,
  FEEDBACK_STATUSES,
  FeedbackStatus,
  TREES_PER_AWARD,
} from "@lib/admin/feedbackAdmin";

/* The admin's view of the feedback table: what came in, and what to do with
   it. All data goes through /api/admin/feedback, which checks the caller on
   every request; this component holds no secret and trusts nothing it shows. */

const ENDPOINT = "/api/admin/feedback";

type Filter<T extends string> = T | "";

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  implemented: "Implemented",
};

const SOURCE_LABEL: Record<string, string> = {
  community: "Community",
  usability_study: "Usability study",
  self_review: "Self review",
  research_assisted: "Research assisted",
  analytics: "Analytics",
};

const Board = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
`;

const Tab = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.button : "transparent"};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.button : "rgba(128, 128, 128, 0.3)"};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.button_text : theme.colors.headline};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  min-height: 36px;
  padding: 0 ${({ theme }) => theme.space.md};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.md};
`;

/* The native arrow hugs the right edge and ignores the field's padding, so it
   is drawn instead: appearance off, and a chevron that sits as far from the
   right edge as the text sits from the left. It takes the text colour, so it
   follows light and dark. */
const SelectWrap = styled.span`
  display: inline-flex;
  position: relative;

  &::after {
    border-bottom: 2px solid currentColor;
    border-right: 2px solid currentColor;
    color: ${({ theme }) => theme.colors.paragraph};
    content: "";
    height: 0.45rem;
    pointer-events: none;
    position: absolute;
    right: ${({ theme }) => theme.space.md};
    top: 50%;
    transform: translateY(-70%) rotate(45deg);
    width: 0.45rem;
  }
`;

const Select = styled.select`
  appearance: none;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-height: 36px;
  /* Same inset on both sides: the chevron sits one step from the right edge
     as the text does from the left, with room so the two never touch. */
  padding: 0 calc(${({ theme }) => theme.space.md} * 2 + 0.45rem) 0
    ${({ theme }) => theme.space.md};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Card = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.lg};
`;

const BADGE_COLOR: Record<FeedbackStatus, string> = {
  pending: "#d6a22d",
  accepted: "#2f9e8f",
  rejected: "#c8654a",
  implemented: "#4f9d5d",
};

const StatusBadge = styled.span<{ $status: FeedbackStatus }>`
  align-items: center;
  color: ${({ $status }) => BADGE_COLOR[$status]};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.4rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &::before {
    background: currentColor;
    border-radius: 50%;
    content: "";
    height: 0.5rem;
    width: 0.5rem;
  }
`;

const CardHeader = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  justify-content: space-between;
`;

const Meta = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  display: flex;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  gap: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
  margin: 0;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.base};
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

/* Trees earned by a piece of feedback, drawn as trees: one icon each up to a
   handful, then a "+N" so a big gift never overflows the card. */
const TreesRow = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  gap: ${({ theme }) => theme.space.sm};
  margin: 0;
`;

const TreeIcons = styled.span`
  display: inline-flex;
  gap: 0.125rem;
`;

const MAX_TREE_ICONS = 6;

const Trees: React.FC<{ count: number }> = ({ count }) => (
  <TreesRow>
    <TreeIcons aria-hidden="true">
      {Array.from({ length: Math.min(count, MAX_TREE_ICONS) }, (_, index) => (
        <TreeIcon key={index} size={18} />
      ))}
      {count > MAX_TREE_ICONS && <strong>+{count - MAX_TREE_ICONS}</strong>}
    </TreeIcons>
    <span>
      {count} tree{count === 1 ? "" : "s"} planted for this
    </span>
  </TreesRow>
);

const Contact = styled.details`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  summary {
    cursor: pointer;
  }

  dl {
    display: grid;
    gap: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
    grid-template-columns: max-content 1fr;
    margin: ${({ theme }) => theme.space.sm} 0 0;
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const Actions = styled.div`
  align-items: center;
  border-top: 1px solid rgba(128, 128, 128, 0.16);
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  padding-top: ${({ theme }) => theme.space.md};
`;

const ActionsLabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-right: ${({ theme }) => theme.space.xs};
`;

const ActionButton = styled.button<{ $current: boolean }>`
  background: ${({ $current, theme }) =>
    $current ? theme.colors.badgeBg : "transparent"};
  border: 1px solid
    ${({ $current, theme }) =>
      $current ? theme.colors.highlight : "rgba(128, 128, 128, 0.3)"};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ $current, theme }) =>
    $current ? theme.colors.highlight : theme.colors.headline};
  cursor: ${({ $current }) => ($current ? "default" : "pointer")};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  min-height: 36px;
  padding: 0 ${({ theme }) => theme.space.md};

  &:disabled {
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

/* Before the award: two grey trees, the pair a rewarded feedback earns (one
   for the author, one matched by the site owner). They are always drawn, but
   only clickable once the feedback is accepted or implemented. After the
   award they turn green (see Trees) and the control is gone: it is not
   undone from here. */
const AwardRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
`;

const AwardButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px dashed rgba(128, 128, 128, 0.5);
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  display: inline-flex;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  gap: ${({ theme }) => theme.space.sm};
  min-height: 36px;
  padding: 0 ${({ theme }) => theme.space.md};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

const GreyTrees = styled.span`
  display: inline-flex;
  gap: 0.125rem;
`;

const AwardHint = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

interface TreeAwardProps {
  row: AdminFeedbackRow;
  busy: boolean;
  confirming: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const TreeAward: React.FC<TreeAwardProps> = ({
  row,
  busy,
  confirming,
  onAsk,
  onCancel,
  onConfirm,
}) => {
  if (row.trees_planted > 0) return <Trees count={row.trees_planted} />;

  if (confirming) {
    return (
      <AwardRow role="group" aria-label="Confirm trees">
        <AwardHint>
          Assign {TREES_PER_AWARD} trees to this feedback? It can&apos;t be
          undone from here.
        </AwardHint>
        <ActionButton
          type="button"
          $current={false}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Assigning…" : "Confirm"}
        </ActionButton>
        <ActionButton
          type="button"
          $current={false}
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </ActionButton>
      </AwardRow>
    );
  }

  const eligible = canEarnTrees(row.status);
  return (
    <AwardRow>
      <AwardButton
        type="button"
        disabled={!eligible || busy}
        onClick={onAsk}
        aria-label={`Assign ${TREES_PER_AWARD} trees`}
      >
        <GreyTrees aria-hidden="true">
          {Array.from({ length: TREES_PER_AWARD }, (_, index) => (
            <TreeIcon key={index} size={18} />
          ))}
        </GreyTrees>
        Assign trees
      </AwardButton>
      <AwardHint>
        {eligible
          ? "One for the author, one matched by you."
          : "Available once the feedback is accepted or implemented."}
      </AwardHint>
    </AwardRow>
  );
};

const Pager = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.colors.paragraph};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  gap: ${({ theme }) => theme.space.md};
`;

const Notice = styled.p<{ $error?: boolean }>`
  color: ${({ $error, theme }) =>
    $error ? theme.colors.headline : theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 0;
`;

/* Times are shown in the timezone of the browser, i.e. wherever the admin is
   right now (Bangkok today, somewhere else next month), with the zone named so
   a time is never ambiguous. */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
    year: "numeric",
  });

const AdminFeedbackBoard: React.FC = () => {
  const [status, setStatus] = useState<Filter<FeedbackStatus>>("pending");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminFeedbackList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  /* The feedback whose tree award is waiting for a second click. */
  const [confirmId, setConfirmId] = useState<string | null>(null);
  /* Bumped after a save so the tabs' counts and the filtered list reload. */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    if (category) params.set("category", category);

    setLoading(true);
    fetch(`${ENDPOINT}?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          throw new Error(
            process.env.NODE_ENV === "development"
              ? "You are not signed in as an admin. Locally, set ADMIN_DEV_BYPASS=1 in .env.local and restart yarn dev."
              : "You are not signed in as an admin.",
          );
        }
        if (!response.ok) throw new Error("The list could not be loaded.");
        return (await response.json()) as AdminFeedbackList;
      })
      .then((list) => {
        setData(list);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error ? reason.message : "Something went wrong.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, source, category, page, reloadKey]);

  const changeStatus = useCallback(
    async (row: AdminFeedbackRow, next: FeedbackStatus) => {
      if (row.status === next) return;
      setSavingId(row.id);
      setError(null);
      try {
        const response = await fetch(ENDPOINT, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id, status: next }),
        });
        if (response.status === 409) {
          throw new Error(
            "This feedback already earned trees, so it has to stay accepted or implemented.",
          );
        }
        if (!response.ok) throw new Error("The change was not saved.");
        setReloadKey((key) => key + 1);
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "The change was not saved.",
        );
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  const assignTrees = useCallback(async (row: AdminFeedbackRow) => {
    setSavingId(row.id);
    setError(null);
    try {
      const response = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, assignTrees: true }),
      });
      if (response.status === 409) {
        throw new Error(
          "These trees can't be assigned: the feedback is not accepted or implemented, or already has them.",
        );
      }
      if (!response.ok) throw new Error("The trees were not assigned.");
      setConfirmId(null);
      setReloadKey((key) => key + 1);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The trees were not assigned.",
      );
    } finally {
      setSavingId(null);
    }
  }, []);

  const pageCount = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;
  const resetPage = () => setPage(1);
  const total = data
    ? FEEDBACK_STATUSES.reduce((sum, value) => sum + data.counts[value], 0)
    : 0;

  return (
    <Board>
      <Tabs role="group" aria-label="Filter by status">
        <Tab
          type="button"
          $active={status === ""}
          aria-pressed={status === ""}
          onClick={() => {
            setStatus("");
            resetPage();
          }}
        >
          All{data ? ` (${total})` : ""}
        </Tab>
        {FEEDBACK_STATUSES.map((value) => (
          <Tab
            key={value}
            type="button"
            $active={status === value}
            aria-pressed={status === value}
            onClick={() => {
              setStatus(value);
              resetPage();
            }}
          >
            {STATUS_LABEL[value]}
            {data ? ` (${data.counts[value]})` : ""}
          </Tab>
        ))}
      </Tabs>

      <Filters>
        <SelectWrap>
          <Select
            aria-label="Filter by source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              resetPage();
            }}
          >
            <option value="">All sources</option>
            {FEEDBACK_SOURCES.map((value) => (
              <option key={value} value={value}>
                {SOURCE_LABEL[value]}
              </option>
            ))}
          </Select>
        </SelectWrap>
        <SelectWrap>
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              resetPage();
            }}
          >
            <option value="">All categories</option>
            {FEEDBACK_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </SelectWrap>
      </Filters>

      {error && (
        <Notice $error role="alert">
          {error}
        </Notice>
      )}
      {loading && !data && <Notice>Loading…</Notice>}
      {data && data.items.length === 0 && !loading && (
        <Notice>Nothing here with these filters.</Notice>
      )}

      {data && data.items.length > 0 && (
        <List aria-busy={loading}>
          {data.items.map((row) => (
            <Card key={row.id}>
              <CardHeader>
                <StatusBadge $status={row.status}>
                  {STATUS_LABEL[row.status]}
                </StatusBadge>
                <Meta as="span">{formatDate(row.created_at)}</Meta>
              </CardHeader>
              <Meta>
                <strong>{row.category}</strong>
                <span>{SOURCE_LABEL[row.source] ?? row.source}</span>
                {row.attribution_source && (
                  <span>
                    via {row.attribution_source}
                    {row.attribution_campaign
                      ? ` / ${row.attribution_campaign}`
                      : ""}
                  </span>
                )}
              </Meta>
              <Message>{row.message}</Message>
              <TreeAward
                row={row}
                busy={savingId === row.id}
                confirming={confirmId === row.id}
                onAsk={() => setConfirmId(row.id)}
                onCancel={() => setConfirmId(null)}
                onConfirm={() => assignTrees(row)}
              />
              {(row.name ||
                row.email ||
                row.linkedin ||
                row.github ||
                row.website) && (
                <Contact>
                  <summary>
                    {row.name ?? "Contact details"}
                    {row.public_acknowledgment ? " · agreed to be named" : ""}
                  </summary>
                  <dl>
                    {row.email && (
                      <>
                        <dt>Email</dt>
                        <dd>{row.email}</dd>
                      </>
                    )}
                    {row.linkedin && (
                      <>
                        <dt>LinkedIn</dt>
                        <dd>{row.linkedin}</dd>
                      </>
                    )}
                    {row.github && (
                      <>
                        <dt>GitHub</dt>
                        <dd>{row.github}</dd>
                      </>
                    )}
                    {row.website && (
                      <>
                        <dt>Website</dt>
                        <dd>{row.website}</dd>
                      </>
                    )}
                  </dl>
                </Contact>
              )}
              <Actions role="group" aria-label="Set status">
                <ActionsLabel aria-hidden="true">Move to</ActionsLabel>
                {FEEDBACK_STATUSES.map((value) => (
                  <ActionButton
                    key={value}
                    type="button"
                    $current={row.status === value}
                    aria-pressed={row.status === value}
                    disabled={
                      savingId === row.id ||
                      (row.trees_planted > 0 && !canEarnTrees(value))
                    }
                    title={
                      row.trees_planted > 0 && !canEarnTrees(value)
                        ? "Trees were assigned, so this feedback has to stay accepted or implemented"
                        : undefined
                    }
                    onClick={() => changeStatus(row, value)}
                  >
                    {STATUS_LABEL[value]}
                  </ActionButton>
                ))}
              </Actions>
            </Card>
          ))}
        </List>
      )}

      {data && pageCount > 1 && (
        <Pager>
          <ActionButton
            type="button"
            $current={false}
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </ActionButton>
          <span>
            Page {page} of {pageCount}
          </span>
          <ActionButton
            type="button"
            $current={false}
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </ActionButton>
        </Pager>
      )}
    </Board>
  );
};

export default AdminFeedbackBoard;
