'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getForm, updateForm } from '../../actions';
import type { Form, FormField } from '../../actions';

// Interfaces para el formulario de edición
interface EditFormField {
  id?: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  field_type?: string;
  help_text?: string;
  is_required?: boolean;
  field_order?: number;
  validation_rules?: any;
  default_value?: string;
}

interface EditFormData {
  title: string;
  description: string;
  webhook_url: string;
  fields: EditFormField[];
  status?: 'draft' | 'published' | 'archived';
}

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    description: '',
    webhook_url: '',
    fields: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<EditFormField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const formId = params.id as string;

  // Cargar datos del formulario
  useEffect(() => {
    const loadForm = async () => {
      try {
        const form = await getForm(formId);
        setFormData({
          title: form.title,
          description: form.description || '',
          webhook_url: form.webhook_url || '',
          status: form.status,
          fields: form.form_fields?.map((field: any) => ({
            id: field.id,
            type: mapFieldType(field.field_type),
            label: field.label,
            placeholder: field.placeholder,
            required: field.is_required,
            options: field.options,
            description: field.help_text,
            field_type: field.field_type,
            help_text: field.help_text,
            is_required: field.is_required,
            field_order: field.field_order,
            validation_rules: field.validation_rules,
            default_value: field.default_value
          })) || []
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el formulario",
          variant: "destructive",
        });
        router.push('/admin/forms');
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      loadForm();
    }
  }, [formId, router, toast]);

  // Mapear tipos de campo de la base de datos al frontend
  const mapFieldType = (dbType: string): EditFormField['type'] => {
    const typeMap: Record<string, EditFormField['type']> = {
      'text': 'text',
      'email': 'email',
      'tel': 'phone',
      'textarea': 'textarea',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'date': 'date',
      'number': 'number'
    };
    return typeMap[dbType] || 'text';
  };

  // Mapear tipos de campo del frontend a la base de datos
  const mapToDbFieldType = (frontendType: EditFormField['type']): string => {
    const typeMap: Record<EditFormField['type'], string> = {
      'text': 'text',
      'email': 'email',
      'phone': 'tel',
      'textarea': 'textarea',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'date': 'date',
      'number': 'number',
      'rating': 'number'
    };
    return typeMap[frontendType] || 'text';
  };

  const addField = (type: EditFormField['type']) => {
    const newField: EditFormField = {
      id: Date.now().toString(),
      type,
      label: `Campo ${formData.fields.length + 1}`,
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Opción 1', 'Opción 2'] : undefined
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (updatedField: EditFormField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === updatedField.id ? updatedField : field
      )
    }));
    setEditingField(null);
    setIsFieldDialogOpen(false);
  };

  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const saveForm = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del formulario es requerido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const formToUpdate: Partial<Form> = {
        title: formData.title,
        description: formData.description,
        webhook_url: formData.webhook_url,
        fields: formData.fields.map((field, index) => ({
          field_type: mapToDbFieldType(field.type),
          label: field.label,
          placeholder: field.placeholder,
          help_text: field.description,
          is_required: field.required,
          field_order: index,
          validation_rules: field.validation_rules || {},
          options: field.options,
          default_value: field.default_value
        }))
      };

      await updateForm(formId, formToUpdate);
      
      toast({
        title: "Formulario actualizado",
        description: "El formulario se ha actualizado exitosamente",
      });
      
      router.push('/admin/forms');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el formulario",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              Editar Formulario
            </h1>
            <p className="text-muted-foreground mt-1">
              Modifica tu formulario y sus campos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
            disabled={formData.fields.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button 
            onClick={saveForm}
            disabled={!formData.title || isSaving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Formulario</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Formulario de Contacto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito de este formulario"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://ejemplo.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Campo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { type: 'text' as const, label: 'Texto', icon: '📝' },
                  { type: 'email' as const, label: 'Email', icon: '📧' },
                  { type: 'phone' as const, label: 'Teléfono', icon: '📞' },
                  { type: 'textarea' as const, label: 'Área de Texto', icon: '📄' },
                  { type: 'select' as const, label: 'Selección', icon: '📋' },
                  { type: 'radio' as const, label: 'Opción Única', icon: '🔘' },
                  { type: 'checkbox' as const, label: 'Casillas', icon: '☑️' },
                  { type: 'date' as const, label: 'Fecha', icon: '📅' },
                  { type: 'number' as const, label: 'Número', icon: '🔢' },
                ].map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(fieldType.type)}
                    className="justify-start h-auto p-3 text-left"
                  >
                    <span className="mr-2">{fieldType.icon}</span>
                    <span className="text-sm">{fieldType.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Constructor de Formulario</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No hay campos en el formulario</h3>
                  <p>Agrega campos desde el panel lateral para comenzar a construir tu formulario</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500">*</span>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingField(field);
                              setIsFieldDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteField(field.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Tipo: {field.type} {field.description && `• ${field.description}`}
                      </div>
                      
                      {/* Field Preview */}
                      <div className="mt-3">
                        {field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' ? (
                          <Input placeholder={field.placeholder || field.label} disabled />
                        ) : field.type === 'textarea' ? (
                          <Textarea placeholder={field.placeholder || field.label} disabled rows={3} />
                        ) : field.type === 'select' ? (
                          <select className="w-full p-2 border rounded" disabled>
                            <option>{field.placeholder || 'Selecciona una opción'}</option>
                            {field.options?.map((option, i) => (
                              <option key={i}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input type="radio" disabled />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input type="checkbox" disabled />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'date' ? (
                          <Input type="date" disabled />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}