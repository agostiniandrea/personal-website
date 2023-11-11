import { Container } from "@components/ions";
import Link from "@components/ions/Link";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import styled from "styled-components";

const StyledDiv = styled.div`
  color: ${(props: any) => props.theme.colors.secondary};
`;

interface CtaProps {
  name: string;
  label: string;
  url: string;
}

export interface FeaturePrimaryProps {
  cta?: CtaProps;
  heading: string | null;
  image: ImageProps;
  description: string | null;
  preHeading: string | null;
}

const FeaturePrimary: React.FC<FeaturePrimaryProps> = ({
  cta,
  heading,
  image,
  description,
  preHeading,
}) => {
  const { isMobile } = useMedia();

  return (
    <Container>
      <StyledDiv style={{ position: "relative" }}>
        <div
          style={{
            background: "gray",
            height: isMobile ? "400px" : "600px",
            position: "relative",
            width: "100%",
          }}
        >
          <Image alt={image.alt} priority src={image.url} fill />
        </div>
        <div style={{ position: "absolute", bottom: "0" }}>
          <Container>
            <p>{preHeading}</p>
            <h2>{heading}</h2>
            <div>{description}</div>
            {cta && <Link href={cta.url}>{cta.label}</Link>}
          </Container>
        </div>
      </StyledDiv>
    </Container>
  );
};

export default FeaturePrimary;
