import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { src, dst, amount } = req.body;

    // Validate required parameters
    if (!src || !dst || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const config = {
      headers: {
        'Authorization': 'Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd'
      },
      params: {
        src,
        dst,
        amount
      },
      paramsSerializer: {
        indexes: null
      }
    };

    const response = await axios.get('https://api.1inch.dev/swap/v6.0/56/quote', config);
    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Failed to fetch quote'
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
