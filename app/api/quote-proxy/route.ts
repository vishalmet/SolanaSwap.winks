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
        const url = `https://api.1inch.dev/swap/v6.0/56/quote?src=${src}&dst=${dst}&amount=${amount}`

        console.log("url",url)



        const response = await axios.get(`https://api.1inch.dev/swap/v6.0/56/quote?src=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&dst=0xd5eaaac47bd1993d661bc087e15dfb079a7f3c19&amount=1000000`, {
            headers: {
              'Authorization': 'Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd'
            }
          });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch quote' }, 
            { status: 500 }
        );
    }
}