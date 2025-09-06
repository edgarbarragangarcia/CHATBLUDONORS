import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { webhook_url, ...payload } = body;
        
        if (!webhook_url) {
            return NextResponse.json(
                { error: 'webhook_url is required' },
                { status: 400 }
            );
        }
        
        console.log('Proxy enviando datos al webhook:', webhook_url, payload);
        
        // Enviar datos al webhook externo desde el servidor
        const webhookResponse = await fetch(webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ChatBluDonors-Webhook/1.0'
            },
            body: JSON.stringify(payload)
        });
        
        const responseText = await webhookResponse.text();
        
        console.log('Respuesta del webhook:', {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            body: responseText
        });
        
        return NextResponse.json({
            success: webhookResponse.ok,
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            response: responseText
        });
        
    } catch (error) {
        console.error('Error en proxy webhook:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}