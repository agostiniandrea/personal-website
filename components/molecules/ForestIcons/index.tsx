import { ArrowRight, Leaf, TreeDeciduous } from "lucide-react";

/* Icons for the Forest story, drawn from Lucide so they share one grid and
   stroke rather than being hand-rolled. They inherit currentColor and are
   tree-shaken, so only the handful used here reaches the bundle. */

interface IconProps {
  size?: number;
  className?: string;
}

const STROKE = 1.75;

/* A single leaf — the start of the story, and the invitation to add to it.
   (Lucide's sprout draws a ground line that reads as an underscore at small
   sizes, so the leaf carries the idea more cleanly.) */
export const LeafIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <Leaf
    absoluteStrokeWidth
    aria-hidden="true"
    className={className}
    size={size}
    strokeWidth={STROKE}
  />
);

/* A grown tree — the Forest once it exists. */
export const TreeIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <TreeDeciduous
    absoluteStrokeWidth
    aria-hidden="true"
    className={className}
    size={size}
    strokeWidth={STROKE}
  />
);

/* Points forward — the step that is still ongoing. */
export const ArrowIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <ArrowRight
    absoluteStrokeWidth
    aria-hidden="true"
    className={className}
    size={size}
    strokeWidth={STROKE}
  />
);

/* The milestone leaf: the same Lucide leaf outline, filled, with its stem and a
   vein cut back in the page colour. One mark for the hero badge, the end of the
   Forest progress bar and the counter beside the count, so the three read as
   the same celebration. Colour comes from the host (currentColor). */
export const MilestoneLeafIcon: React.FC<IconProps> = ({
  size = 16,
  className,
}) => (
  <svg
    aria-hidden="true"
    className={className}
    data-icon="milestone-leaf"
    fill="none"
    height={size}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    width={size}
  >
    <path
      d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 21c0-3 1.85-5.36 5.08-6"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M7.08 15C9.5 14.52 12 13 13 12"
      stroke="var(--color-background)"
      strokeOpacity="0.8"
      strokeWidth="1.5"
    />
  </svg>
);
