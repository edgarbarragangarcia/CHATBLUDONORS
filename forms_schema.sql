-- Esquema SQL para el sistema de formularios
-- Este archivo contiene las tablas necesarias para almacenar formularios, campos y respuestas

-- Tabla principal de formularios
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}', -- Configuraciones adicionales del formulario
    is_active BOOLEAN DEFAULT true,
    webhook_url TEXT -- URL del webhook para notificaciones de respuestas
);

-- Tabla de campos de formularios
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'text', 'email', 'number', 'tel', 'url', 'password',
        'textarea', 'select', 'radio', 'checkbox', 'date',
        'time', 'datetime-local', 'file'
    )),
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    help_text TEXT,
    is_required BOOLEAN DEFAULT false,
    field_order INTEGER NOT NULL,
    validation_rules JSONB DEFAULT '{}', -- Reglas de validación específicas
    options JSONB, -- Para campos select, radio, checkbox (array de opciones)
    default_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de respuestas a formularios
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Puede ser NULL para respuestas anónimas
    user_email VARCHAR(255), -- Para identificar respuestas anónimas
    user_name VARCHAR(255), -- Nombre del usuario que responde
    ip_address INET, -- Dirección IP para tracking
    user_agent TEXT, -- User agent del navegador
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_complete BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}' -- Información adicional sobre la respuesta
);

-- Tabla de valores de respuestas individuales
CREATE TABLE form_response_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
    field_id UUID REFERENCES form_fields(id) ON DELETE CASCADE,
    value TEXT, -- Valor de la respuesta como texto
    value_json JSONB, -- Para valores complejos (arrays, objetos)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_at ON forms(created_at);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_order ON form_fields(form_id, field_order);

CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_user_id ON form_responses(user_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);

CREATE INDEX idx_form_response_values_response_id ON form_response_values(response_id);
CREATE INDEX idx_form_response_values_field_id ON form_response_values(field_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at BEFORE UPDATE ON form_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) para Supabase
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_response_values ENABLE ROW LEVEL SECURITY;

-- Política para formularios: los usuarios pueden ver y editar sus propios formularios
CREATE POLICY "Users can view their own forms" ON forms
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create forms" ON forms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own forms" ON forms
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own forms" ON forms
    FOR DELETE USING (auth.uid() = created_by);

-- Política para campos de formularios: acceso basado en el propietario del formulario
CREATE POLICY "Users can view fields of their forms" ON form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create fields for their forms" ON form_fields
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update fields of their forms" ON form_fields
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete fields of their forms" ON form_fields
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.created_by = auth.uid()
        )
    );

-- Política para respuestas: los propietarios de formularios pueden ver todas las respuestas
CREATE POLICY "Form owners can view responses" ON form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.created_by = auth.uid()
        )
    );

-- Política para permitir respuestas anónimas a formularios publicados
CREATE POLICY "Anyone can submit responses to published forms" ON form_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.status = 'published'
        )
    );

-- Política para valores de respuestas
CREATE POLICY "Form owners can view response values" ON form_response_values
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM form_responses fr
            JOIN forms f ON f.id = fr.form_id
            WHERE fr.id = form_response_values.response_id 
            AND f.created_by = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert response values for published forms" ON form_response_values
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM form_responses fr
            JOIN forms f ON f.id = fr.form_id
            WHERE fr.id = form_response_values.response_id 
            AND f.status = 'published'
        )
    );

-- Vista para obtener estadísticas de formularios
CREATE VIEW form_stats AS
SELECT 
    f.id,
    f.title,
    f.status,
    f.created_at,
    COUNT(DISTINCT ff.id) as field_count,
    COUNT(DISTINCT fr.id) as response_count,
    MAX(fr.submitted_at) as last_response_at
FROM forms f
LEFT JOIN form_fields ff ON f.id = ff.form_id
LEFT JOIN form_responses fr ON f.id = fr.form_id
GROUP BY f.id, f.title, f.status, f.created_at;

-- Función para obtener un formulario completo con sus campos
CREATE OR REPLACE FUNCTION get_form_with_fields(form_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'form', row_to_json(f),
        'fields', COALESCE(json_agg(
            json_build_object(
                'id', ff.id,
                'field_type', ff.field_type,
                'label', ff.label,
                'placeholder', ff.placeholder,
                'help_text', ff.help_text,
                'is_required', ff.is_required,
                'field_order', ff.field_order,
                'validation_rules', ff.validation_rules,
                'options', ff.options,
                'default_value', ff.default_value
            ) ORDER BY ff.field_order
        ), '[]'::json)
    ) INTO result
    FROM forms f
    LEFT JOIN form_fields ff ON f.id = ff.form_id
    WHERE f.id = form_uuid
    GROUP BY f.id, f.title, f.description, f.status, f.created_by, f.created_at, f.updated_at, f.settings, f.is_active;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE forms IS 'Tabla principal que almacena la información básica de los formularios';
COMMENT ON TABLE form_fields IS 'Tabla que almacena los campos individuales de cada formulario';
COMMENT ON TABLE form_responses IS 'Tabla que almacena las respuestas enviadas a los formularios';
COMMENT ON TABLE form_response_values IS 'Tabla que almacena los valores individuales de cada respuesta';
COMMENT ON VIEW form_stats IS 'Vista que proporciona estadísticas básicas de cada formulario';
COMMENT ON FUNCTION get_form_with_fields IS 'Función que retorna un formulario completo con todos sus campos en formato JSON';