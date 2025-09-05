-- Migración para permitir que los administradores vean todos los formularios
-- Esta migración agrega políticas RLS adicionales para dar acceso completo a los administradores

-- Agregar política para que los administradores puedan ver todos los formularios
CREATE POLICY "Admins can view all forms" ON forms
    FOR SELECT USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Agregar política para que los administradores puedan crear formularios para cualquier usuario
CREATE POLICY "Admins can create any form" ON forms
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Agregar política para que los administradores puedan actualizar cualquier formulario
CREATE POLICY "Admins can update any form" ON forms
    FOR UPDATE USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Agregar política para que los administradores puedan eliminar cualquier formulario
CREATE POLICY "Admins can delete any form" ON forms
    FOR DELETE USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Políticas para campos de formularios (form_fields)
-- Permitir que los administradores vean todos los campos
CREATE POLICY "Admins can view all form fields" ON form_fields
    FOR SELECT USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Permitir que los administradores creen campos en cualquier formulario
CREATE POLICY "Admins can create any form field" ON form_fields
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Permitir que los administradores actualicen cualquier campo
CREATE POLICY "Admins can update any form field" ON form_fields
    FOR UPDATE USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Permitir que los administradores eliminen cualquier campo
CREATE POLICY "Admins can delete any form field" ON form_fields
    FOR DELETE USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Políticas para respuestas de formularios (form_responses)
-- Permitir que los administradores vean todas las respuestas
CREATE POLICY "Admins can view all form responses" ON form_responses
    FOR SELECT USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Políticas para valores de respuestas (form_response_values)
-- Permitir que los administradores vean todos los valores de respuestas
CREATE POLICY "Admins can view all response values" ON form_response_values
    FOR SELECT USING (
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Comentarios para documentación
COMMENT ON POLICY "Admins can view all forms" ON forms IS 'Permite a los administradores ver todos los formularios del sistema';
COMMENT ON POLICY "Admins can create any form" ON forms IS 'Permite a los administradores crear formularios para cualquier usuario';
COMMENT ON POLICY "Admins can update any form" ON forms IS 'Permite a los administradores actualizar cualquier formulario';
COMMENT ON POLICY "Admins can delete any form" ON forms IS 'Permite a los administradores eliminar cualquier formulario';

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('forms', 'form_fields', 'form_responses', 'form_response_values')
ORDER BY tablename, policyname;