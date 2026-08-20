/* ---------------------------------------------------------------------------
 * TEMPORARY — visual lab for how one section should end and the next begin.
 *
 * Every variant is pure CSS keyed on a data-divider attribute, so no
 * production component is touched while comparing. Delete this file and
 * components/dev/DividerLab once a variant is chosen, then implement the
 * winner properly in components/molecules/Section.
 * ------------------------------------------------------------------------- */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const DIVIDER_VARIANTS = [
  "none",
  "subtle",
  "container",
  "signature",
  "gradient",
  "wave",
] as const;

export type DividerVariant = (typeof DIVIDER_VARIANTS)[number];

export const DIVIDER_LABELS: Record<DividerVariant, string> = {
  container: "3 · Linea del container",
  gradient: "5 · Soft gradient",
  none: "1 · Nessun divider",
  signature: "4 · Signature (pallino)",
  subtle: "2 · Linea tenue",
  wave: "6 · Soft organic wave",
};

const STORAGE_KEY = "section-divider-lab";
const DEFAULT_VARIANT: DividerVariant = "none";

const isVariant = (value: unknown): value is DividerVariant =>
  DIVIDER_VARIANTS.includes(value as DividerVariant);

const DividerContext = createContext<{
  variant: DividerVariant;
  setVariant: (next: DividerVariant) => void;
}>({ setVariant: () => {}, variant: DEFAULT_VARIANT });

export const DividerLabProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariantState] = useState<DividerVariant>(DEFAULT_VARIANT);

  const apply = useCallback((next: DividerVariant) => {
    document.documentElement.setAttribute("data-divider", next);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const initial = isVariant(stored) ? stored : DEFAULT_VARIANT;
      setVariantState(initial);
      apply(initial);
    } catch {
      apply(DEFAULT_VARIANT);
    }
  }, [apply]);

  const setVariant = useCallback(
    (next: DividerVariant) => {
      setVariantState(next);
      apply(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage blocked: the choice still applies to this page */
      }
    },
    [apply],
  );

  return (
    <DividerContext.Provider value={{ setVariant, variant }}>
      {children}
    </DividerContext.Provider>
  );
};

export const useDividerVariant = () => useContext(DividerContext);

export const useDividerLabEnabled = (): boolean => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(
      process.env.NODE_ENV !== "production" ||
        new URLSearchParams(window.location.search).get("lab") === "1",
    );
  }, []);
  return enabled;
};
