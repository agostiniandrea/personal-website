import React from "react";
import styled from "styled-components";
import { Container } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface AboutProps {
  sectionLabel: string;
  heading: string;
  bio: string;
  location?: string;
  availability?: string;
}

const Section = styled.section`
  padding: 6rem 0;
`;

const SectionLabel = styled.p`
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 2.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  line-height: 1.1;
  margin: 0 0 2rem;
  max-width: 600px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 3.5rem;
  }
`;

const Bio = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.paragraph};
  line-height: 1.7;
  max-width: 680px;
  margin: 0 0 2.5rem;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: 0.875rem;
  border-radius: ${({ theme }) => theme.radii.full};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 1rem;
  }
`;

const About: React.FC<AboutProps> = ({
  sectionLabel,
  heading,
  bio,
  location,
  availability,
}) => {
  const tags = [location, availability].filter(Boolean) as string[];

  return (
    <Section>
      <Container>
        <SectionLabel>{sectionLabel}</SectionLabel>
        <Heading>{heading}</Heading>
        <Bio>{bio}</Bio>
        {tags.length > 0 && (
          <TagRow>
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        )}
      </Container>
    </Section>
  );
};

export default About;
