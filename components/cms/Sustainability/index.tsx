import styled from "styled-components";

import { Box, Container, Heading, Text } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

import type { SustainabilityProps } from "./model";

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

const SubHeading = styled.h3`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  margin: 0 0 ${({ theme }) => theme.space.xl};
  text-transform: uppercase;
`;

const ValuesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  padding: 0;
`;

const VolunteeringList = styled.ol`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const VolunteeringItem = styled.li`
  border-top: 1px solid ${({ theme }) => theme.colors.main};
  display: grid;
  gap: ${({ theme }) => theme.space.lg};
  grid-template-columns: 1fr;
  padding: ${({ theme }) => theme.space.xl} 0;

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space["2xl"]};
    grid-template-columns: 200px 1fr;
  }
`;

const OrgName = styled(Text)`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.25rem;
`;

const Period = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
`;

const Description = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
`;

const Sustainability: React.FC<SustainabilityProps> = ({
  sectionLabel,
  heading,
  intro,
  valuesHeading,
  values,
  volunteeringHeading,
  volunteeringItems,
}) => (
  <Box
    as="section"
    id="sustainability"
    py="3xl"
    styles="@media (max-width: 1199px) { padding-top: 2rem; padding-bottom: 2rem; }"
  >
    <Container>
      <SectionLabel aria-hidden="true">{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      <Intro variant="large">{intro}</Intro>

      {values.length > 0 && (
        <Box>
          {valuesHeading && <SubHeading>{valuesHeading}</SubHeading>}
          <ValuesList aria-label={valuesHeading ?? "Values"}>
            {values.map((value) => (
              <Badge key={value} as="li" size="md">
                {value}
              </Badge>
            ))}
          </ValuesList>
        </Box>
      )}

      {volunteeringItems.length > 0 && (
        <Box>
          {volunteeringHeading && (
            <SubHeading>{volunteeringHeading}</SubHeading>
          )}
          <VolunteeringList aria-label={volunteeringHeading ?? "Volunteering"}>
            {volunteeringItems.map((item) => (
              <VolunteeringItem key={`${item.organization}-${item.period}`}>
                <Box>
                  <OrgName>{item.organization}</OrgName>
                  <Period>{item.period}</Period>
                  {item.cause && (
                    <Box mt="sm">
                      <Badge size="sm">{item.cause}</Badge>
                    </Box>
                  )}
                </Box>
                <Description>{item.description}</Description>
              </VolunteeringItem>
            ))}
          </VolunteeringList>
        </Box>
      )}
    </Container>
  </Box>
);

export default Sustainability;
export type { SustainabilityProps } from "./model";
