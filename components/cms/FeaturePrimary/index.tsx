import { Container } from "@components/ions";
import { HeadingBox } from "@components/molecules";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import styled from "styled-components";

const StyledSection = styled.section`
  color: ${(props: any) => props.theme.colors.background};
`;

export interface FeaturePrimaryProps {
  cta?: CtaProps;
  heading: string | null;
  image: ImageProps;
  description: string | null;
  preHeading: string | null;
}

const FeaturePrimary: React.FC<FeaturePrimaryProps> = ({
  image,
  ...restProps
}) => {
  const { isMobile } = useMedia();

  return (
    <Container verticalPadding>
      <StyledSection style={{ position: "relative" }}>
        <section
          style={{
            background: "gray",
            height: isMobile ? "400px" : "600px",
            position: "relative",
            width: "100%",
          }}
        >
          <Image alt={image.alt} priority src={image.url} fill />
        </section>
        <section style={{ position: "absolute", bottom: "24px" }}>
          <HeadingBox {...restProps} />
        </section>
      </StyledSection>
    </Container>
  );
};

export default FeaturePrimary;
