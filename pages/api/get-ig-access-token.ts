import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (code) {
      const INSTAGRAM_APP_ID = '785220683818036'
      const INSTAGRAM_APP_SECRET = '576e9e4854aac73da7b404a97a4f42c7'
      const INSTAGRAM_REDIRECT_URI = /* 'https://6c1e-92-110-156-217.ngrok-free.app/' */ 'https://www.google.com/'

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