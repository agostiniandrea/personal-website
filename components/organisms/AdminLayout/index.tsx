import Link from "next/link";

import styled from "styled-components";

import { Seo } from "@components/atoms";
import { Container } from "@components/ions";
import { ADMIN_SECTIONS } from "@lib/admin/feedbackAdmin";

/* Frame shared by every admin page: the section navigation and a reading
   column. Private, so it is noindex and has no site header or footer. */

interface AdminLayoutProps {
  /** Path of the section being shown, to mark it in the navigation. */
  current: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Main = styled.main`
  padding: ${({ theme }) => theme.space["2xl"]} 0
    ${({ theme }) => theme.space["3xl"]};
`;

/* The same width as the public site (the Container caps it at 1440px), so the
   admin uses a desktop screen instead of sitting in a narrow strip. A definite
   width, so every admin page has the same frame when you switch tabs. */
const Column = styled.div`
  width: 100%;
`;

const Bar = styled.header`
  align-items: baseline;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.xl};
  margin-bottom: ${({ theme }) => theme.space.xl};
  padding-bottom: ${({ theme }) => theme.space.md};
`;

const Brand = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.lg};
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.highlight : "transparent")};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.headline : theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.space.xs} 0;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: ${({ theme }) => theme.space.sm} 0 0;
`;

const Intro = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const AdminLayout: React.FC<AdminLayoutProps> = ({
  current,
  title,
  description,
  children,
}) => (
  <>
    <Seo noindex nofollow seoTitle={`Admin · ${title}`} />
    <Main id="main-content">
      <Container>
        <Column>
          <Bar>
            <Brand>Admin</Brand>
            <Nav aria-label="Admin sections">
              {ADMIN_SECTIONS.map(({ href, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  $active={current === href}
                  aria-current={current === href ? "page" : undefined}
                >
                  {label}
                </NavLink>
              ))}
            </Nav>
          </Bar>
          <Intro>
            <Title>{title}</Title>
            {description && <Description>{description}</Description>}
          </Intro>
          {children}
        </Column>
      </Container>
    </Main>
  </>
);

export default AdminLayout;
