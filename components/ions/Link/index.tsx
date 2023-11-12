import NextLink, { LinkProps as NextLinkProps } from "next/link";
import styled from "styled-components";
import { Interpolation } from "styled-components/dist/types";

export interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
  styles?: Interpolation<React.CSSProperties>;
}

interface StyledLinkProps {
  styles?: LinkProps["styles"];
}

const StyledLink = styled.a<StyledLinkProps>`
  color: ${(props: any) => props.theme.colors.secondary};
  text-decoration: none;

  &:visited {
    color: ${(props: any) => props.theme.colors.secondary};
    text-decoration: none;
  }

  ${({ styles }) => styles}
`;

const Link: React.FC<LinkProps> = ({ href, ...props }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <StyledLink {...props} />
    </NextLink>
  );
};

export default Link;
