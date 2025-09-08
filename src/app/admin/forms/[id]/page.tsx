'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Eye, Share2, BarChart3 } from 'lucide-react';
import { getForm } from '../actions';
import type { Form, FormField } from '../actions';

// Tipo extendido para el resultado de getForm que incluye form_fields
interface FormWithFields extends Omit<Form, 'fields'> {
  form_fields?: FormField[];
}

export default function ViewFormPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<FormWithFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formId = params.id as string;

  useEffect(() => {
    const loadForm = async () => {
      try {
        const formData = await getForm(formId);
        setForm(formData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivado';
      default:
        return status;
    }
  };

  const getFieldTypeLabel = (fieldType: string) => {
    const typeLabels: Record<string, string> = {
      'text': 'Texto',
      'email': 'Email',
      'tel': 'Teléfono',
      'textarea': 'Área de Texto',
      'select': 'Selección',
      'radio': 'Opción Única',
      'checkbox': 'Casillas',
      'date': 'Fecha',
      'number': 'Número'
    };
    return typeLabels[fieldType] || fieldType;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-corporate-navy mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Formulario no encontrado</h1>
          <Button asChild>
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Formularios
            </Link>
          </Button>
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-corporate-navy via-corporate-navy/80 to-corporate-green dark:from-corporate-navy dark:via-corporate-gray-light dark:to-corporate-green bg-clip-text text-transparent">
                {form.title}
              </h1>
              <Badge className={getStatusColor(form.status)}>
                {getStatusText(form.status)}
              </Badge>
            </div>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/forms/${form.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          {form.status === 'published' && (
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          )}
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estadísticas
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(form.status)}>
                    {getStatusText(form.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Campos</label>
                <p className="mt-1 text-sm">{form.form_fields?.length || 0} campos</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado</label>
                <p className="mt-1 text-sm">
                  {form.created_at ? new Date(form.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
                <p className="mt-1 text-sm">
                  {form.updated_at ? new Date(form.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              
              {form.webhook_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                  <p className="mt-1 text-sm break-all">{form.webhook_url}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campos del Formulario</CardTitle>
            </CardHeader>
            <CardContent>
              {!form.form_fields || form.form_fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No hay campos definidos</h3>
                  <p>Este formulario no tiene campos configurados</p>
                  <Button asChild className="mt-4">
                    <Link href={`/admin/forms/${form.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Agregar Campos
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.form_fields
                    .sort((a: any, b: any) => (a.field_order || 0) - (b.field_order || 0))
                    .map((field: any, index: number) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium">{field.label}</span>
                          {field.is_required && <span className="text-red-500">*</span>}
                        </div>
                        <Badge variant="secondary">
                          {getFieldTypeLabel(field.field_type)}
                        </Badge>
                      </div>
                      
                      {field.help_text && (
                        <p className="text-sm text-muted-foreground mb-2">{field.help_text}</p>
                      )}
                      
                      {field.placeholder && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Placeholder:</span> {field.placeholder}
                        </p>
                      )}
                      
                      {field.options && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-muted-foreground">Opciones:</span>
                          <ul className="mt-1 text-sm list-disc list-inside">
                            {field.options.map((option: string, i: number) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {field.default_value && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Valor por defecto:</span> {field.default_value}
                        </p>
                      )}
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