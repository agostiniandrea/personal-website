import { useRouter } from "next/router";

import styled, { css } from "styled-components";

import { Link } from "@components/ions";
import { toSpacing } from "@config/tokens";
import { BREAKPOINTS_BELOW, BUSINESS_DETAILS } from "@constants";
import { useI18n } from "@lib/utils/i18n";

export interface BusinessDetailsProps {
  /**
   * "inline" (footer): one centred line that wraps as needed.
   * "rows" (More sheet): three compact centred rows.
   */
  layout?: "inline" | "rows";
  className?: string;
}

/* The middle dot trails its own item, so when a line wraps a dot can end it
   but never start one. It is decorative and kept faint: the empty alternative
   text keeps screen readers from announcing it (the first `content` is the
   fallback for browsers without the alt syntax). */
const separator = css`
  content: "·";
  content: "·" / "";
  margin: 0 0.75em;
  opacity: 0.6;
`;

/* Small print, centred. Inline: 11px on desktop (the footer shows from the
   tablet breakpoint up), 12px below it. Rows (More sheet): 12px with tight
   leading and a 6px gap, so the three lines read as one quiet signature. */
const Address = styled.address<{ $rows: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.colors.paragraph};
  display: flex;
  flex-direction: ${({ $rows }) => ($rows ? "column" : "row")};
  flex-wrap: wrap;
  font-size: ${({ $rows, theme }) =>
    $rows ? theme.fontSizes.xs : "0.6875rem"};
  font-style: normal;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  justify-content: center;
  line-height: ${({ $rows, theme }) =>
    $rows ? "1.35" : theme.lineHeights.relaxed};
  margin: 0;
  max-width: 100%;
  row-gap: ${({ $rows }) => ($rows ? "0.375rem" : toSpacing("xs"))};
  text-align: center;

  ${({ $rows, theme }) =>
    !$rows &&
    css`
      @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
        font-size: ${theme.fontSizes.xs};
      }
    `}
`;

/* In "rows" each group is its own centred line. In "inline" the groups
   dissolve so every item flows in one wrapping line; the last item of a group
   then needs its own dot, because it is no longer last in its row. */
const Row = styled.span<{ $rows: boolean }>`
  align-items: center;
  display: ${({ $rows }) => ($rows ? "flex" : "contents")};
  flex-wrap: wrap;
  justify-content: center;

  ${({ $rows }) =>
    !$rows &&
    css`
      &:not(:last-child) > :last-child::after {
        ${separator}
      }
    `}
`;

const Item = styled.span`
  &:not(:last-child)::after {
    ${separator}
  }
`;

/* Short items stay whole. The address is the one long item: it is allowed to
   wrap so a narrow phone never gets a horizontal scrollbar. */
const NoWrapItem = styled(Item)`
  white-space: nowrap;
`;

/* Small print: the link keeps the text colour (the underline says it is a
   link) so it does not pull the eye; the accent only shows on hover. */
const EmailLink = styled.a`
  color: inherit;
  font-weight: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

/* Same treatment as the email link: small print that keeps the text colour. */
const PolicyLink = styled(Link)`
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-decoration: underline;
  text-underline-offset: 0.15em;

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  layout = "inline",
  className,
}) => {
  const router = useRouter();
  const t = useI18n(router.locale);
  const localeKey = router.locale === "it" ? "it" : "en";
  const { name, street, postalCode, city, country, email, kvk, vatId } =
    BUSINESS_DETAILS;
  const $rows = layout === "rows";

  return (
    <Address $rows={$rows} className={className}>
      <Row $rows={$rows}>
        <NoWrapItem>{name}</NoWrapItem>
        <Item>
          {street}, {postalCode} {city}, {country[localeKey]}
        </Item>
      </Row>
      <Row $rows={$rows}>
        <NoWrapItem>
          <EmailLink href={`mailto:${email}`}>{email}</EmailLink>
        </NoWrapItem>
      </Row>
      <Row $rows={$rows}>
        <NoWrapItem>
          {t.businessKvkLabel} {kvk}
        </NoWrapItem>
        <NoWrapItem>
          {t.businessVatLabel} {vatId}
        </NoWrapItem>
        <NoWrapItem>
          <PolicyLink href="/privacy">{t.privacyPolicyLink}</PolicyLink>
        </NoWrapItem>
      </Row>
    </Address>
  );
};

export default BusinessDetails;
