import { Container } from "@components/ions";
import styled from "styled-components";

const StyledFooter = styled.footer`
  background: ${(props: any) => props.theme.colors.background};
  color: ${(props: any) => props.theme.colors.secondary};
`;

export interface FooterProps {
  /* heading: string;
  image: ImageProps;
  description: string; */
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <StyledFooter>
      <Container>
        <p>© Il nostro blog  2023</p>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
