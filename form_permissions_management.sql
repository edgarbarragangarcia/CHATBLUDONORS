-- =====================================================
-- GESTIÓN DE PERMISOS DE FORMULARIOS
-- Archivo SQL para activar/desactivar formularios
-- =====================================================

-- 1. ACTIVAR UN FORMULARIO PARA UN USUARIO ESPECÍFICO
-- Reemplaza 'USER_UUID_AQUI' con el UUID del usuario
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
INSERT INTO user_form_permissions (user_id, form_id, has_access)
VALUES ('USER_UUID_AQUI', 'FORM_UUID_AQUI', true)
ON CONFLICT (user_id, form_id) 
DO UPDATE SET has_access = true;

-- 2. DESACTIVAR UN FORMULARIO PARA UN USUARIO ESPECÍFICO
-- Reemplaza 'USER_UUID_AQUI' con el UUID del usuario
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
UPDATE user_form_permissions 
SET has_access = false 
WHERE user_id = 'USER_UUID_AQUI' AND form_id = 'FORM_UUID_AQUI';

-- 3. ACTIVAR UN FORMULARIO PARA TODOS LOS USUARIOS
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
INSERT INTO user_form_permissions (user_id, form_id, has_access)
SELECT id, 'FORM_UUID_AQUI', true
FROM auth.users
ON CONFLICT (user_id, form_id) 
DO UPDATE SET has_access = true;

-- 4. DESACTIVAR UN FORMULARIO PARA TODOS LOS USUARIOS
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
UPDATE user_form_permissions 
SET has_access = false 
WHERE form_id = 'FORM_UUID_AQUI';

-- 5. PUBLICAR UN FORMULARIO (hacerlo visible en la app)
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
UPDATE forms 
SET status = 'published', is_active = true 
WHERE id = 'FORM_UUID_AQUI';

-- 6. ARCHIVAR UN FORMULARIO (ocultarlo de la app)
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
UPDATE forms 
SET status = 'archived', is_active = false 
WHERE id = 'FORM_UUID_AQUI';

-- 7. CONSULTAR PERMISOS DE UN FORMULARIO
-- Ver qué usuarios tienen acceso a un formulario específico
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
SELECT 
    u.email, 
    u.user_metadata->>'full_name' as name, 
    ufp.has_access,
    ufp.created_at
FROM user_form_permissions ufp
JOIN auth.users u ON u.id = ufp.user_id
WHERE ufp.form_id = 'FORM_UUID_AQUI'
ORDER BY u.email;

-- 8. CONSULTAR TODOS LOS FORMULARIOS Y SU ESTADO
SELECT 
    f.id,
    f.title,
    f.status,
    f.is_active,
    f.created_at,
    COUNT(ufp.user_id) as usuarios_con_acceso
FROM forms f
LEFT JOIN user_form_permissions ufp ON f.id = ufp.form_id AND ufp.has_access = true
GROUP BY f.id, f.title, f.status, f.is_active, f.created_at
ORDER BY f.created_at DESC;

-- 9. OBTENER USUARIOS SIN ACCESO A UN FORMULARIO ESPECÍFICO
-- Reemplaza 'FORM_UUID_AQUI' con el UUID del formulario
SELECT 
    u.id,
    u.email,
    u.user_metadata->>'full_name' as name
FROM auth.users u
WHERE u.id NOT IN (
    SELECT ufp.user_id 
    FROM user_form_permissions ufp 
    WHERE ufp.form_id = 'FORM_UUID_AQUI' AND ufp.has_access = true
)
ORDER BY u.email;

-- 10. ACTIVAR FORMULARIO PARA USUARIOS ESPECÍFICOS POR EMAIL
-- Reemplaza los emails y 'FORM_UUID_AQUI' según necesites
INSERT INTO user_form_permissions (user_id, form_id, has_access)
SELECT 
    u.id, 
    'FORM_UUID_AQUI', 
    true
FROM auth.users u
WHERE u.email IN (
    'usuario1@ejemplo.com',
    'usuario2@ejemplo.com',
    'usuario3@ejemplo.com'
)
ON CONFLICT (user_id, form_id) 
DO UPDATE SET has_access = true;

-- =====================================================
-- NOTAS DE USO:
-- 1. Siempre reemplaza los UUIDs de ejemplo con los reales
-- 2. Para obtener UUIDs de usuarios: SELECT id, email FROM auth.users;
-- 3. Para obtener UUIDs de formularios: SELECT id, title FROM forms;
-- 4. Los formularios solo aparecen en la app si:
--    - status = 'published'
--    - is_active = true
--    - El usuario tiene has_access = true en user_form_permissions
-- =====================================================