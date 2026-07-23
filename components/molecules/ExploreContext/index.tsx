import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { useI18n } from "@lib/utils/i18n";
import { OPEN_MOBILE_EXPLORE_EVENT } from "@lib/utils/mobileNav";

import SectionLabel from "../SectionLabel";

const BackButton = styled.button`
  align-items: center;
  background: none;
  border: 0;
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  display: inline-flex;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin: 0 0 ${({ theme }) => theme.space.xl};
  min-height: 44px;
  padding: 0;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

export const ContextSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.base};
  margin: -0.75rem 0 ${({ theme }) => theme.space.xl};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

export const ContextEyebrow = styled(SectionLabel)`
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

export const DesktopSectionLabel = styled(SectionLabel)`
  display: none;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: block;
  }
`;

const ExploreContext: React.FC = () => {
  const { locale } = useRouter();
  const t = useI18n(locale);

  return (
    <BackButton
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_MOBILE_EXPLORE_EVENT))}
    >
      {`← ${t.moreTitle}`}
    </BackButton>
  );
};

export default ExploreContext;
