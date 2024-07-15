import { PAGE_TYPES } from "@constants";
import { createClient } from "contentful";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string;

const client = createClient({
  space,
  accessToken,
});

export type TPageContent = {
  fields: TPageFields;
};

export type TPageFields = {
  name: string;
  uid: string;
  seoTitle: string;
  seoDescription?: string;
  modules: any[];
};

export type TPageModule = {
  type: string;
  fields: any[];
};

export type TPath = {
  slug: string;
};

export const getPaths = async (content_type: string): Promise<TPath[]> => {
  const content = (await client
    .getEntries({
      content_type,
      include: 3,
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
): Promise<any> => {
  const content = (await client
    .getEntries({
      content_type,
      ...(content_type !== PAGE_TYPES.HOME && { "fields.uid": path }),
      /* select: "fields", */
      limit: 1,
      include: 3, // update for more depth
    })
    .then((response) => {
      return response.items[0];
    })) as TPageContent;

  return content ? getPageFields(content) : null;
};

const getPageFields = (entry: TPageContent) => {
  const { modules = [], ...restProps } = entry.fields;
  return {
    ...restProps,
    modules: modules.map((module) => {
      return {
        type: module.sys.contentType.sys.id,
        fields: module.fields,
      } as TPageModule;
    }),
  };
};
