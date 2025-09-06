'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import {
  Plus,
  Save,
  Eye,
  ArrowLeft,
  GripVertical,
  Trash2,
  Edit,
  Type,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  Circle,
  List,
  FileText,
  Hash,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createForm } from '../actions';
import { useToast } from '@/hooks/use-toast';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormData {
  title: string;
  description: string;
  webhook_url: string;
  fields: FormField[];
}

const fieldTypes = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Teléfono', icon: Phone },
  { type: 'textarea', label: 'Área de Texto', icon: FileText },
  { type: 'select', label: 'Lista Desplegable', icon: List },
  { type: 'radio', label: 'Opción Única', icon: Circle },
  { type: 'checkbox', label: 'Casillas de Verificación', icon: CheckSquare },
  { type: 'date', label: 'Fecha', icon: Calendar },
  { type: 'number', label: 'Número', icon: Hash },
  { type: 'rating', label: 'Calificación', icon: Star },
];

export default function CreateFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    webhook_url: '',
    fields: []
  });
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
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

  const updateField = (updatedField: FormField) => {
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({ ...prev, fields: items }));
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
      const formToSave = {
        title: formData.title,
        description: formData.description,
        webhook_url: formData.webhook_url || undefined,
        status: 'draft' as const,
        fields: formData.fields.map((field, index) => ({
          field_type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          help_text: field.description,
          is_required: field.required,
          field_order: index,
          options: field.options,
        }))
      };

      await createForm(formToSave);
      
      toast({
        title: "Éxito",
        description: "Formulario creado exitosamente",
      });
      
      router.push('/admin/forms');
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el formulario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.type === type);
    return fieldType ? fieldType.icon : Type;
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input 
            placeholder={field.placeholder || field.label} 
            disabled 
            className="bg-muted"
          />
        );
      case 'textarea':
        return (
          <Textarea 
            placeholder={field.placeholder || field.label} 
            disabled 
            className="bg-muted"
          />
        );
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger className="bg-muted">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
          </Select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" disabled className="text-purple-600" />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="text-purple-600" />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'date':
        return (
          <Input 
            type="date" 
            disabled 
            className="bg-muted"
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            placeholder={field.placeholder || "0"} 
            disabled 
            className="bg-muted"
          />
        );
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 text-yellow-400" />
            ))}
          </div>
        );
      default:
        return <Input disabled className="bg-muted" />;
    }
  };

  if (previewMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Editor
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{formData.title || 'Título del Formulario'}</CardTitle>
            <CardDescription>{formData.description || 'Descripción del formulario'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                {renderFieldPreview(field)}
              </div>
            ))}
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
              Enviar Formulario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" asChild className="touch-target">
            <Link href="/admin/forms">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
              <span className="sm:hidden">Atrás</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              Crear Formulario
            </h1>
            <p className="text-responsive-xs text-muted-foreground mt-1 hidden sm:block">
              Diseña tu formulario arrastrando y soltando campos
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(true)}
            disabled={formData.fields.length === 0}
            className="flex-1 sm:flex-none touch-target"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Vista Previa</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          <Button 
            onClick={saveForm}
            disabled={!formData.title || formData.fields.length === 0 || isSaving}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 touch-target"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar Formulario'}</span>
            <span className="sm:hidden">{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-responsive-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-responsive-sm">Título del Formulario</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Formulario de Contacto"
                  className="touch-target"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-responsive-sm">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito del formulario"
                  rows={3}
                  className="touch-target"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_url" className="text-responsive-sm">URL del Webhook (Opcional)</Label>
                <Input
                  id="webhook_url"
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder="https://ejemplo.com/webhook"
                  className="touch-target"
                />
              </div>
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-responsive-lg">Tipos de Campo</CardTitle>
              <CardDescription className="text-responsive-xs">
                <span className="hidden sm:inline">Arrastra los campos al formulario</span>
                <span className="sm:hidden">Toca para agregar campos</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-2">
                {fieldTypes.map((fieldType) => {
                  const Icon = fieldType.icon;
                  return (
                    <Button
                      key={fieldType.type}
                      variant="outline"
                      className="justify-start h-auto p-3 hover:bg-purple-50 dark:hover:bg-purple-950 touch-target"
                      onClick={() => addField(fieldType.type as FormField['type'])}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600" />
                      <span className="text-responsive-sm">{fieldType.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-3">
          <Card className="min-h-[400px] sm:min-h-[600px]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Constructor de Formulario</span>
                <span className="sm:hidden">Constructor</span>
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                {formData.fields.length === 0 
                  ? 'Agrega campos desde el panel lateral'
                  : `${formData.fields.length} campo(s) agregado(s)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {formData.fields.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-responsive-lg font-semibold mb-2">Formulario Vacío</h3>
                  <p className="text-muted-foreground text-responsive-sm">
                    <span className="hidden sm:inline">Comienza agregando campos desde el panel lateral</span>
                    <span className="sm:hidden">Agrega campos desde arriba</span>
                  </p>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 sm:space-y-4"
                      >
                        {formData.fields.map((field, index) => {
                          const Icon = getFieldIcon(field.type);
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 sm:p-4 border rounded-lg bg-card hover:shadow-md transition-shadow touch-target ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab hover:cursor-grabbing touch-target flex-shrink-0"
                                      >
                                        <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                      </div>
                                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-responsive-sm truncate">{field.label}</div>
                                        <div className="text-responsive-xs text-muted-foreground capitalize">
                                          {fieldTypes.find(ft => ft.type === field.type)?.label}
                                        </div>
                                      </div>
                                      {field.required && (
                                        <Badge variant="secondary" className="text-responsive-xs flex-shrink-0">
                                          <span className="hidden sm:inline">Requerido</span>
                                          <span className="sm:hidden">Req</span>
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingField(field);
                                          setIsFieldDialogOpen(true);
                                        }}
                                        className="touch-target p-1 sm:p-2"
                                      >
                                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteField(field.id)}
                                        className="text-red-600 hover:text-red-700 touch-target p-1 sm:p-2"
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="ml-5 sm:ml-7">
                                    {renderFieldPreview(field)}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Field Edit Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-responsive-lg">Editar Campo</DialogTitle>
            <DialogDescription className="text-responsive-sm">
              Configura las propiedades del campo
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <FieldEditor
              field={editingField}
              onSave={updateField}
              onCancel={() => setIsFieldDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Field Editor Component
function FieldEditor({ 
  field, 
  onSave, 
  onCancel 
}: { 
  field: FormField; 
  onSave: (field: FormField) => void; 
  onCancel: () => void; 
}) {
  const [editedField, setEditedField] = useState<FormField>({ ...field });

  const handleSave = () => {
    onSave(editedField);
  };

  const updateOptions = (options: string[]) => {
    setEditedField(prev => ({ ...prev, options }));
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), `Opción ${(editedField.options?.length || 0) + 1}`];
    updateOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = editedField.options?.filter((_, i) => i !== index) || [];
    updateOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field-label" className="text-responsive-sm">Etiqueta del Campo</Label>
        <Input
          id="field-label"
          value={editedField.label}
          onChange={(e) => setEditedField(prev => ({ ...prev, label: e.target.value }))}
          className="touch-target"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-placeholder" className="text-responsive-sm">Placeholder (opcional)</Label>
        <Input
          id="field-placeholder"
          value={editedField.placeholder || ''}
          onChange={(e) => setEditedField(prev => ({ ...prev, placeholder: e.target.value }))}
          className="touch-target"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-description" className="text-responsive-sm">Descripción (opcional)</Label>
        <Textarea
          id="field-description"
          value={editedField.description || ''}
          onChange={(e) => setEditedField(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="touch-target"
        />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <Switch
          id="field-required"
          checked={editedField.required}
          onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, required: checked }))}
        />
        <Label htmlFor="field-required" className="text-responsive-sm cursor-pointer">Campo requerido</Label>
      </div>

      {(editedField.type === 'select' || editedField.type === 'radio' || editedField.type === 'checkbox') && (
        <div className="space-y-2">
          <Label className="text-responsive-sm">Opciones</Label>
          <div className="space-y-2">
            {editedField.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                  className="touch-target flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-600 touch-target p-1 sm:p-2 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full touch-target"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-responsive-sm">Agregar Opción</span>
            </Button>
          </div>
        </div>
      )}

      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel} className="touch-target text-responsive-sm">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="touch-target text-responsive-sm">
          Guardar Cambios
        </Button>
      </DialogFooter>
    </div>
  );
}