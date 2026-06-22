import styled from "styled-components";
import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface ClosingCtaProps {
  heading: string;
  body: string;
  emailLabel: string;
  email: string;
  cvLabel?: string;
  cvUrl?: string;
}

const Wrapper = styled(Box)`
  text-align: center;
`;

const CtaHeading = styled(Heading).attrs({ size: "section", as: "h2" })`
  margin: 0 0 1rem;
`;

const CtaBody = styled(Text)`
  max-width: 480px;
  margin: 0 auto ${({ theme }) => theme.space["2xl"]};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const PrimaryButton = styled.a`
  display: inline-block;
  padding: 0.875rem 2rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: transparent;
    border-color: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.highlight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const SecondaryButton = styled.a`
  display: inline-block;
  padding: 0.875rem 2rem;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  color: ${({ theme }) => theme.colors.highlight};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.button_text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const ClosingCta: React.FC<ClosingCtaProps> = ({
  heading,
  body,
  emailLabel,
  email,
  cvLabel,
  cvUrl,
}) => (
  <Wrapper as="section" id="closing-cta" py="4xl">
    <Container>
      <CtaHeading>{heading}</CtaHeading>
      <CtaBody variant="large">{body}</CtaBody>
      <Flex gap="lg" wrap="wrap" justifyContent="center">
        <PrimaryButton href={`mailto:${email}`}>
          {emailLabel}
        </PrimaryButton>
        {cvLabel && cvUrl && (
          <SecondaryButton href={cvUrl} target="_blank" rel="noopener noreferrer">
            {cvLabel}
          </SecondaryButton>
        )}
      </Flex>
    </Container>
  </Wrapper>
);

export default ClosingCta;
