'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipos para los formularios
export interface FormField {
  id?: string;
  field_type: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  field_order: number;
  validation_rules?: any;
  options?: any;
  default_value?: string;
}

export interface Form {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  settings?: any;
  is_active?: boolean;
  webhook_url?: string;
  fields?: FormField[];
}

// Obtener todos los formularios del usuario actual
export async function getForms() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_fields(
        id,
        field_type,
        label,
        placeholder,
        help_text,
        is_required,
        field_order,
        validation_rules,
        options,
        default_value
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error.message);
    throw new Error('No se pudieron obtener los formularios');
  }

  return data;
}

// Obtener un formulario específico con sus campos
export async function getForm(formId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_fields(
        id,
        field_type,
        label,
        placeholder,
        help_text,
        is_required,
        field_order,
        validation_rules,
        options,
        default_value
      )
    `)
    .eq('id', formId)
    .eq('created_by', user.id)
    .single();

  if (error) {
    console.error('Error fetching form:', error.message);
    throw new Error('No se pudo obtener el formulario');
  }

  return data;
}

// Crear un nuevo formulario
export async function createForm(formData: Form) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Crear el formulario
  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert({
      title: formData.title,
      description: formData.description,
      status: formData.status || 'draft',
      created_by: user.id,
      settings: formData.settings || {},
      is_active: formData.is_active !== false,
      webhook_url: formData.webhook_url || null
    })
    .select()
    .single();

  if (formError) {
    console.error('Error creating form:', formError.message);
    throw new Error('No se pudo crear el formulario');
  }

  // Crear los campos si existen
  if (formData.fields && formData.fields.length > 0) {
    const fieldsToInsert = formData.fields.map((field, index) => ({
      form_id: form.id,
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder,
      help_text: field.help_text,
      is_required: field.is_required,
      field_order: field.field_order || index,
      validation_rules: field.validation_rules || {},
      options: field.options,
      default_value: field.default_value
    }));

    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(fieldsToInsert);

    if (fieldsError) {
      console.error('Error creating form fields:', fieldsError.message);
      // Eliminar el formulario si no se pudieron crear los campos
      await supabase.from('forms').delete().eq('id', form.id);
      throw new Error('No se pudieron crear los campos del formulario');
    }
  }

  revalidatePath('/admin/forms');
  return form;
}

// Actualizar un formulario existente
export async function updateForm(formId: string, formData: Partial<Form>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Actualizar el formulario
  const { data: form, error: formError } = await supabase
    .from('forms')
    .update({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      settings: formData.settings,
      is_active: formData.is_active,
      webhook_url: formData.webhook_url
    })
    .eq('id', formId)
    .eq('created_by', user.id)
    .select()
    .single();

  if (formError) {
    console.error('Error updating form:', formError.message);
    throw new Error('No se pudo actualizar el formulario');
  }

  // Si se proporcionan campos, actualizar los campos
  if (formData.fields) {
    // Eliminar campos existentes
    await supabase
      .from('form_fields')
      .delete()
      .eq('form_id', formId);

    // Insertar nuevos campos
    if (formData.fields.length > 0) {
      const fieldsToInsert = formData.fields.map((field, index) => ({
        form_id: formId,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.help_text,
        is_required: field.is_required,
        field_order: field.field_order || index,
        validation_rules: field.validation_rules || {},
        options: field.options,
        default_value: field.default_value
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('Error updating form fields:', fieldsError.message);
        throw new Error('No se pudieron actualizar los campos del formulario');
      }
    }
  }

  revalidatePath('/admin/forms');
  revalidatePath(`/admin/forms/${formId}`);
  return form;
}

// Eliminar un formulario
export async function deleteForm(formId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deleting form:', error.message);
    throw new Error('No se pudo eliminar el formulario');
  }

  revalidatePath('/admin/forms');
}

// Duplicar un formulario
export async function duplicateForm(formId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener el formulario original
  const originalForm = await getForm(formId);
  
  // Crear una copia del formulario
  const duplicatedForm = await createForm({
    title: `${originalForm.title} (Copia)`,
    description: originalForm.description,
    status: 'draft',
    settings: originalForm.settings,
    fields: originalForm.form_fields?.map((field: any) => ({
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder,
      help_text: field.help_text,
      is_required: field.is_required,
      field_order: field.field_order,
      validation_rules: field.validation_rules,
      options: field.options,
      default_value: field.default_value
    }))
  });

  return duplicatedForm;
}

// Cambiar el estado de un formulario
export async function updateFormStatus(formId: string, status: 'draft' | 'published' | 'archived') {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { data, error } = await supabase
    .from('forms')
    .update({ status })
    .eq('id', formId)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating form status:', error.message);
    throw new Error('No se pudo actualizar el estado del formulario');
  }

  revalidatePath('/admin/forms');
  return data;
}

// Obtener estadísticas de formularios
export async function getFormStats() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener estadísticas básicas
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('id, status')
    .eq('created_by', user.id);

  if (formsError) {
    console.error('Error fetching form stats:', formsError.message);
    throw new Error('No se pudieron obtener las estadísticas');
  }

  const totalForms = forms.length;
  const publishedForms = forms.filter(f => f.status === 'published').length;
  const draftForms = forms.filter(f => f.status === 'draft').length;

  // Obtener total de respuestas (cuando se implemente)
  const totalResponses = 0; // Placeholder

  return {
    totalForms,
    publishedForms,
    draftForms,
    totalResponses
  };
}