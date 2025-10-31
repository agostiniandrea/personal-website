"use client";

import { AspectRatio, Container } from "@components/ions";
import Image from "next/image";
import styled from "styled-components";

const StyledImage = styled(Image)`
  object-fit: cover;
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
}) => (
  <Container fullBleed={[true, true, false]}>
    <AspectRatio boxSize="3840:2880">
      <StyledImage
        alt={image.alt || "hero primary image"}
        priority
        fetchPriority="high"
        src={image.url}
        fill
        sizes="100vw"
      />
    </AspectRatio>
    <h1>{heading}</h1>
    <p>{description}</p>
  </Container>
);

export default HeroPrimary;
