// pages/api/1inch-proxy.js
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("Request body:", req.body);
  try {
    const { url } = req.body; // Get the URL from the request body
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Proxy failed' });
  }
}
