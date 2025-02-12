import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const address = searchParams.get('address')

        const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;

        const response = await axios.get(
            `https://api.1inch.dev/token/v1.2/56/custom/${address}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        return NextResponse.json(response.data)
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
    }
}
