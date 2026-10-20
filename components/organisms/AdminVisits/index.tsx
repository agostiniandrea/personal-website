import { useEffect, useState } from "react";

import styled from "styled-components";

import { AdminAnalytics, AdminAnalyticsMonth } from "@lib/admin/analyticsAdmin";

/* The visits card of the admin overview: users per month from Google
   Analytics, plus shortcuts to GA4 and Clarity. Loads from
   /api/admin/analytics on its own, so a slow or missing Google answer never
   delays the feedback and forest numbers next to it. */

const GA_URL = "https://analytics.google.com/analytics/web/";
const clarityUrl = () => {
  const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  return id
    ? `https://clarity.microsoft.com/projects/view/${encodeURIComponent(id)}/dashboard`
    : "https://clarity.microsoft.com/";
};

const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.lg};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const Headline = styled.p`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  gap: ${({ theme }) => theme.space.sm};
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.highlight};
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
  }

  span {
    color: ${({ theme }) => theme.colors.paragraph};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const Note = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`;

/* One series, so no legend: the card title and the headline name it. Bars are
   anchored to the baseline, rounded only at the data end, with a gap between
   them; the month still in progress is paler so it is not read as a drop. */
const Chart = styled.div`
  align-items: stretch;
  border-bottom: 1px solid rgba(128, 128, 128, 0.35);
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  height: 7rem;
  margin-top: ${({ theme }) => theme.space.sm};
`;

const Column = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.25rem;
`;

const Bar = styled.div<{ $pct: number; $partial: boolean }>`
  background: ${({ theme }) => theme.colors.highlight};
  border-radius: 4px 4px 0 0;
  height: ${({ $pct }) => $pct}%;
  min-height: 2px;
  opacity: ${({ $partial }) => ($partial ? 0.55 : 1)};
  width: 100%;
`;

const Labels = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};

  span {
    color: ${({ theme }) => theme.colors.paragraph};
    flex: 1;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    text-align: center;
  }
`;

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  margin-top: ${({ theme }) => theme.space.xs};
`;

const LinkButton = styled.a`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.md};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.button_text};
    }
  }
`;

const monthName = (month: string, style: "short" | "long" = "short") =>
  new Date(`${month}-01T00:00:00Z`).toLocaleString("en-GB", {
    month: style,
    timeZone: "UTC",
    ...(style === "long" ? { year: "numeric" } : {}),
  });

const plural = (count: number, word: string) =>
  `${count.toLocaleString("en-GB")} ${word}${count === 1 ? "" : "s"}`;

const describe = (month: AdminAnalyticsMonth) =>
  `${monthName(month.month, "long")}: ${plural(month.users, "user")}, ${plural(
    month.sessions,
    "session",
  )}, ${plural(month.pageViews, "page view")}`;

const Months: React.FC<{ months: AdminAnalyticsMonth[] }> = ({ months }) => {
  const max = Math.max(...months.map((month) => month.users), 1);
  const current = months[months.length - 1];
  const previous = months[months.length - 2];
  const last = months.length - 1;

  return (
    <>
      <Headline>
        <strong>{current.users.toLocaleString("en-GB")}</strong>
        <span>users in {monthName(current.month)} so far</span>
      </Headline>
      <Note>
        {plural(current.sessions, "session")} ·{" "}
        {plural(current.pageViews, "page view")}
        {previous &&
          ` · ${plural(previous.users, "user")} in ${monthName(previous.month)}`}
      </Note>
      <Chart
        role="img"
        aria-label={`Users per month. ${months.map(describe).join(". ")}.`}
      >
        {months.map((month, index) => (
          <Column key={month.month} title={describe(month)}>
            {index === last || month.users === max ? (
              <Value>{month.users.toLocaleString("en-GB")}</Value>
            ) : null}
            <Bar $pct={(month.users / max) * 100} $partial={index === last} />
          </Column>
        ))}
      </Chart>
      <Labels aria-hidden="true">
        {months.map((month) => (
          <span key={month.month}>{monthName(month.month)}</span>
        ))}
      </Labels>
    </>
  );
};

const AdminVisits: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/analytics", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as Partial<AdminAnalytics>;
        const known = ["ok", "not_configured", "error"];
        return known.includes(body.status ?? "")
          ? (body as AdminAnalytics)
          : ({ status: "error" } as const);
      })
      .then(setAnalytics)
      .catch(() => {
        if (!controller.signal.aborted) setAnalytics({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  return (
    <Card aria-label="Visits">
      <Title>Visits</Title>
      {analytics === null && <Note>Loading…</Note>}
      {analytics?.status === "ok" && <Months months={analytics.months} />}
      {analytics?.status === "not_configured" && (
        <Note>
          Google Analytics is not connected yet: set GA4_PROPERTY_ID and
          GA4_SERVICE_ACCOUNT_JSON (see the README).
        </Note>
      )}
      {analytics?.status === "error" && (
        <Note role="alert">
          Google Analytics did not answer. Check the service account and the
          property access.
        </Note>
      )}
      {analytics?.status === "ok" && (
        <Note>
          Counts only visitors who accepted analytics cookies, so the real
          traffic is higher.
        </Note>
      )}
      <Links>
        <LinkButton href={GA_URL} target="_blank" rel="noopener noreferrer">
          Open Google Analytics
        </LinkButton>
        <LinkButton
          href={clarityUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Clarity
        </LinkButton>
      </Links>
    </Card>
  );
};

export default AdminVisits;
