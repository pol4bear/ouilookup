import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  const firstQuery = Array.isArray(query) ? query[0] : query;

  let apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${firstQuery}`;

  const params = new URLSearchParams(req.query as any);
  if (params.toString()) {
    apiUrl += `?${params.toString()}`;
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data from API server');
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ count: 0, error: errorMessage });
  }
}
