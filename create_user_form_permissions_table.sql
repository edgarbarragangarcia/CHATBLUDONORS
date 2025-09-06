-- =====================================================
-- CREAR TABLA DE PERMISOS DE FORMULARIOS
-- Este archivo debe ejecutarse ANTES que form_permissions_management.sql
-- =====================================================

-- Crear la tabla user_form_permissions si no existe
CREATE TABLE IF NOT EXISTS public.user_form_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    form_id uuid NOT NULL,
    has_access boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_form_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT user_form_permissions_user_id_form_id_key UNIQUE (user_id, form_id),
    CONSTRAINT user_form_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_form_permissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_form_permissions_user_id ON public.user_form_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_form_permissions_form_id ON public.user_form_permissions(form_id);
CREATE INDEX IF NOT EXISTS idx_user_form_permissions_has_access ON public.user_form_permissions(has_access);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_form_permissions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propios permisos
CREATE POLICY "Users can view their own form permissions" ON public.user_form_permissions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los administradores puedan ver todos los permisos
CREATE POLICY "Admins can view all form permissions" ON public.user_form_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'is_admin' = 'true')
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_form_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_user_form_permissions_updated_at ON public.user_form_permissions;
CREATE TRIGGER update_user_form_permissions_updated_at
    BEFORE UPDATE ON public.user_form_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_form_permissions_updated_at();

-- =====================================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta PRIMERO este archivo para crear la tabla
-- 2. Luego ejecuta form_permissions_management.sql para gestionar permisos
-- 3. Asegúrate de que la tabla 'forms' ya existe antes de ejecutar este script
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla user_form_permissions creada exitosamente' as status;