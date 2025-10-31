import { Container, Flex } from "@components/ions";
import { CarbonBadge } from "@components/molecules";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const StyledFooter = styled.footer`
  background: ${({ theme }) => theme.colors.background};
`;

const StyledSocialLinks = styled(Flex)`
  height: 30px;
  text-align: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  gap: 15px;
`;

const StyledCarbonBadge = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0 0 0;
  min-height: 60px;
`;

const StyledCopyright = styled.p`
  padding-top: 1.5rem;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.body};
`;

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
  return (
    <StyledFooter role="contentinfo">
      <Container verticalPadding>
        <StyledSocialLinks>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Image
              alt="Instagram"
              src="/assets/icons/instagram.svg"
              height="30"
              width="30"
            />
          </Link>
          <Link
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <Image
              alt="TikTok"
              src="/assets/icons/tiktok.svg"
              height="30"
              width="30"
            />
          </Link>
        </StyledSocialLinks>
        <StyledCarbonBadge>
          <CarbonBadge />
        </StyledCarbonBadge>
        <StyledCopyright>
          {CURRENT_YEAR} © Made by Andrea Agostini
        </StyledCopyright>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
