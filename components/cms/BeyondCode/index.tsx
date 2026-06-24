import styled from "styled-components";
import { Box, Container, Grid, Heading, Text } from "@components/ions";
import { Badge } from "@components/molecules";
import type { BeyondCodeProps } from "./model";

const SectionLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
`;

const Intro = styled(Text)`
  max-width: 680px;
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["3xl"]};
  @media (max-width: 1199px) {
    margin-bottom: ${({ theme }) => theme.space.xl};
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space["3xl"]} ${({ theme }) => theme.space["2xl"]};
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const CategoryLabel = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 ${({ theme }) => theme.space.lg};
`;

const CardDescription = styled(Text)`
  flex: 1;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const TagList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
`;

const BeyondCode: React.FC<BeyondCodeProps> = ({
  sectionLabel,
  heading,
  intro,
  items,
}) => (
  <Box as="section" id="beyond-code" py="3xl" mb="3xl" styles="@media (max-width: 1199px) { padding-top: 2rem; padding-bottom: 2rem; margin-bottom: 2rem; }">
    <Container>
      <SectionLabel aria-hidden="true">{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      {intro && <Intro variant="large">{intro}</Intro>}
      <Grid columns={[1, undefined, 2, undefined, 3]} gap="xl">
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
