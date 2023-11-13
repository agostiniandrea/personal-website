import { Container } from "@components/ions";
import styled from "styled-components";

const StyledFooter = styled.footer`
  background: ${(props: any) => props.theme.colors.background};
  border-top: 3px solid ${(props: any) => props.theme.colors.secondary};
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
      <Container verticalPadding>
        <p> 2023 © Il nostro blog </p>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
