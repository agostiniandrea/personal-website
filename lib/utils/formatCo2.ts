/* Shared kg → tonnes formatter so the CO₂ figure is never hand-written in
   components; locale drives the decimal separator (1.5 t vs 1,5 t) */
export function formatCo2Tonnes(kg: number, locale?: string): string {
  const formatted = new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(kg / 1000);
  return `${formatted} t`;
}
