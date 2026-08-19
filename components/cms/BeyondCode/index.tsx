import { useRouter } from "next/router";

import styled from "styled-components";

import { Grid, Heading, Text } from "@components/ions";
import {
  Badge,
  ContextEyebrow,
  ContextSubtitle,
  DesktopSectionLabel,
  ExploreContext,
  Section,
} from "@components/molecules";
import { BREAKPOINTS_BELOW } from "@constants";
import { useI18n } from "@lib/utils/i18n";

import type { BeyondCodeProps } from "./model";

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    margin-bottom: 1.5rem;
  }
`;

const Intro = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["3xl"]};
  max-width: 680px;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    margin-bottom: 1.5rem;
  }
`;

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space["2xl"]}
    ${({ theme }) => theme.space.xl};

  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    padding: ${({ theme }) => theme.space.lg};
  }
`;

const CategoryLabel = styled.h3`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  margin: 0 0 ${({ theme }) => theme.space.lg};
  text-transform: uppercase;
`;

const CardDescription = styled(Text)`
  flex: 1;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const TagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const BeyondCode: React.FC<BeyondCodeProps> = ({
  sectionLabel,
  heading,
  intro,
  items,
}) => {
  const { locale } = useRouter();
  const t = useI18n(locale);

  return (
    <Section id="beyond-code">
      <ExploreContext />
      <ContextEyebrow>{t.moreBeyondCodeTitle}</ContextEyebrow>
      <DesktopSectionLabel aria-hidden="true">{sectionLabel}</DesktopSectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      <ContextSubtitle>{t.moreBeyondCodeSubtitle}</ContextSubtitle>
      {intro && <Intro variant="large">{intro}</Intro>}
        <Grid columns={[1, undefined, 2, 4]} gap="xl">
          {items.map((item) => (
            <Card key={item.category}>
              <CategoryLabel>{item.category}</CategoryLabel>
              <CardDescription variant="small">
                {item.description}
              </CardDescription>
              {item.tags && item.tags.length > 0 && (
                <TagList aria-label={`${item.category} tags`}>
                  {item.tags.map((tag) => (
                    <Badge key={tag} as="li" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </TagList>
              )}
            </Card>
          ))}
        </Grid>
    </Section>
  );
};

export default BeyondCode;
export type { BeyondCodeProps } from "./model";
