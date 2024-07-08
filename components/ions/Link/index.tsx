import NextLink, { LinkProps as NextLinkProps } from "next/link";
import styled, { Interpolation } from "styled-components";

export interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
  styles?: Interpolation<React.CSSProperties>;
  target: HTMLLinkElement["target"];
}

interface StyledLinkProps {
  styles?: LinkProps["styles"];
}

const StyledLink = styled.a<StyledLinkProps>`
  color: ${(props: any) => props.theme.colors.secondary};
  font-size: ${(props: any) => props.theme.fontSizes.font2};
  text-decoration: none;

  &:visited {
    color: ${(props: any) => props.theme.colors.secondary};
    text-decoration: none;
  }

  ${({ styles }) => styles}
`;

const Link: React.FC<LinkProps> = ({ href, target }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <StyledLink href={typeof href === 'string' ? href : ''} target={target} />
    </NextLink>
  );
};

export default Link;
