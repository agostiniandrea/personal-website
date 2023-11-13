import { Container, Link } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import styled from "styled-components";

const StyledHeader = styled.header`
  background: ${(props: any) => props.theme.colors.background};
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.body};
`;

export interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { isMobile } = useMedia();
  return (
    <StyledHeader style={{ height: isMobile ? "60px" : "120px" }}>
      <nav style={{ height: "100%", width: "100%" }}>
        <Container styles={{ height: "100%" }}>
          {isMobile ? (
            <div style={{ padding: "18px 0" }}>
              <p
                style={{
                  letterSpacing: "0.03em",
                  fontWeight: "bold",
                  fontSize: "30px",
                  margin: 0,
                }}
              >
                Alice Di Antonio
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
                <Link href="/">Alice Di Antonio</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginLeft: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/portfolio">Portfolio</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/viaggi">Viaggi</Link>
              </li>
              <li
                style={{
                  marginBottom: "auto",
                  marginTop: "auto",
                }}
              >
                <Link href="/chi-sono">Chi sono</Link>
              </li>
            </ul>
          )}
        </Container>
      </nav>
    </StyledHeader>
  );
};

export default Header;
