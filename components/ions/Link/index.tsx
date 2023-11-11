import NextLink, { LinkProps as NextLinkProps } from "next/link";
import styled from "styled-components";

const StyledLink = styled.a`
  color: ${(props: any) => props.theme.colors.secondary};
  text-decoration: none;

  &:visited {
    color: ${(props: any) => props.theme.colors.secondary};
    text-decoration: none;
  }
`;

export interface LinkProps extends NextLinkProps {
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, ...props }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <StyledLink {...props} />
    </NextLink>
  );
};

export default Link;
