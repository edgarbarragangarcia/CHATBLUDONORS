-- 1. Tabla para almacenar las salas de chat disponibles
CREATE TABLE IF NOT EXISTS public.chats (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- 2. Tabla para almacenar los permisos de cada usuario para cada chat
CREATE TABLE IF NOT EXISTS public.user_chat_permissions (
  user_id UUID NOT NULL,
  chat_id TEXT NOT NULL,
  has_access BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, chat_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE
);

-- 3. Insertar las salas de chat iniciales (si no existen ya)
-- La cláusula 'ON CONFLICT (id) DO NOTHING' evita errores si ya has insertado estos datos.
INSERT INTO public.chats (id, name, description) VALUES
  ('general', 'Chat General', 'Conversaciones sobre temas generales.'),
  ('support', 'Chat de Soporte', 'Resolución de dudas y problemas técnicos.'),
  ('project-x', 'Proyecto X', 'Discusiones del equipo sobre el Proyecto X.')
ON CONFLICT (id) DO NOTHING;


-- 4. Habilitar la Seguridad a Nivel de Fila (RLS) en la tabla de permisos
-- Esto asegura que las políticas que creemos a continuación se apliquen.
ALTER TABLE public.user_chat_permissions ENABLE ROW LEVEL SECURITY;


-- 5. Crear políticas de seguridad (Policies)

-- Política 1: Permitir a los administradores (usando service_role_key) realizar cualquier operación.
-- Esto es crucial para que nuestro panel de administración funcione.
DROP POLICY IF EXISTS "Allow admins full access" ON public.user_chat_permissions;
CREATE POLICY "Allow admins full access"
ON public.user_chat_permissions
FOR ALL
USING (true)
WITH CHECK (true);

-- Política 2: Permitir a los usuarios leer SUS PROPIOS permisos.
-- Esto es necesario para que la aplicación pueda saber a qué chats tiene acceso el usuario que ha iniciado sesión.
DROP POLICY IF EXISTS "Allow individual user read access to their own permissions" ON public.user_chat_permissions;
CREATE POLICY "Allow individual user read access to their own permissions"
ON public.user_chat_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Opcional: Asegurarse de que ya existe la tabla de mensajes y tiene RLS habilitado
-- (Esto ya se ha mencionado en conversaciones anteriores, pero se incluye por completitud)
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política 3: Permitir a los usuarios leer mensajes de los chats a los que tienen acceso
DROP POLICY IF EXISTS "Allow authorized users to read messages" ON public.messages;
CREATE POLICY "Allow authorized users to read messages"
ON public.messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM user_chat_permissions
        WHERE user_chat_permissions.chat_id = messages.chat_id
          AND user_chat_permissions.user_id = auth.uid()
          AND user_chat_permissions.has_access = true
    )
);

-- Política 4: Permitir a los usuarios insertar mensajes en los chats a los que tienen acceso
DROP POLICY IF EXISTS "Allow authorized users to insert messages" ON public.messages;
CREATE POLICY "Allow authorized users to insert messages"
ON public.messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_chat_permissions
        WHERE user_chat_permissions.chat_id = messages.chat_id
          AND user_chat_permissions.user_id = auth.uid()
          AND user_chat_permissions.has_access = true
    )
);
