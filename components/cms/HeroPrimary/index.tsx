import { Container } from "@components/ions";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import styled from "styled-components";

const StyledDiv = styled.div`
  color: ${(props: any) => props.theme.colors.secondary};
`;

/**
 * Props for the HeroPrimary component.
 */
export interface HeroPrimaryProps {
  /**
   * The heading text for the hero.
   */
  heading: string;

  /**
   * The image props for the hero.
   */
  image: ImageProps;

  /**
   * The description text for the hero.
   */
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
        height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 245px)',
        position: "relative",
        width: "100%",
      }}
    >
      <Image alt={image.alt} priority src={image.url} fill style={{ objectFit:'cover' }} />
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
