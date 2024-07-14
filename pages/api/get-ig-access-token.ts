import { NextApiRequest, NextApiResponse } from "next";

const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID as string
const INSTAGRAM_APP_SECRET = process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET as string
const INSTAGRAM_REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI as string

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (code) {
      const options =  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: INSTAGRAM_REDIRECT_URI,
          code: code.toString()
        })
      }

      const { access_token: initialAccessToken } = await fetch(
        `https://api.instagram.com/oauth/access_token`,
        options
      ).then((response) => response.json())


      const { access_token: longAccessToken } = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${initialAccessToken}`
      ).then((response) => response.json())


      const userData  = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${longAccessToken}`
      ).then((response) => response.json())

      res.status(200).json({...userData, longAccessToken})
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}