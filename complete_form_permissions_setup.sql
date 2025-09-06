-- =====================================================
-- CONFIGURACIÓN COMPLETA DE PERMISOS DE FORMULARIOS
-- Este archivo incluye creación de tabla y ejemplos funcionales
-- =====================================================

-- PASO 1: Crear la tabla user_form_permissions si no existe
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
DROP POLICY IF EXISTS "Users can view their own form permissions" ON public.user_form_permissions;
CREATE POLICY "Users can view their own form permissions" ON public.user_form_permissions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los administradores puedan ver todos los permisos
DROP POLICY IF EXISTS "Admins can view all form permissions" ON public.user_form_permissions;
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
-- PASO 2: CONSULTAS FUNCIONALES CON DATOS REALES
-- =====================================================

-- CONSULTA 1: Ver todos los usuarios disponibles
SELECT 
    id as user_uuid,
    email,
    raw_user_meta_data->>'full_name' as nombre
FROM auth.users
ORDER BY email;

-- CONSULTA 2: Ver todos los formularios disponibles
SELECT 
    id as form_uuid,
    title as titulo,
    status,
    is_active
FROM forms
ORDER BY created_at DESC;

-- =====================================================
-- PASO 3: EJEMPLOS DE GESTIÓN DE PERMISOS
-- =====================================================

-- EJEMPLO 1: Activar formulario para el primer usuario y primer formulario
-- (Esta consulta usa datos reales de tu base de datos)
DO $$
DECLARE
    primer_usuario_id uuid;
    primer_form_id uuid;
BEGIN
    -- Obtener el primer usuario
    SELECT id INTO primer_usuario_id FROM auth.users LIMIT 1;
    
    -- Obtener el primer formulario
    SELECT id INTO primer_form_id FROM forms LIMIT 1;
    
    -- Solo ejecutar si existen datos
    IF primer_usuario_id IS NOT NULL AND primer_form_id IS NOT NULL THEN
        INSERT INTO user_form_permissions (user_id, form_id, has_access)
        VALUES (primer_usuario_id, primer_form_id, true)
        ON CONFLICT (user_id, form_id) 
        DO UPDATE SET has_access = true;
        
        RAISE NOTICE 'Permiso activado para usuario % en formulario %', primer_usuario_id, primer_form_id;
    ELSE
        RAISE NOTICE 'No se encontraron usuarios o formularios para activar permisos';
    END IF;
END $$;

-- EJEMPLO 2: Activar un formulario específico para todos los usuarios
-- (Reemplaza el título del formulario según tu necesidad)
DO $$
DECLARE
    form_id_objetivo uuid;
BEGIN
    -- Buscar formulario por título (cambia 'Mi Formulario' por el título real)
    SELECT id INTO form_id_objetivo 
    FROM forms 
    WHERE title ILIKE '%formulario%' -- Busca cualquier formulario que contenga 'formulario'
    LIMIT 1;
    
    IF form_id_objetivo IS NOT NULL THEN
        INSERT INTO user_form_permissions (user_id, form_id, has_access)
        SELECT u.id, form_id_objetivo, true
        FROM auth.users u
        ON CONFLICT (user_id, form_id) 
        DO UPDATE SET has_access = true;
        
        RAISE NOTICE 'Formulario % activado para todos los usuarios', form_id_objetivo;
    ELSE
        RAISE NOTICE 'No se encontró ningún formulario para activar';
    END IF;
END $$;

-- EJEMPLO 3: Activar formulario para usuario específico por email
-- (Reemplaza 'usuario@ejemplo.com' con el email real)
DO $$
DECLARE
    usuario_id_objetivo uuid;
    form_id_objetivo uuid;
BEGIN
    -- Buscar usuario por email (cambia el email por uno real)
    SELECT id INTO usuario_id_objetivo 
    FROM auth.users 
    WHERE email = 'admin@ejemplo.com' -- Cambia por un email real
    LIMIT 1;
    
    -- Buscar primer formulario disponible
    SELECT id INTO form_id_objetivo 
    FROM forms 
    WHERE status = 'published'
    LIMIT 1;
    
    IF usuario_id_objetivo IS NOT NULL AND form_id_objetivo IS NOT NULL THEN
        INSERT INTO user_form_permissions (user_id, form_id, has_access)
        VALUES (usuario_id_objetivo, form_id_objetivo, true)
        ON CONFLICT (user_id, form_id) 
        DO UPDATE SET has_access = true;
        
        RAISE NOTICE 'Permiso activado para usuario % en formulario %', usuario_id_objetivo, form_id_objetivo;
    ELSE
        RAISE NOTICE 'No se encontró el usuario o formulario especificado';
    END IF;
END $$;

-- =====================================================
-- PASO 4: CONSULTAS DE VERIFICACIÓN Y GESTIÓN
-- =====================================================

-- CONSULTA 4: Ver todos los permisos actuales
SELECT 
    u.email as usuario_email,
    u.raw_user_meta_data->>'full_name' as usuario_nombre,
    f.title as formulario_titulo,
    ufp.has_access as tiene_acceso,
    ufp.created_at as fecha_creacion
FROM user_form_permissions ufp
JOIN auth.users u ON u.id = ufp.user_id
JOIN forms f ON f.id = ufp.form_id
ORDER BY u.email, f.title;

-- CONSULTA 5: Ver formularios y cuántos usuarios tienen acceso
SELECT 
    f.title as formulario,
    f.status,
    f.is_active,
    COUNT(CASE WHEN ufp.has_access = true THEN 1 END) as usuarios_con_acceso,
    COUNT(ufp.user_id) as total_permisos_configurados
FROM forms f
LEFT JOIN user_form_permissions ufp ON f.id = ufp.form_id
GROUP BY f.id, f.title, f.status, f.is_active
ORDER BY f.created_at DESC;

-- CONSULTA 6: Publicar un formulario (hacerlo visible)
-- Esta consulta publica el primer formulario en estado 'draft'
UPDATE forms 
SET status = 'published', is_active = true 
WHERE id = (
    SELECT id FROM forms 
    WHERE status = 'draft' 
    LIMIT 1
);

-- CONSULTA 7: Desactivar acceso a un formulario para todos los usuarios
-- (Desactiva el primer formulario encontrado)
DO $$
DECLARE
    form_id_desactivar uuid;
BEGIN
    SELECT id INTO form_id_desactivar FROM forms LIMIT 1;
    
    IF form_id_desactivar IS NOT NULL THEN
        UPDATE user_form_permissions 
        SET has_access = false 
        WHERE form_id = form_id_desactivar;
        
        RAISE NOTICE 'Acceso desactivado para todos los usuarios del formulario %', form_id_desactivar;
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Configuración de permisos de formularios completada exitosamente' as status;

-- Mostrar resumen de la configuración
SELECT 
    'Usuarios registrados: ' || COUNT(*) as resumen
FROM auth.users
UNION ALL
SELECT 
    'Formularios creados: ' || COUNT(*)
FROM forms
UNION ALL
SELECT 
    'Permisos configurados: ' || COUNT(*)
FROM user_form_permissions;