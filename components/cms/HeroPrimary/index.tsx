import { Container } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import styled from "styled-components";

const StyledDiv = styled.div`
  color: ${(props: any) => props.theme.colors.secondary};
`;

export interface HeroPrimaryProps {
  heading: string;
  image: ImageProps;
  description: string;
}

const HeroPrimary: React.FC<HeroPrimaryProps> = ({
  heading,
  image,
  description,
}) => {
  const { isMobile } = useMedia();

  return (
    <StyledDiv
      style={{
        background: "gray",
        height: isMobile ? "400px" : "600px",
        position: "relative",
        width: "100%",
      }}
    >
      <Image alt={image.alt} priority src={image.url} fill />
      {/* <div style={{ position: "absolute", bottom: 0 }}> */}
      <Container>
        <h1>{heading}</h1>
        <p>{description}</p>
      </Container>
      {/* </div> */}
    </StyledDiv>
  );
};

export default HeroPrimary;
