import { Container, Link } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import styled, { Interpolation } from "styled-components";

const StyledHeader = styled.header<HeaderProps>`
  background: ${(props: any) => props.theme.colors.background};
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.body};

  ${({ styles }) => styles}
`;

/**
 * Props for the Header component.
 */
export interface HeaderProps {
  styles?: Interpolation<React.CSSProperties>;
}

const Header: React.FC<HeaderProps> = ({ styles }) => {
  const { isMobile } = useMedia();
  return (
    <StyledHeader
      styles={styles}
    >
      <nav style={{ height: "100%", width: "100%" }}>
        <Container verticalPadding>
          {isMobile ? (
            <div >
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
             {/*  <li
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
              </li> */}
            </ul>
          )}
        </Container>
      </nav>
    </StyledHeader>
  );
};

export default Header;
