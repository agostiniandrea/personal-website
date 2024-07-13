import { NextApiRequest, NextApiResponse } from 'next'

const instagramId_andrea = '26790270310572370'
const instagramId_alice = "7963487247105111"

const getInstagramMedia = async (accessToken: string) => {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }

  const data = await fetch(
    `https://graph.instagram.com/${instagramId_alice}/media?fields=media_type,caption,permalink,media_url,thumbnail_url&access_token=${accessToken}`,
    options,
  ).then((response) => response.json())

  return data
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { longAccessToken} = _req.query

    const data = await getInstagramMedia(longAccessToken as string)
    console.log('data', data)
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ err })
  }
}
