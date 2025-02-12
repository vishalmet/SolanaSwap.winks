import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { url } = body;

        console.log("Request body:", body);
        
        const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;

        const response = await axios.get(url, {
            headers: {
                Authorization: `${apiKey}`,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
    }
} 