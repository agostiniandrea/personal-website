import React from "react";
import NextImage from "next/image";
import styled from "styled-components";

interface ImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  longDescription?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  priority?: boolean;
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
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  style,
  className,
  longDescription,
  loading = "lazy",
  width,
  height,
  priority = false,
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
          style={{ maxWidth: "100%", height: "auto", display: "block", objectFit: "cover", ...style }}
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
