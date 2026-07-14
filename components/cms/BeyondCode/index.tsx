import styled from "styled-components";

import { Box, Container, Grid, Heading, Text } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";

import type { BeyondCodeProps } from "./model";

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
  @media (max-width: 1199px) {
    margin-bottom: 1.5rem;
  }
`;

const Intro = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["3xl"]};
  max-width: 680px;
  @media (max-width: 1199px) {
    margin-bottom: 1.5rem;
  }
`;

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space["3xl"]} ${({ theme }) => theme.space["2xl"]};
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
}) => (
  <Box as="section" id="beyond-code" py="3xl" styles="@media (max-width: 1199px) { padding-top: 2rem; padding-bottom: 2rem; }">
    <Container>
      <SectionLabel aria-hidden="true">{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      {intro && <Intro variant="large">{intro}</Intro>}
      <Grid columns={[1, undefined, 2, 4]} gap="xl">
        {items.map((item) => (
          <Card key={item.category}>
            <CategoryLabel>{item.category}</CategoryLabel>
            <CardDescription variant="small">{item.description}</CardDescription>
            {item.tags && item.tags.length > 0 && (
              <TagList aria-label={`${item.category} tags`}>
                {item.tags.map((tag) => (
                  <Badge key={tag} as="li" size="sm">{tag}</Badge>
                ))}
              </TagList>
            )}
          </Card>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default BeyondCode;
export type { BeyondCodeProps } from "./model";
