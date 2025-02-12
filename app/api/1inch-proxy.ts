// pages/api/1inch-proxy.js
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { address } = req.query; // Get the address from the query parameters

    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;

    const response = await axios.get(
      `https://api.1inch.dev/token/v1.2/56/custom/${address}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Proxy failed' });
  }
}
