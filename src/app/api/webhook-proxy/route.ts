import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, message, userId } = body

    if (!chatId || !message || !userId) {
      return NextResponse.json(
        { error: 'chatId, message y userId son requeridos' },
        { status: 400 }
      )
    }

    // Obtener el webhook URL del chat desde Supabase
    const supabase = await createClient()
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('webhook_url')
      .eq('id', chatId)
      .single()

    if (chatError) {
      console.error('Error obteniendo webhook URL:', chatError)
      return NextResponse.json(
        { error: 'No se pudo obtener la configuración del chat' },
        { status: 500 }
      )
    }

    const webhookUrl = chatData?.webhook_url
    if (!webhookUrl) {
      return NextResponse.json(
        { success: true, message: 'No hay webhook configurado' },
        { status: 200 }
      )
    }

    console.log(`Enviando al webhook desde el servidor: ${webhookUrl}`)

    // Enviar al webhook externo desde el servidor (sin problemas de CORS)
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatBluDonors-Proxy/1.0'
      },
      body: JSON.stringify({
        chatId: chatId,
        message: message,
        userId: userId
      }),
      // Timeout de 45 segundos para permitir procesamiento completo del webhook externo
      signal: AbortSignal.timeout(60000)
    })

    const responseData = await webhookResponse.json();

    // ¡¡¡AÑADIDO PARA DEPURACIÓN!!!
    console.log("Respuesta CRUDA del webhook en producción:", JSON.stringify(responseData, null, 2));

    return NextResponse.json({ success: true, response: responseData })

  } catch (error) {
    console.error('Error en webhook proxy:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Timeout del webhook (45s)' },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error desconocido en el proxy' },
      { status: 500 }
    )
  }
}