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
      console.log(`No hay webhook configurado para el chat ${chatId}`)
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
        message,
        user_id: userId,
        chat_id: chatId,
        timestamp: new Date().toISOString()
      }),
      // Timeout de 15 segundos
      signal: AbortSignal.timeout(15000)
    })

    if (!webhookResponse.ok) {
      console.error(`Webhook respondió con status ${webhookResponse.status}`)
      return NextResponse.json(
        { 
          success: false, 
          error: `Webhook respondió con status ${webhookResponse.status}`,
          status: webhookResponse.status
        },
        { status: 200 } // Devolvemos 200 para que el frontend no falle
      )
    }

    // Procesar respuesta del webhook
    const responseText = await webhookResponse.text()
    
    if (!responseText || responseText.trim() === '') {
      console.log('Webhook devolvió respuesta vacía')
      return NextResponse.json(
        { success: true, response: null },
        { status: 200 }
      )
    }

    // Intentar parsear como JSON
    try {
      const jsonResponse = JSON.parse(responseText)
      console.log('Respuesta del webhook (JSON):', jsonResponse)
      
      // Si es un array, tomar el primer elemento
      let finalResponse = jsonResponse
      if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
        finalResponse = jsonResponse[0]
      }
      
      // Extraer el contenido del mensaje
      const messageContent = finalResponse.output || finalResponse.response || finalResponse.message || finalResponse
      
      return NextResponse.json(
        { 
          success: true, 
          response: messageContent 
        },
        { status: 200 }
      )
    } catch (parseError) {
      // Si no es JSON válido, devolver como texto
      console.log('Respuesta del webhook (texto):', responseText)
      return NextResponse.json(
        { success: true, response: responseText },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Error en webhook proxy:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Timeout del webhook (15s)' },
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