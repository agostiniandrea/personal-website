import React from "react";
import Image from "next/image";
import styled from "styled-components";
import { Box, Container, Flex, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface HeroPortfolioProps {
  greeting: string;
  personName: string;
  role: string;
  tagline: string;
  image: ImageProps;
  ctaPrimaryLabel: string;
  ctaPrimaryUrl: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
}

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 5rem 0;
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 3rem;
  align-items: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    gap: 4rem;
  }
`;

const TextBlock = styled(Box)`
  flex: 1;
  text-align: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    text-align: left;
  }
`;

const Greeting = styled.p`
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  margin: 0 0 1rem;
`;

const Name = styled.h1`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 3.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  line-height: 1;
  margin: 0 0 1rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 5rem;
  }
`;

const Role = styled.p`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.normal};
  color: ${({ theme }) => theme.colors.highlight};
  line-height: 1.2;
  margin: 0 0 1.5rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 2rem;
  }
`;

const Tagline = styled(Text)`
  max-width: 500px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    margin: 0 0 2.5rem;
  }
`;

const PrimaryLink = styled.a`
  display: inline-block;
  padding: 0.875rem 2rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: 1rem;
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const SecondaryLink = styled.a`
  display: inline-block;
  padding: 0.875rem 2rem;
  border: 2px solid ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: 1rem;
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.button};
    color: ${({ theme }) => theme.colors.button_text};
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.highlight};
  background: ${({ theme }) => theme.colors.stroke};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    width: 380px;
    height: 380px;
  }
`;

const HeroPortfolio: React.FC<HeroPortfolioProps> = ({
  greeting,
  personName,
  role,
  tagline,
  image,
  ctaPrimaryLabel,
  ctaPrimaryUrl,
  ctaSecondaryLabel,
  ctaSecondaryUrl,
}) => (
  <Section>
    <Container>
      <Grid>
        <TextBlock>
          <Greeting>{greeting}</Greeting>
          <Name>{personName}</Name>
          <Role>{role}</Role>
          <Tagline variant="large">{tagline}</Tagline>
          <Flex
            gap="lg"
            wrap="wrap"
            justifyContent={["center", undefined, "flex-start"]}
          >
            <PrimaryLink href={ctaPrimaryUrl}>{ctaPrimaryLabel}</PrimaryLink>
            {ctaSecondaryLabel && ctaSecondaryUrl && (
              <SecondaryLink href={ctaSecondaryUrl}>
                {ctaSecondaryLabel}
              </SecondaryLink>
            )}
          </Flex>
        </TextBlock>
        <PhotoWrapper>
          <Image
            src={image.url}
            alt={image.alt || personName}
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes={`(max-width: ${BREAKPOINTS.tablet}) 240px, 380px`}
          />
        </PhotoWrapper>
      </Grid>
    </Container>
  </Section>
);

export default HeroPortfolio;
