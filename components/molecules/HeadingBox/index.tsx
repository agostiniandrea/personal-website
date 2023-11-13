import { Container } from "@components/ions";
import Link from "@components/ions/Link";
import { useMedia } from "@lib/utils/useMedia";
import { useContext } from "react";
import { ThemeContext } from "styled-components";

const linearGradient =
  "linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.03) 100%)";

export interface HeadingBoxProps {
  cta?: CtaProps;
  heading: string | null;
  description: string | null;
  preHeading: string | null;
}

const HeadingBox: React.FC<HeadingBoxProps> = ({
  cta,
  heading,
  description,
  preHeading,
}) => {
  const themeContext = useContext(ThemeContext);

  const { isDesktop } = useMedia();

  return (
    <Container>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "480px",
        }}
      >
        <p
          style={{
            background: linearGradient,
          }}
        >
          {preHeading}
        </p>
        <h2
          style={{
            background: linearGradient,
          }}
        >
          {heading}
        </h2>
        {isDesktop && (
          <p
            style={{
              background: linearGradient,
            }}
          >
            {description}
          </p>
        )}
        {cta && (
          <Link
            href={cta.url}
            styles={{
              borderRadius: themeContext?.radii.xs,
              background: themeContext?.colors.button,
              color: themeContext?.colors.button_text,
              fontWeight: themeContext?.fontWeights.bold,
              padding: themeContext?.space.md,
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            {cta.label}
          </Link>
        )}
      </section>
    </Container>
  );
};

export default HeadingBox;
