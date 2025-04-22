import { Container, Link } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import styled, { Interpolation } from "styled-components";

const StyledHeader = styled.header<{ styles?: Interpolation<React.CSSProperties> }>`
  background: ${({theme}) => theme.colors.background};
  color: ${({theme}) => theme.colors.paragraph};
  padding: 1rem;
  position: relative;
  z-index: 1;
  ${({ styles }) => styles}
`;

const StyledNav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const StyledList = styled.ul`
  display: flex;
  gap: 20px;
  list-style: none;
`;

const StyledListItem = styled.li`
  margin-bottom: auto;
  margin-top: auto;
`;

const StyledLogo = styled.p`
  letter-spacing: 0.03em;
  font-weight: bold;
  font-size: 30px;
  margin: 0;
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
    <StyledHeader styles={styles}>
      <StyledNav>
        <Container verticalPadding>
          {isMobile ? (
            <div>
              <StyledLogo>Alice Di Antonio</StyledLogo>
            </div>
          ) : (
            <StyledList>
              <StyledListItem>
                <Link href="/">Alice Di Antonio</Link>
              </StyledListItem>
            </StyledList>
          )}
        </Container>
      </StyledNav>
    </StyledHeader>
  );
};

export default Header;
