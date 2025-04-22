import React from "react";
import styled from "styled-components";

interface ImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  longDescription?: string;
  role?: string;
  id?: string;
  loading?: "lazy" | "eager";
  width?: number | string;
  height?: number | string;
  "aria-hidden"?: boolean;
  "aria-labelledby"?: string;
  fallbackSrc?: string;
}

const StyledImage = styled.img<ImageProps>`
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: opacity 0.3s ease;
`;

const ImageWrapper = styled.figure`
  margin: 0;
  padding: 0;
  position: relative;
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
  role = "img",
  id,
  loading = "lazy",
  width,
  height,
  "aria-hidden": ariaHidden,
  "aria-labelledby": ariaLabelledby,
  fallbackSrc,
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  // Generate unique ID for the image if not provided
  const imageId = id || `img-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${imageId}-description`;

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // If no alt text is provided, mark the image as decorative
  const isDecorative = !alt || alt.trim() === "";

  return (
    <ImageWrapper>
      <StyledImage
        src={imgSrc}
        alt={alt}
        style={style}
        className={className}
        role={isDecorative ? "presentation" : role}
        id={imageId}
        loading={loading}
        width={width}
        height={height}
        onError={handleError}
        aria-hidden={ariaHidden || isDecorative}
        aria-labelledby={
          ariaLabelledby || (longDescription ? descriptionId : undefined)
        }
      />
      {longDescription && (
        <FigCaption id={descriptionId}>{longDescription}</FigCaption>
      )}
    </ImageWrapper>
  );
};

export default Image;
