-- Script para crear el usuario sistema en Supabase
-- Este usuario especial se usa para los mensajes del bot/webhook

-- Insertar usuario sistema en auth.users
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@chatbludonors.local',
  '$2a$10$dummy.encrypted.password.hash.for.system.user',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "system", "providers": ["system"]}',
  '{"name": "Sistema Bot", "avatar_url": null}',
  false,
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  raw_user_meta_data = '{"name": "Sistema Bot", "avatar_url": null}';

-- Crear entrada en auth.identities para el usuario sistema
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '{"sub": "00000000-0000-0000-0000-000000000000", "email": "system@chatbludonors.local"}',
  'system',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id, provider) DO UPDATE SET
  updated_at = NOW();

-- Dar permisos al usuario sistema para todos los chats existentes
INSERT INTO user_chat_permissions (user_id, chat_id, has_access)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  id,
  true
FROM chats
ON CONFLICT (user_id, chat_id) DO UPDATE SET
  has_access = true;

COMMIT;