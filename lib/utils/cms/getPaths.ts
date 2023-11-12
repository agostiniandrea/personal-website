import { createClient } from "contentful";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string;
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN as string;

const client = createClient({
  space,
  accessToken,
});

export type TPageModule = {
  type: string;
  fields: any[];
};

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

export type TPath = {
  slug: string;
};

const getPaths = async (content_type: string): Promise<TPath[]> => {
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

export default getPaths;
