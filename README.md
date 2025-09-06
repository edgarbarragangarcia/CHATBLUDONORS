# ChatBluDonors - Plataforma Integral de Chat y Formularios

Una aplicación web progresiva (PWA) moderna construida con Next.js 15, Supabase y TypeScript que combina un sistema de chat inteligente con un potente generador de formularios dinámicos, diseñada específicamente para la gestión de donantes y comunicación médica.

## 🚀 Características Principales

### 💬 Sistema de Chat Inteligente
- **Múltiples salas de chat**: Crea y gestiona diferentes salas de chat independientes
- **Mensajes en tiempo real**: Comunicación instantánea entre usuarios con Supabase Realtime
- **Historial persistente**: Los mensajes se mantienen durante la sesión activa
- **Sesiones independientes**: Cada chat mantiene su propio historial de mensajes
- **Integración con IA**: Soporte para respuestas automatizadas con Genkit AI

### 📋 Sistema de Formularios Dinámicos
- **Constructor visual**: Crea formularios arrastrando y soltando campos
- **Tipos de campo variados**: Texto, email, teléfono, selección, checkbox, radio, textarea y más
- **Validación avanzada**: Reglas de validación personalizables por campo
- **Gestión de respuestas**: Recolección y análisis de respuestas de usuarios
- **Permisos granulares**: Control de acceso por usuario y formulario
- **Estados de publicación**: Borrador, publicado y archivado

### 🔧 Panel de Administración Completo
- **Gestión de chats**: Crear, editar y eliminar salas de chat
- **Gestión de usuarios**: Administrar usuarios del sistema con roles
- **Gestión de formularios**: CRUD completo de formularios dinámicos
- **Control de permisos**: Sistema granular de permisos por recurso
- **Estadísticas**: Dashboard con métricas de uso y rendimiento
- **Interfaz intuitiva**: Panel de administración moderno y fácil de usar

### 📱 Aplicación Web Progresiva (PWA)
- **Instalable**: Se puede instalar como app nativa en dispositivos móviles y desktop
- **Funcionalidad offline**: Service worker para caché y funcionalidad sin conexión
- **Notificaciones push**: Sistema de notificaciones (preparado para implementar)
- **Iconos adaptativos**: Iconos optimizados para diferentes plataformas
- **Accesos directos**: Shortcuts a funciones principales desde el launcher

### 🔗 Integración de Webhooks
- **Respuestas automatizadas**: Configura webhooks para respuestas automáticas
- **Caché inteligente**: Sistema de caché para optimizar las consultas de webhooks
- **Actualización en tiempo real**: Los cambios se reflejan inmediatamente
- **Configuración flexible**: Cada chat puede tener su propio webhook

### 🎨 Interfaz de Usuario Moderna
- **Diseño responsive**: Adaptable a móviles, tablets y desktop
- **Modo oscuro**: Soporte completo para tema oscuro con persistencia
- **Componentes reutilizables**: Arquitectura basada en shadcn/ui
- **Animaciones fluidas**: Transiciones y animaciones con Tailwind CSS
- **Accesibilidad**: Cumple con estándares WCAG para accesibilidad

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: Next.js 15.3.3 con App Router y Turbopack
- **UI Library**: React 18.3.1 con TypeScript 5
- **Componentes**: shadcn/ui con Radix UI primitives
- **Estilos**: Tailwind CSS 3.4.1 con animaciones
- **Formularios**: React Hook Form con Zod validation
- **Drag & Drop**: @hello-pangea/dnd para constructor de formularios
- **Iconos**: Lucide React
- **Temas**: next-themes para modo oscuro

### Backend y Base de Datos
- **BaaS**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **ORM**: Supabase Client con TypeScript
- **Autenticación**: Supabase Auth con Row Level Security (RLS)
- **Base de datos**: PostgreSQL con políticas de seguridad avanzadas

### PWA y Optimización
- **PWA**: next-pwa 5.6.0 para funcionalidad offline
- **Service Worker**: Workbox para caché inteligente
- **Manifest**: Configuración completa para instalación
- **Performance**: Turbopack para builds más rápidos

### IA y Automatización
- **IA Framework**: Google Genkit 1.14.1
- **AI Provider**: Google AI (Gemini)
- **Webhooks**: Sistema personalizado para integraciones

### Herramientas de Desarrollo
- **Linting**: ESLint con configuración de Next.js
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm con lock file
- **Deployment**: Configurado para Firebase App Hosting

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

### 5. Configurar la base de datos
Ejecuta los siguientes scripts SQL en tu proyecto de Supabase en orden:

1. **Configuración inicial**:
   ```sql
   -- Ejecutar supabase_setup.sql
   -- Ejecutar forms_schema.sql
   -- Ejecutar create_user_form_permissions_table.sql
   ```

2. **Configuración de permisos**:
   ```sql
   -- Ejecutar complete_form_permissions_setup.sql
   -- Ejecutar form_permissions_management.sql
   ```

3. **Usuario del sistema**:
   ```sql
   -- Ejecutar create_system_user.sql
   ```

### 6. Ejecutar la aplicación
```bash
# Desarrollo con Turbopack
npm run dev

# Desarrollo con IA (Genkit)
npm run genkit:dev

# Desarrollo con watch mode para IA
npm run genkit:watch
```

La aplicación estará disponible en:
- **App principal**: `http://localhost:9002`
- **Genkit AI**: `http://localhost:4000` (cuando se ejecute genkit:dev)

## 📁 Estructura del Proyecto

```
CHATBLUDONORS/
├── public/                     # Archivos estáticos y PWA
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker
│   ├── workbox-*.js           # Workbox runtime
│   └── icon-*.png             # Iconos PWA (192x192, 256x256, 384x384, 512x512)
├── src/
│   ├── app/                   # App Router de Next.js 15
│   │   ├── admin/            # Panel de administración
│   │   │   ├── chats/        # Gestión de chats
│   │   │   ├── users/        # Gestión de usuarios
│   │   │   └── forms/        # Gestión de formularios
│   │   │       ├── create/   # Crear formularios
│   │   │       └── [id]/     # Editar formularios
│   │   ├── api/              # API Routes
│   │   ├── auth/             # Páginas de autenticación
│   │   ├── chat/             # Páginas de chat
│   │   ├── login/            # Login específico
│   │   ├── globals.css       # Estilos globales
│   │   ├── layout.tsx        # Layout principal con PWA
│   │   └── page.tsx          # Página principal con formularios
│   ├── ai/                   # Integración con Genkit AI
│   │   ├── flows/           # Flujos de IA
│   │   ├── dev.ts           # Configuración de desarrollo
│   │   └── genkit.ts        # Configuración principal
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── chat/            # Componentes de chat
│   │   ├── forms/           # Componentes de formularios
│   │   │   ├── form-builder.tsx    # Constructor visual
│   │   │   ├── form-renderer.tsx   # Renderizador
│   │   │   └── field-types/        # Tipos de campos
│   │   ├── edit-chat-dialog.tsx
│   │   └── theme-provider.tsx
│   ├── contexts/            # Contextos de React
│   │   ├── messages-context.tsx
│   │   └── webhook-context.tsx
│   ├── hooks/               # Hooks personalizados
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                 # Utilidades y configuraciones
│   │   ├── supabase/        # Cliente de Supabase
│   │   ├── google-drive-utils.ts
│   │   └── utils.ts
│   ├── types/               # Definiciones de tipos
│   │   └── next-pwa.d.ts
│   └── middleware.ts        # Middleware de autenticación
├── scripts/                 # Scripts de utilidad
│   └── assign-admin-role.js
├── docs/                    # Documentación
│   ├── blueprint.md
│   └── webhook-integration.md
├── *.sql                    # Scripts de base de datos
├── next.config.ts           # Configuración Next.js con PWA
├── package.json             # Dependencias y scripts
├── tailwind.config.ts       # Configuración Tailwind
├── components.json          # Configuración shadcn/ui
└── tsconfig.json           # Configuración TypeScript
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

### Esquema de Base de Datos

La aplicación utiliza PostgreSQL a través de Supabase con las siguientes tablas principales:

#### Sistema de Chat

**`chats`**
- `id`: UUID único del chat
- `name`: Nombre del chat
- `description`: Descripción del chat
- `webhook_url`: URL del webhook (opcional)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**`messages`**
- `id`: UUID único del mensaje
- `chat_id`: Referencia al chat (FK)
- `content`: Contenido del mensaje
- `sender`: Remitente del mensaje
- `created_at`: Fecha de creación

#### Sistema de Formularios

**`forms`**
- `id`: UUID único del formulario
- `title`: Título del formulario
- `description`: Descripción del formulario
- `status`: Estado (draft, published, archived)
- `created_by`: Usuario creador (FK a auth.users)
- `settings`: Configuraciones JSON del formulario
- `is_active`: Si el formulario está activo
- `webhook_url`: URL de webhook para respuestas
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**`form_fields`**
- `id`: UUID único del campo
- `form_id`: Referencia al formulario (FK)
- `field_type`: Tipo de campo (text, email, select, etc.)
- `label`: Etiqueta del campo
- `placeholder`: Texto de placeholder
- `help_text`: Texto de ayuda
- `is_required`: Si el campo es obligatorio
- `field_order`: Orden del campo en el formulario
- `validation_rules`: Reglas de validación JSON
- `options`: Opciones para campos de selección JSON
- `default_value`: Valor por defecto

**`form_responses`**
- `id`: UUID único de la respuesta
- `form_id`: Referencia al formulario (FK)
- `user_id`: Usuario que respondió (FK, nullable)
- `user_email`: Email del usuario (para respuestas anónimas)
- `user_name`: Nombre del usuario
- `ip_address`: Dirección IP
- `user_agent`: User agent del navegador
- `submitted_at`: Fecha de envío
- `is_complete`: Si la respuesta está completa
- `metadata`: Metadatos adicionales JSON

**`form_response_values`**
- `id`: UUID único del valor
- `response_id`: Referencia a la respuesta (FK)
- `field_id`: Referencia al campo (FK)
- `value`: Valor como texto
- `value_json`: Valor como JSON (para datos complejos)

#### Sistema de Permisos

**`user_form_permissions`**
- `id`: UUID único del permiso
- `user_id`: Usuario (FK a auth.users)
- `form_id`: Formulario (FK)
- `has_access`: Si tiene acceso al formulario
- `created_at`: Fecha de creación

#### Sistema de Usuarios

**`profiles`** (extiende auth.users)
- `id`: UUID del usuario
- `email`: Email del usuario
- `role`: Rol del usuario (admin/user)
- `created_at`: Fecha de creación

### Políticas de Seguridad (RLS)

Todas las tablas implementan Row Level Security (RLS) con políticas específicas:

- **Formularios**: Los usuarios solo pueden ver/editar sus propios formularios
- **Respuestas**: Solo el creador del formulario puede ver las respuestas
- **Permisos**: Sistema granular de acceso por usuario y formulario
- **Administradores**: Acceso completo a todos los recursos

## 🔄 Funcionalidades Avanzadas

### Sistema de Formularios Dinámicos
- **Constructor visual**: Interfaz drag-and-drop para crear formularios
- **Tipos de campo extensibles**: Soporte para múltiples tipos de entrada
- **Validación en tiempo real**: Validación client-side y server-side
- **Respuestas anónimas**: Permite respuestas sin autenticación
- **Exportación de datos**: Capacidad de exportar respuestas en diferentes formatos
- **Análisis de respuestas**: Dashboard con estadísticas y métricas

### Gestión de Mensajes
- **Contexto global**: Los mensajes se gestionan a través de un contexto global
- **Caché por chat**: Cada chat mantiene su propio caché de mensajes
- **Persistencia de sesión**: Los mensajes persisten durante la sesión activa
- **Integración con IA**: Respuestas automatizadas usando Genkit AI

### Sistema de Webhooks
- **Caché inteligente**: Los webhooks se almacenan en caché para optimizar rendimiento
- **Actualización en tiempo real**: Los cambios se sincronizan automáticamente
- **Respuestas automáticas**: Integración con servicios externos para respuestas automatizadas
- **Webhooks para formularios**: Notificaciones automáticas cuando se envían respuestas

### Funcionalidades PWA
- **Instalación nativa**: Se puede instalar como aplicación nativa
- **Caché offline**: Service worker para funcionalidad sin conexión
- **Actualizaciones automáticas**: Sistema de actualización en segundo plano
- **Notificaciones push**: Preparado para implementar notificaciones
- **Shortcuts de aplicación**: Accesos rápidos a funciones principales

### Tiempo Real
- **Supabase Realtime**: Actualizaciones en tiempo real para chats, formularios y webhooks
- **Sincronización automática**: Los cambios se reflejan inmediatamente en todos los clientes
- **Estado de conexión**: Indicadores de estado de conexión en tiempo real

### Seguridad y Permisos
- **Row Level Security**: Políticas de seguridad a nivel de fila en la base de datos
- **Autenticación robusta**: Sistema de autenticación con Supabase Auth
- **Roles granulares**: Sistema de permisos por usuario y recurso
- **Auditoría**: Registro de acciones para auditoría y seguimiento

## 🎯 Uso de la Aplicación

### Para Usuarios Finales
1. **Acceso a la aplicación**: 
   - Visita `http://localhost:9002` o instala la PWA
   - Inicia sesión con tu cuenta autorizada

2. **Usar formularios**:
   - Ve los formularios disponibles en la página principal
   - Completa y envía formularios asignados
   - Recibe confirmación de envío exitoso

3. **Participar en chats**:
   - Selecciona una sala de chat disponible
   - Envía mensajes y participa en conversaciones
   - Ve el historial de mensajes de la sesión

### Para Administradores
1. **Panel de administración**: Accede a `/admin`

2. **Gestión de formularios**:
   - **Crear formularios**: Usa el constructor visual en `/admin/forms/create`
   - **Editar formularios**: Modifica formularios existentes
   - **Gestionar permisos**: Asigna formularios a usuarios específicos
   - **Ver respuestas**: Analiza las respuestas recibidas
   - **Configurar webhooks**: Establece notificaciones automáticas

3. **Gestión de chats**: 
   - Crear nuevos chats
   - Editar chats existentes (nombre, descripción, webhook)
   - Eliminar chats
   - Configurar webhooks para respuestas automatizadas

4. **Gestión de usuarios**: 
   - Administrar usuarios del sistema
   - Asignar roles y permisos
   - Gestionar acceso a formularios específicos

### Instalación como PWA
1. **En móviles**: 
   - Abre la app en el navegador
   - Toca "Agregar a pantalla de inicio" o "Instalar app"
   - La app se instalará como aplicación nativa

2. **En desktop**: 
   - Abre la app en Chrome/Edge
   - Busca el ícono de instalación en la barra de direcciones
   - Haz clic en "Instalar" para agregar a tu sistema

## 🔧 Scripts Disponibles

```bash
# Desarrollo principal (con Turbopack)
npm run dev

# Desarrollo con IA (Genkit)
npm run genkit:dev

# Desarrollo con IA en modo watch
npm run genkit:watch

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Linting y verificación de código
npm run lint

# Verificación de tipos TypeScript
npm run typecheck
```

## 📊 Características de Rendimiento

- **Turbopack**: Builds hasta 10x más rápidos que Webpack
- **Next.js 15**: Optimizaciones de rendimiento y nuevas características
- **Service Worker**: Caché inteligente para carga rápida
- **Lazy Loading**: Carga bajo demanda de componentes
- **Optimización de imágenes**: Compresión automática de assets
- **Bundle Splitting**: División automática de código para mejor caching

## 📚 Documentación Adicional

- **`docs/blueprint.md`** - Arquitectura y diseño del sistema
- **`docs/webhook-integration.md`** - Guía de integración de webhooks
- **`*.sql`** - Scripts de configuración de base de datos
- **`components.json`** - Configuración de componentes shadcn/ui
- **`next.config.ts`** - Configuración de Next.js y PWA

## 🚀 Deployment

La aplicación está configurada para deployment en:

- **Firebase App Hosting** (configuración en `apphosting.yaml`)
- **Vercel** (compatible con Next.js 15)
- **Netlify** (con configuración PWA)

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

### Estándares de Código
- Usar TypeScript para type safety
- Seguir las convenciones de ESLint
- Escribir componentes reutilizables
- Documentar funciones complejas
- Mantener la estructura de carpetas establecida

## 📄 Licencia

Este proyecto es propiedad de **INGENES** y está destinado para uso interno en el contexto de gestión de donantes y comunicación médica.

## 🆘 Soporte y Contacto

Para soporte técnico y consultas sobre el desarrollo:

- **Email principal**: eabarragang@ingenes.com
- **Email secundario**: ntorres@ingenes.com
- **Email administrativo**: administrador@ingenes.com

### Reportar Issues
- Describe el problema detalladamente
- Incluye pasos para reproducir el error
- Adjunta capturas de pantalla si es necesario
- Especifica el navegador y sistema operativo

---

## 🏆 Características Destacadas

✅ **PWA Completa** - Instalable como app nativa  
✅ **Sistema de Formularios** - Constructor visual drag-and-drop  
✅ **Chat en Tiempo Real** - Comunicación instantánea  
✅ **IA Integrada** - Respuestas automatizadas con Genkit  
✅ **Seguridad Robusta** - RLS y autenticación avanzada  
✅ **Responsive Design** - Optimizado para todos los dispositivos  
✅ **Modo Oscuro** - Tema adaptativo  
✅ **Performance** - Optimizado con Turbopack y Next.js 15  

---

**Desarrollado con ❤️ por el equipo de INGENES**  
*Versión 0.1.0 - ChatBluDonors Platform*
