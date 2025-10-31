"use client";

import { BREAKPOINTS } from "@constants";
import { AspectRatio, Container } from "@components/ions";
import Image from "next/image";
import styled from "styled-components";

const StyledImage = styled(Image)`
  object-fit: cover;
`;

// Array format: [default, mobile, tablet, desktop]
type ResponsiveSizes = [string, string, string, string] | [string, string, string] | [string, string] | [string];

/**
 * Helper to convert responsive sizes array to CSS sizes string for Next.js Image
 * Format: [default, mobile (≥600px), tablet (≥1200px), desktop (≥1536px)]
 */
const getResponsiveSizes = (sizes: ResponsiveSizes): string => {
  const parts: string[] = [];

  // Default (index 0) - always first
  if (sizes[0]) {
    parts.push(`(max-width: ${BREAKPOINTS.mobile}) ${sizes[0]}`);
  }

  // Mobile (index 1) - ≥600px
  if (sizes[1]) {
    parts.push(`(max-width: ${BREAKPOINTS.tablet}) ${sizes[1]}`);
  }

  // Tablet (index 2) - ≥1200px
  if (sizes[2]) {
    parts.push(`(max-width: ${BREAKPOINTS.desktop}) ${sizes[2]}`);
  }

  // Desktop (index 3) - ≥1536px (fallback)
  if (sizes[3]) {
    parts.push(sizes[3]);
  } else {
    // Use last defined value as fallback
    for (let i = sizes.length - 1; i >= 0; i--) {
      if (sizes[i] !== undefined && sizes[i] !== null) {
        parts.push(sizes[i]);
        break;
      }
    }
  }

  return parts.join(", ");
};

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

  /**
   * Responsive sizes for the image.
   * Array format: [default, mobile (≥600px), tablet (≥1200px), desktop (≥1536px)]
   * Defaults to: ["100vw", "100vw", "100vw", "922px"]
   */
  sizes?: ResponsiveSizes;
}

const HeroPrimary: React.FC<HeroPrimaryProps> = ({
  heading,
  image,
  description,
  sizes = ["100vw", "100vw", "100vw", "922px"],
}) => (
  <Container fullBleed={[true, true, false]}>
    <AspectRatio boxSize="3840:2880">
      <StyledImage
        alt={image.alt || "hero primary image"}
        priority
        fetchPriority="high"
        src={image.url}
        fill
        sizes={getResponsiveSizes(sizes)}
        quality={85}
      />
    </AspectRatio>
    <h1>{heading}</h1>
    <p>{description}</p>
  </Container>
);

export default HeroPrimary;
