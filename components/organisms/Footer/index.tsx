import { Container } from "@components/ions";
import { theme } from "@config/theme";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const StyledFooter = styled.footer`
  background: ${(props: any) => props.theme.colors.background};
  box-shadow: 0px 3px 0px 0px ${(props: any) => props.theme.colors.secondary}
    inset;
  color: ${(props: any) => props.theme.colors.secondary};
`;

export interface FooterProps {
  /* heading: string;
  image: ImageProps;
  description: string; */
}

const Footer: React.FC<FooterProps> = () => {
  const { isMobile } = useMedia();
  return (
    <StyledFooter>
      <Container verticalPadding>
        <section
          style={{
            height: "30px",
            textAlign: "center",
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
            gap: "15px",
          }}
        >
          <Link
            href="https://www.instagram.com/alice.diantonio/"
            target="_blank"
          >
            <Image
              alt="Instagram"
              src="/assets/icons/instagram.svg"
              height="30"
              width="30"
            />
          </Link>
          <Link href="https://www.tiktok.com/@alicediantonio" target="_blank">
            <Image
              alt="TikTok"
              src="/assets/icons/tiktok.svg"
              height="30"
              width="30"
            />
          </Link>
        </section>
        <p
          style={{
            paddingTop: isMobile ? theme.space.lg: theme.space.xxl,
            textAlign: "center",
          }}
        >
          {new Date().getFullYear()} © Il sito di Alice Di Antonio
        </p>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
