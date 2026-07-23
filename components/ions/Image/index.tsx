import React from "react";

import NextImage from "next/image";

import styled from "styled-components";

/* Named distinctly so it does not shadow the global CMS `ImageProps`
   (lib/global/index.d.ts), which describes a Contentful asset, not this
   component's props. */
export interface ImageComponentProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  longDescription?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  onLoad?: () => void;
}

const ImageWrapper = styled.figure<{ $fill?: boolean }>`
  margin: 0;
  padding: 0;
  position: relative;
  ${({ $fill }) => $fill && "width: 100%; height: 100%;"}
`;

const FigCaption = styled.figcaption`
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const Image: React.FC<ImageComponentProps> = ({
  src,
  alt,
  style,
  className,
  longDescription,
  loading = "lazy",
  width,
  height,
  priority = false,
  fetchPriority,
  sizes,
  onLoad,
}) => {
  const hasDimensions = width !== undefined && height !== undefined;
  const descriptionId = longDescription
    ? `img-desc-${src.slice(-8).replace(/\W/g, "")}`
    : undefined;

  const sharedProps = {
    src,
    alt,
    className,
    loading: priority ? (undefined as undefined) : loading,
    priority,
    fetchPriority,
    sizes,
    "aria-labelledby": descriptionId,
  };

  return (
    <ImageWrapper className={className} $fill={!hasDimensions}>
      {hasDimensions ? (
        <NextImage
          {...sharedProps}
          width={width}
          height={height}
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
            objectFit: "cover",
            ...style,
          }}
          onLoad={onLoad}
        />
      ) : (
        <NextImage
          {...sharedProps}
          fill
          style={{ objectFit: "cover", ...style }}
          onLoad={onLoad}
        />
      )}
      {longDescription && (
        <FigCaption id={descriptionId}>{longDescription}</FigCaption>
      )}
    </ImageWrapper>
  );
};

export default Image;
