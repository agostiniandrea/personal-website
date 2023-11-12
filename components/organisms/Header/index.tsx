import { Container, Link } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import styled from "styled-components";

const StyledHeader = styled.footer`
  background: ${(props: any) => props.theme.colors.background};
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.body};
`;

export interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { isMobile } = useMedia();
  return (
    <StyledHeader style={{ height: isMobile ? "40px" : "60px" }}>
      <nav style={{ height: "100%", width: "100%" }}>
        <Container styles={{ height: "100%" }}>
          {isMobile ? (
            <div style={{ padding: "10px 0" }}>
              <p
                style={{
                  letterSpacing: "0.03em",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                Il nostro blog
              </p>
            </div>
          ) : (
            <ul
              style={{
                display: "flex",
                gap: "20px",
                height: "100%",
                listStyle: "none",
              }}
            >
              <li
                style={{
                  marginBottom: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/">Il nostro blog</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginLeft: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/reykjavik">Reykjavík</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/skogafoss">Skógafoss</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/thingvellir">Þingvellir</Link>
              </li>
            </ul>
          )}
        </Container>
      </nav>
    </StyledHeader>
  );
};

export default Header;
