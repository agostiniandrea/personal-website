import NextLink, { LinkProps as NextLinkProps } from "next/link";
import styled, { Interpolation } from "styled-components";

/**
 * Props for the Link component.
 */
export interface LinkProps extends NextLinkProps {
  /**
   * The content of the Link component.
   */
  children: React.ReactNode;

  /**
   * Additional styles for the Link component.
   */
  styles?: Interpolation<React.CSSProperties>;
}

/**
 * Props for the StyledLink component.
 */
interface StyledLinkProps {
  styles?: LinkProps["styles"];
}

const StyledLink = styled(NextLink)<StyledLinkProps>`
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.font2};
  text-decoration: none;

  &:visited {
    color: ${(props: any) => props.theme.colors.secondary};
    text-decoration: none;
  }

  ${({ styles }) => styles}
`;

const Link: React.FC<LinkProps> = ({ href, styles, children }) => {
  return (
    <StyledLink href={href} passHref styles={styles}>
      {children}
    </StyledLink>
  );
};

export default Link;
