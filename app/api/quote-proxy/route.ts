import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {

        
        const body = await request.json();

        
        const { src, dst, amount } = body;

        

        console.log("Request body:", body);

        const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;


        const amountNumber = Number(amount);
        console.log("amountNumber", amountNumber);
        if(amountNumber <= 0){
            return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 201 });
        }

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



        const response = await axios.get(url, {
            headers: {
              'Authorization': 'Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd'
            }
          });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch quote' }, 
            { status: 500 }
        );
    }
}