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
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    fields: []
  });
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  const saveForm = () => {
    // Aquí se implementaría la lógica para guardar en la base de datos
    console.log('Guardando formulario:', formData);
    router.push('/admin/forms');
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
              Crear Formulario
            </h1>
            <p className="text-muted-foreground mt-1">
              Diseña tu formulario arrastrando y soltando campos
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
            disabled={!formData.title || formData.fields.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Formulario
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
                  placeholder="Describe el propósito del formulario"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Campo</CardTitle>
              <CardDescription>
                Arrastra los campos al formulario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {fieldTypes.map((fieldType) => {
                  const Icon = fieldType.icon;
                  return (
                    <Button
                      key={fieldType.type}
                      variant="outline"
                      className="justify-start h-auto p-3 hover:bg-purple-50 dark:hover:bg-purple-950"
                      onClick={() => addField(fieldType.type as FormField['type'])}
                    >
                      <Icon className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="text-sm">{fieldType.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Constructor de Formulario
              </CardTitle>
              <CardDescription>
                {formData.fields.length === 0 
                  ? 'Agrega campos desde el panel lateral'
                  : `${formData.fields.length} campo(s) agregado(s)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.fields.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Formulario Vacío</h3>
                  <p className="text-muted-foreground">
                    Comienza agregando campos desde el panel lateral
                  </p>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {formData.fields.map((field, index) => {
                          const Icon = getFieldIcon(field.type);
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 border rounded-lg bg-card hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab hover:cursor-grabbing"
                                      >
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <Icon className="h-4 w-4 text-purple-600" />
                                      <div>
                                        <div className="font-medium">{field.label}</div>
                                        <div className="text-sm text-muted-foreground capitalize">
                                          {fieldTypes.find(ft => ft.type === field.type)?.label}
                                        </div>
                                      </div>
                                      {field.required && (
                                        <Badge variant="secondary" className="text-xs">
                                          Requerido
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
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
                                        onClick={() => deleteField(field.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="ml-7">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Campo</DialogTitle>
            <DialogDescription>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field-label">Etiqueta del Campo</Label>
        <Input
          id="field-label"
          value={editedField.label}
          onChange={(e) => setEditedField(prev => ({ ...prev, label: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-placeholder">Placeholder (opcional)</Label>
        <Input
          id="field-placeholder"
          value={editedField.placeholder || ''}
          onChange={(e) => setEditedField(prev => ({ ...prev, placeholder: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-description">Descripción (opcional)</Label>
        <Textarea
          id="field-description"
          value={editedField.description || ''}
          onChange={(e) => setEditedField(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="field-required"
          checked={editedField.required}
          onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, required: checked }))}
        />
        <Label htmlFor="field-required">Campo requerido</Label>
      </div>

      {(editedField.type === 'select' || editedField.type === 'radio' || editedField.type === 'checkbox') && (
        <div className="space-y-2">
          <Label>Opciones</Label>
          <div className="space-y-2">
            {editedField.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Opción
            </Button>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar Cambios
        </Button>
      </DialogFooter>
    </div>
  );
}