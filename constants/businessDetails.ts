/**
 * Legal business details shown in the footer (desktop) and the More sheet
 * (mobile). Dutch rules for traders require the name, the address, an email
 * address, the Chamber of Commerce (KVK) number and the VAT ID to be easy to
 * find. They live in code, not in Contentful, so a CMS edit can never
 * silently change what is published as the legal identity.
 *
 * Source: KVK Business Register extract for the sole proprietorship
 * (eenmanszaak). Keep in sync with it and with the invoices.
 */
const BUSINESS_DETAILS = {
  name: "Andrea Agostini",
  street: "Piet Heinstraat 12",
  postalCode: "7511 JE",
  city: "Enschede",
  country: { en: "Netherlands", it: "Paesi Bassi" },
  email: "a.agostini92@gmail.com",
  kvk: "86233858",
  vatId: "NL004214781B58",
} as const;

export default BUSINESS_DETAILS;
