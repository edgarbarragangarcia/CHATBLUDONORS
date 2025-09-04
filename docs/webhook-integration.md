# Integración con Webhook de n8n

Este documento explica cómo funciona la integración con webhooks de n8n en la aplicación de chat.

## Funcionalidad

Cuando un usuario envía un mensaje en un chat que tiene configurado un webhook URL:

1. **Envío del mensaje del usuario**: El mensaje se guarda primero en la base de datos
2. **Llamada al webhook**: Se envía una petición POST al webhook de n8n con el contenido del mensaje
3. **Procesamiento de la respuesta**: Si n8n devuelve una respuesta, se guarda como un mensaje del "Asistente IA"

## Configuración del Webhook

### En la aplicación:
1. Ve a la sección de administración (`/admin/chats`)
2. Crea un nuevo chat o edita uno existente
3. Agrega la URL del webhook de n8n en el campo "Webhook URL (Opcional)"

### Formato de la petición al webhook:
```json
{
  "message": "Texto del mensaje del usuario",
  "user_id": "ID del usuario",
  "chat_id": "ID del chat"
}
```

### Formato esperado de respuesta del webhook:
```json
{
  "response": "Respuesta del asistente IA"
}
```

O alternativamente:
```json
{
  "message": "Respuesta del asistente IA"
}
```

## Implementación Técnica

### Componentes modificados:
- `src/components/chat/chat-page.tsx`: Lógica principal de integración
- `src/app/admin/chats/create-chat-dialog.tsx`: Formulario para configurar webhook
- `src/app/admin/chats/actions.ts`: Acciones del servidor para guardar webhook
- `supabase_setup.sql`: Esquema de base de datos con columna webhook_url

### Funciones clave:
- `fetchChatWebhook()`: Obtiene la URL del webhook del chat actual
- `sendToWebhook()`: Envía el mensaje al webhook y procesa la respuesta
- `handleSendMessage()`: Maneja el flujo completo de envío de mensajes

## Manejo de Errores

- Si el webhook no responde o hay un error, el mensaje del usuario se guarda normalmente
- Los errores se registran en la consola para debugging
- La aplicación continúa funcionando aunque el webhook falle

## Identificación de Mensajes del Bot

- Los mensajes del asistente IA se guardan con `user_id: 'system'`
- Se muestran con el nombre "Asistente IA" en la interfaz
- Se distinguen visualmente de los mensajes de usuarios reales