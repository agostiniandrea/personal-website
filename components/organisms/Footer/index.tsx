import { Container } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background: ${({theme}) => theme.colors.background};
  color: ${({theme}) => theme.colors.text};
  padding: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({theme}) => theme.colors.text};
`;

const StyledSocialLinks = styled.section`
  height: 30px;
  text-align: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  gap: 15px;
`;

const StyledCopyright = styled.p`
  padding-top: ${props => props.theme.space.xl};
  text-align: center;
  font-size: ${props => props.theme.fontSizes.body};
`;

/* export interface FooterProps {
  heading: string;
  image: ImageProps;
  description: string;
} */

const Footer: React.FC = () => {
  const { isMobile } = useMedia();
  return (
    <FooterContainer>
      <Container verticalPadding>
        <StyledSocialLinks>
          <Link
            href="https://www.instagram.com/alice.diantonio/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              alt="Instagram"
              src="/assets/icons/instagram.svg"
              height="30"
              width="30"
            />
          </Link>
          <Link
            href="https://www.tiktok.com/@alicediantonio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              alt="TikTok"
              src="/assets/icons/tiktok.svg"
              height="30"
              width="30"
            />
          </Link>
        </StyledSocialLinks>
        <StyledCopyright>
          {new Date().getFullYear()} © Il sito di Alice Di Antonio
        </StyledCopyright>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
