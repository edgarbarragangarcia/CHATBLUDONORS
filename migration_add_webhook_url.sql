-- Migración para agregar la columna webhook_url a la tabla forms
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar la columna webhook_url si no existe
ALTER TABLE forms ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Agregar comentario para documentación
COMMENT ON COLUMN forms.webhook_url IS 'URL del webhook para notificaciones de respuestas';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'forms' AND column_name = 'webhook_url';