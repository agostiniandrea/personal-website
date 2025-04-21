import { Container } from "@components/ions";
import { HeadingBox } from "@components/molecules";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import styled from "styled-components";

const StyledSection = styled.section`
  color: ${(props) => props.theme.colors.background};
`;

const StyledImage = styled(Image)`
  object-fit: cover;
`;

const StyledImageContainer = styled.section`
  background: gray;
  height: ${props => props.theme.space.xxl};
  position: relative;
  width: 100%;
`;

const StyledContentContainer = styled.section`
  position: absolute;
  bottom: 24px;
`;

/**
 * Represents the props for the FeaturePrimary component.
 */
export interface FeaturePrimaryProps {
  /**
   * The call-to-action props.
   */
  cta?: CtaProps;

  /**
   * The heading of the feature.
   */
  heading: string | null;

  /**
   * The image props for the feature.
   */
  image: ImageProps;

  /**
   * The description of the feature.
   */
  description: string | null;

  /**
   * The pre-heading of the feature.
   */
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
        <StyledImageContainer>
          <StyledImage
            alt={image.alt || "feature primary image"}
            src={image.url}
            fill
          />
        </StyledImageContainer>
        <StyledContentContainer>
          <HeadingBox {...restProps} />
        </StyledContentContainer>
      </StyledSection>
    </Container>
  );
};

export default FeaturePrimary;
