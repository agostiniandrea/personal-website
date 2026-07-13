import websiteCarbon from "./websiteCarbon.json";

/**
 * Latest verified Website Carbon result for agostiniandrea.dev.
 *
 * The data lives in websiteCarbon.json so the monthly carbon-drift GitHub
 * Action can read it too. Update it manually after substantial design,
 * asset, hosting or performance changes — never automatically in the
 * browser or on deploy. `pageWeightKb` is the homepage transfer weight
 * measured when the test was run; the Action compares the current weight
 * against it and opens an issue when they drift apart.
 */
const WEBSITE_CARBON = websiteCarbon;

export default WEBSITE_CARBON;
