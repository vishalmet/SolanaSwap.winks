import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { src, dst, amount } = body;

        console.log("Request body:", body);

        const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;

        const config = {
            headers: {
                'Authorization': `Bearer ${apiKey}`
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

        const response = await axios.get(
            'https://api.1inch.dev/swap/v6.0/56/quote',
            config
        );

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch quote' }, 
            { status: 500 }
        );
    }
}