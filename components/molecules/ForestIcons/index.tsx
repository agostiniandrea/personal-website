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
