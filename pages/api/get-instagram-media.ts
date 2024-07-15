import Airtable from "airtable";
import { NextApiRequest, NextApiResponse } from "next";

const baseAppId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_APP_ID as string;
const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY as string;
const base = new Airtable({ apiKey }).base(baseAppId);

const fieldAccessTokenId = process.env
  .NEXT_PUBLIC_AIRTABLE_FIELD_ACCESS_TOKEN_ID as string;

const INSTAGRAM_PROFILE_ID = process.env
  .NEXT_PUBLIC_INSTAGRAM_PROFILE_ID as string;

const getInstagramMedia = async (accessToken: string) => {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  const data = await fetch(
    `https://graph.instagram.com/${INSTAGRAM_PROFILE_ID}/media?fields=media_type,caption,permalink,media_url,thumbnail_url&access_token=${accessToken}`,
    options,
  ).then((response) => response.json());

  return data;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const record = await base("Projects").find(fieldAccessTokenId);
    const value = record._rawJson.fields.Name;
    const data = await getInstagramMedia(value as string);

    console.log("value", value);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err });
  }
}
