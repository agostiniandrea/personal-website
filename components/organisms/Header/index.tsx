import { Link } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import styled from "styled-components";

const StyledHeader = styled.footer`
  background: ${(props: any) => props.theme.colors.background};
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.body};
`;

export interface HeaderProps {
  /* heading: string;
  image: ImageProps;
  description: string; */
}

const Header: React.FC<HeaderProps> = (
  {
    /* heading,
  image,
  description, */
  }
) => {
  const { isMobile } = useMedia();
  return (
    <StyledHeader style={{ height: isMobile ? "40px" : "60px" }}>
      <nav style={{ height: "100%", width: "100%" }}>
        {isMobile ? (
          <div style={{ padding: "10px 24px" }}>
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
              margin: 0,
              padding: "0 24px",
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
              <Link href="https://www.codecademy.com/catalog">Catalog</Link>
            </li>
            <li
              style={{
                marginBottom: "auto",
                marginTop: "auto",
              }}
            >
              <span title="Resources" className="dropdown">
                Resources
              </span>
            </li>
            <li
              style={{
                marginBottom: "auto",
                marginTop: "auto",
              }}
            >
              <span title="Community" className="dropdown">
                Community
              </span>
            </li>
          </ul>
        )}
      </nav>
    </StyledHeader>
  );
};

export default Header;
