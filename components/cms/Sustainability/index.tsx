import styled from "styled-components";
import { Box, Container, Heading, Text } from "@components/ions";
import { Badge, CarbonBadge } from "@components/molecules";
import { BREAKPOINTS } from "@constants";
import type { SustainabilityProps } from "./model";

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
`;

const SubHeading = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 ${({ theme }) => theme.space.xl};
`;

const ValuesList = styled.ul`
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
`;

const VolunteeringList = styled.ol`
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const VolunteeringItem = styled.li`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.space.lg};
  padding: ${({ theme }) => theme.space["2xl"]} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.main};

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: 200px 1fr;
    gap: ${({ theme }) => theme.space["2xl"]};
  }
`;

const OrgName = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.25rem;
  color: ${({ theme }) => theme.colors.headline};
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

const CarbonBadgeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
  padding-top: ${({ theme }) => theme.space["2xl"]};
  border-top: 1px solid ${({ theme }) => theme.colors.main};
`;

const CarbonBadgeLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 480px;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const Sustainability: React.FC<SustainabilityProps> = ({
  sectionLabel,
  heading,
  intro,
  valuesHeading,
  values,
  volunteeringHeading,
  volunteeringItems,
  showCarbonBadge,
  carbonBadgeLabel,
}) => (
  <Box as="section" id="sustainability" my="4xl">
    <Container>
      <SectionLabel aria-hidden="true">{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      <Intro variant="large">{intro}</Intro>

      {values.length > 0 && (
        <Box mb="3xl">
          {valuesHeading && <SubHeading>{valuesHeading}</SubHeading>}
          <ValuesList aria-label={valuesHeading ?? "Values"}>
            {values.map((value) => (
              <Badge key={value} as="li" size="md">{value}</Badge>
            ))}
          </ValuesList>
        </Box>
      )}

      {volunteeringItems.length > 0 && (
        <Box mb="3xl">
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

      {showCarbonBadge && (
        <CarbonBadgeWrapper>
          {carbonBadgeLabel && (
            <CarbonBadgeLabel>{carbonBadgeLabel}</CarbonBadgeLabel>
          )}
          <CarbonBadge />
        </CarbonBadgeWrapper>
      )}
    </Container>
  </Box>
);

export default Sustainability;
export type { SustainabilityProps } from "./model";
