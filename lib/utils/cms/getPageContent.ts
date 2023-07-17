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

const getPageContent = async (content_type: string): Promise<any> => {
  const content = (await client
    .getEntries({
      content_type,
      /* select: "fields", */
      limit: 1,
      include: 3, // update for more depth
    })
    .then((response) => {
      return response.items;
    })) as TPageContent[];

  return getPageFields(content)[0];
};

const getPageFields = (entries: TPageContent[]) => {
  return entries.map((entry) => {
    const { modules, ...restProps } = entry.fields;
    return {
      ...restProps,
      modules: modules.map((module) => {
        return {
          type: module.sys.contentType.sys.id,
          fields: module.fields,
        } as TPageModule;
      }),
    };
  });
};

export default getPageContent;
