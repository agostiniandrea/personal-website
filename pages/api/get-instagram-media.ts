import { NextApiRequest, NextApiResponse } from "next";

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
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { longAccessToken } = req.query;

    const data = await getInstagramMedia(longAccessToken as string);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err });
  }
}
