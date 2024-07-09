import { Container } from "@components/ions";
import Link from "@components/ions/Link";
import { theme } from "@config/theme";
import { useMedia } from "@lib/utils/useMedia";

const linearGradient =
  "linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.03) 100%)";

/**
 * Props for the HeadingBox component.
 */
export interface HeadingBoxProps {
  /**
   * The call-to-action component.
   */
  cta?: CtaProps;
  /**
   * The heading text.
   */
  heading: string | null;
  /**
   * The description text.
   */
  description: string | null;
  /**
   * The pre-heading text.
   */
  preHeading: string | null;
}

const HeadingBox: React.FC<HeadingBoxProps> = ({
  cta,
  heading,
  description,
  preHeading,
}) => {
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
              borderRadius: theme.radii.xs,
              background: theme.colors.button,
              color: theme.colors.button_text,
              fontWeight: theme.fontWeights.bold,
              padding: theme.space.md,
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
