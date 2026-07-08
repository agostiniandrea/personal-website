import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

const SkeletonEl = styled.div<{
  $width?: string;
  $height?: string;
  $borderRadius?: string;
}>`
  animation: ${shimmer} 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.stroke} 25%,
    #252540 50%,
    ${({ theme }) => theme.colors.stroke} 75%
  );
  background-size: 200% 100%;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? "4px"};
  height: ${({ $height }) => $height ?? "1rem"};
  width: ${({ $width }) => $width ?? "100%"};
`;

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  style,
  className,
}) => (
  <SkeletonEl
    $width={width}
    $height={height}
    $borderRadius={borderRadius}
    style={style}
    className={className}
    aria-hidden="true"
  />
);

export default Skeleton;
