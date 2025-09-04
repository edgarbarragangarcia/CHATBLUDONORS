# Chat BluDonors - Sistema de Chat Inteligente

Una aplicación web moderna de chat construida con Next.js 14, Supabase y TypeScript que permite la gestión de múltiples salas de chat con integración de webhooks para respuestas automatizadas.

## 🚀 Características Principales

### 💬 Sistema de Chat
- **Múltiples salas de chat**: Crea y gestiona diferentes salas de chat independientes
- **Mensajes en tiempo real**: Comunicación instantánea entre usuarios
- **Historial persistente**: Los mensajes se mantienen durante la sesión activa
- **Sesiones independientes**: Cada chat mantiene su propio historial de mensajes

### 🔧 Panel de Administración
- **Gestión de chats**: Crear, editar y eliminar salas de chat
- **Gestión de usuarios**: Administrar usuarios del sistema
- **Control de acceso**: Sistema de roles (admin/usuario)
- **Interfaz intuitiva**: Panel de administración fácil de usar

### 🔗 Integración de Webhooks
- **Respuestas automatizadas**: Configura webhooks para respuestas automáticas
- **Caché inteligente**: Sistema de caché para optimizar las consultas de webhooks
- **Actualización en tiempo real**: Los cambios se reflejan inmediatamente
- **Configuración flexible**: Cada chat puede tener su propio webhook

### 🎨 Interfaz de Usuario
- **Diseño moderno**: Interfaz limpia y profesional con Tailwind CSS
- **Modo oscuro**: Soporte completo para tema oscuro
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Componentes reutilizables**: Arquitectura basada en componentes

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Estilos**: Tailwind CSS, shadcn/ui
- **Estado**: React Context API
- **Autenticación**: Supabase Auth
- **Base de datos**: PostgreSQL (Supabase)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Git

## ⚡ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd CHATBLUDONORS
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Configurar la base de datos
Ejecuta los scripts SQL en tu proyecto de Supabase:

1. `supabase_setup.sql` - Configuración inicial de tablas
2. `create_system_user.sql` - Crear usuario del sistema

### 5. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   │   ├── chats/         # Gestión de chats
│   │   └── users/         # Gestión de usuarios
│   ├── chat/              # Páginas de chat
│   ├── login/             # Autenticación
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── chat/             # Componentes específicos de chat
│   └── edit-chat-dialog.tsx # Diálogo de edición
├── contexts/             # Contextos de React
│   ├── messages-context.tsx # Gestión de mensajes
│   └── webhook-context.tsx  # Gestión de webhooks
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y configuraciones
│   └── supabase/         # Cliente de Supabase
└── middleware.ts         # Middleware de autenticación
```

## 🔐 Sistema de Autenticación

### Roles de Usuario
- **Admin**: Acceso completo al panel de administración
- **Usuario**: Acceso solo a las salas de chat

### Usuarios Administradores
Los siguientes emails tienen acceso de administrador:
- `eabarragang@ingenes.com`
- `ntorres@ingenes.com`
- `administrador@ingenes.com`

## 💾 Base de Datos

### Tablas Principales

#### `chats`
- `id`: UUID único del chat
- `name`: Nombre del chat
- `description`: Descripción del chat
- `webhook_url`: URL del webhook (opcional)
- `created_at`: Fecha de creación

#### `messages`
- `id`: UUID único del mensaje
- `chat_id`: Referencia al chat
- `content`: Contenido del mensaje
- `sender`: Remitente del mensaje
- `created_at`: Fecha de creación

#### `profiles`
- `id`: UUID del usuario
- `email`: Email del usuario
- `role`: Rol del usuario (admin/user)
- `created_at`: Fecha de creación

## 🔄 Funcionalidades Avanzadas

### Gestión de Mensajes
- **Contexto global**: Los mensajes se gestionan a través de un contexto global
- **Caché por chat**: Cada chat mantiene su propio caché de mensajes
- **Persistencia de sesión**: Los mensajes persisten durante la sesión activa

### Sistema de Webhooks
- **Caché inteligente**: Los webhooks se almacenan en caché para optimizar rendimiento
- **Actualización en tiempo real**: Los cambios se sincronizan automáticamente
- **Respuestas automáticas**: Integración con servicios externos para respuestas automatizadas

### Tiempo Real
- **Supabase Realtime**: Actualizaciones en tiempo real para chats y webhooks
- **Sincronización automática**: Los cambios se reflejan inmediatamente en todos los clientes

## 🎯 Uso de la Aplicación

### Para Usuarios
1. **Iniciar sesión**: Accede con tu cuenta
2. **Seleccionar chat**: Elige una sala de chat disponible
3. **Enviar mensajes**: Escribe y envía mensajes
4. **Ver historial**: Revisa el historial de mensajes de la sesión

### Para Administradores
1. **Panel de administración**: Accede a `/admin`
2. **Gestionar chats**: 
   - Crear nuevos chats
   - Editar chats existentes (nombre, descripción, webhook)
   - Eliminar chats
3. **Gestionar usuarios**: Administrar usuarios del sistema
4. **Configurar webhooks**: Establecer URLs de webhook para respuestas automatizadas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Linting
npm run lint
```

## 📚 Documentación Adicional

- `docs/blueprint.md` - Arquitectura y diseño del sistema
- `docs/webhook-integration.md` - Guía de integración de webhooks

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de INGENES y está destinado para uso interno.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo:
- Email: eabarragang@ingenes.com
- Email: ntorres@ingenes.com

---

**Desarrollado con ❤️ por el equipo de INGENES**
