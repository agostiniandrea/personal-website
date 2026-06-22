import { PAGE_TYPES } from "@constants";
import { createClient } from "contentful";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string;

const client = createClient({
  space,
  accessToken,
});

type ContentfulEntrySys = {
  id: string;
  contentType: {
    sys: {
      id: string;
    };
  };
};

type ContentfulModuleEntry = {
  sys: ContentfulEntrySys;
  fields: Record<string, unknown>;
};

type ContentfulPageFields = {
  name: string;
  uid: string;
  seoTitle: string;
  seoDescription?: string;
  modules: ContentfulModuleEntry[];
};

export type TPageContent = {
  fields: ContentfulPageFields;
};

export type TPageFields = {
  name: string;
  uid: string;
  seoTitle: string;
  seoDescription?: string;
  modules: TPageModule[];
};

export type TPageModule = {
  id?: string;
  type: string;
  fields: Record<string, unknown>;
};

export type TPath = {
  slug: string;
};

export const getPaths = async (content_type: string, locale = "en"): Promise<TPath[]> => {
  const content = (await client
    .getEntries({
      content_type,
      include: 3,
      locale,
    })
    .then((response) => {
      return response.items;
    })) as TPageContent[];

  return getSlugs(content);
};

const getSlugs = (entries: TPageContent[]): TPath[] => {
  return entries.map((x) => ({ slug: x.fields.uid }));
};

export const getPageContent = async (
  content_type: string,
  path: string,
  locale = "en",
): Promise<TPageFields | null> => {
  const content = (await client
    .getEntries({
      content_type,
      ...(content_type !== PAGE_TYPES.HOME && { "fields.uid": path }),
      limit: 1,
      include: 3,
      locale,
    })
    .then((response) => {
      return response.items[0];
    })) as TPageContent;

  return content ? getPageFields(content) : null;
};

const getPageFields = (entry: TPageContent): TPageFields => {
  const { modules = [], ...restProps } = entry.fields;
  return {
    ...restProps,
    modules: modules.map((module) => {
      return {
        id: module.sys.id,
        type: module.sys.contentType.sys.id,
        fields: module.fields,
      } as TPageModule;
    }),
  };
};

export type TSiteHeaderData = {
  logoText: string;
  navLinks: { label: string; url: string }[];
};

export type TSiteFooterData = {
  socialLinks: { label: string; url: string }[];
  copyrightName: string;
  tagline: string | null;
  ctaHeading: string | null;
};

type ContentfulLinkEntry = {
  fields: { label: string; url: string };
};

type ContentfulSiteHeaderEntry = {
  fields: { logoText: string; navLinks: ContentfulLinkEntry[] };
};

type ContentfulSiteFooterEntry = {
  fields: { copyrightName: string; tagline?: string; ctaHeading?: string; socialLinks: ContentfulLinkEntry[] };
};

export const getSiteHeaderContent = async (locale = "en"): Promise<TSiteHeaderData | null> => {
  const entry = await client
    .getEntries({ content_type: "siteHeader", limit: 1, include: 2, locale })
    .then((response) => response.items[0] as unknown as ContentfulSiteHeaderEntry);

  if (!entry) return null;

  return {
    logoText: entry.fields.logoText,
    navLinks: entry.fields.navLinks?.map((link) => ({
      label: link.fields.label,
      url: link.fields.url,
    })) ?? [],
  };
};

export const getSiteFooterContent = async (locale = "en"): Promise<TSiteFooterData | null> => {
  const entry = await client
    .getEntries({ content_type: "siteFooter", limit: 1, include: 2, locale })
    .then((response) => response.items[0] as unknown as ContentfulSiteFooterEntry);

  if (!entry) return null;

  return {
    copyrightName: entry.fields.copyrightName,
    tagline: entry.fields.tagline ?? null,
    ctaHeading: entry.fields.ctaHeading ?? null,
    socialLinks: entry.fields.socialLinks?.map((link) => ({
      label: link.fields.label,
      url: link.fields.url,
    })) ?? [],
  };
};
