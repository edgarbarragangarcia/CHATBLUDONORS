'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

type FormField = {
    id: string;
    field_type: string;
    label: string;
    placeholder?: string;
    help_text?: string;
    is_required: boolean;
    field_order: number;
    validation_rules?: any;
    options?: any;
    default_value?: any;
};

type PublishedForm = {
    id: string;
    title: string;
    description: string;
    webhook_url?: string;
    created_at: string;
    form_fields: FormField[];
};

interface FormViewerProps {
    form: PublishedForm;
    user: any;
}

export function FormViewer({ form, user }: FormViewerProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

    // Sort fields by field_order
    const sortedFields = [...form.form_fields].sort((a, b) => a.field_order - b.field_order);

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => ({ ...prev, [fieldId]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        sortedFields.forEach(field => {
            const value = formData[field.id];
            
            // Check required fields
            if (field.is_required && (!value || value === '')) {
                newErrors[field.id] = 'Este campo es obligatorio';
            }
            
            // Email validation
            if (field.field_type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors[field.id] = 'Ingresa un email válido';
                }
            }
            
            // Number validation
            if (field.field_type === 'number' && value) {
                if (isNaN(Number(value))) {
                    newErrors[field.id] = 'Ingresa un número válido';
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: 'Error de validación',
                description: 'Por favor corrige los errores en el formulario',
                variant: 'destructive'
            });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const supabase = createClient();
            
            // Guardar respuesta en la base de datos
            const { data: responseData, error: responseError } = await supabase
                .from('form_responses')
                .insert({
                    form_id: form.id,
                    user_email: user.email,
                    submitted_at: new Date().toISOString()
                })
                .select('id')
                .single();
            
            if (responseError) {
                throw responseError;
            }
            
            // Guardar valores individuales de cada campo
            const responseValues = Object.entries(formData).map(([fieldId, value]) => ({
                response_id: responseData.id,
                field_id: fieldId,
                value: typeof value === 'string' ? value : JSON.stringify(value),
                value_json: typeof value === 'object' ? value : null
            }));
            
            if (responseValues.length > 0) {
                const { error: valuesError } = await supabase
                    .from('form_response_values')
                    .insert(responseValues);
                
                if (valuesError) {
                    throw valuesError;
                }
            }
            
            // Enviar datos al webhook si está configurado
            if (form.webhook_url) {
                try {
                    const webhookPayload = {
                        webhook_url: form.webhook_url,
                        form_id: form.id,
                        form_title: form.title,
                        user_email: user.email,
                        response_data: formData,
                        submitted_at: new Date().toISOString()
                    };
                    
                    
                    // Usar la ruta API proxy para evitar problemas de CORS
                    const webhookResponse = await fetch('/api/webhook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(webhookPayload)
                    });
                    
                    const result = await webhookResponse.json();
                    
                    if (webhookResponse.ok && result.success) {
                    } else {
                        console.warn('Error en webhook via proxy:', result);
                    }
                    
                } catch (webhookError) {
                    console.error('Error enviando webhook via proxy:', webhookError);
                    // No mostramos error al usuario ya que el formulario se guardó correctamente
                }
            }
            
            toast({
                title: 'Éxito',
                description: 'Formulario enviado exitosamente'
            });
            setFormData({});
            
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                title: 'Error',
                description: 'Error al enviar el formulario',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        const value = formData[field.id] || field.default_value || '';
        const hasError = !!errors[field.id];
        
        switch (field.field_type) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <div key={field.id} className="space-y-2 sm:space-y-3">
                        <Label htmlFor={field.id} className="text-responsive-sm font-medium">
                            {field.label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={field.id}
                            type={field.field_type}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className={`touch-target ${hasError ? 'border-red-500' : ''}`}
                        />
                        {field.help_text && (
                            <p className="text-responsive-xs text-muted-foreground">{field.help_text}</p>
                        )}
                        {hasError && (
                            <p className="text-responsive-xs text-red-500">{errors[field.id]}</p>
                        )}
                    </div>
                );
                
            case 'textarea':
                return (
                    <div key={field.id} className="space-y-2 sm:space-y-3">
                        <Label htmlFor={field.id} className="text-responsive-sm font-medium">
                            {field.label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className={`touch-target ${hasError ? 'border-red-500' : ''}`}
                            rows={3}
                        />
                        {field.help_text && (
                            <p className="text-responsive-xs text-muted-foreground">{field.help_text}</p>
                        )}
                        {hasError && (
                            <p className="text-responsive-xs text-red-500">{errors[field.id]}</p>
                        )}
                    </div>
                );
                
            case 'select':
                const options = field.options || [];
                return (
                    <div key={field.id} className="space-y-2 sm:space-y-3">
                        <Label htmlFor={field.id} className="text-responsive-sm font-medium">
                            {field.label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
                            <SelectTrigger className={`touch-target ${hasError ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder={field.placeholder || 'Selecciona una opción'} />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option: string, index: number) => (
                                    <SelectItem key={index} value={option} className="touch-target">
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.help_text && (
                            <p className="text-responsive-xs text-muted-foreground">{field.help_text}</p>
                        )}
                        {hasError && (
                            <p className="text-responsive-xs text-red-500">{errors[field.id]}</p>
                        )}
                    </div>
                );
                
            case 'radio':
                const radioOptions = field.options || [];
                return (
                    <div key={field.id} className="space-y-2 sm:space-y-3">
                        <Label className="text-responsive-sm font-medium">
                            {field.label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <RadioGroup
                            value={value}
                            onValueChange={(val) => handleFieldChange(field.id, val)}
                            className="space-y-2 sm:space-y-3"
                        >
                            {radioOptions.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 sm:space-x-3 touch-target">
                                    <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                                    <Label htmlFor={`${field.id}-${index}`} className="text-responsive-sm cursor-pointer">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {field.help_text && (
                            <p className="text-responsive-xs text-muted-foreground">{field.help_text}</p>
                        )}
                        {hasError && (
                            <p className="text-responsive-xs text-red-500">{errors[field.id]}</p>
                        )}
                    </div>
                );
                
            case 'checkbox':
                return (
                    <div key={field.id} className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2 sm:space-x-3 touch-target">
                            <Checkbox
                                id={field.id}
                                checked={!!value}
                                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                            />
                            <Label htmlFor={field.id} className="text-responsive-sm font-medium cursor-pointer">
                                {field.label}
                                {field.is_required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        </div>
                        {field.help_text && (
                            <p className="text-responsive-xs text-muted-foreground ml-6 sm:ml-7">{field.help_text}</p>
                        )}
                        {hasError && (
                            <p className="text-responsive-xs text-red-500 ml-6 sm:ml-7">{errors[field.id]}</p>
                        )}
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col mobile-safe-area">
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg sm:text-xl truncate">{form.title}</CardTitle>
                                {form.description && (
                                    <CardDescription className="mt-1 sm:mt-2 text-sm line-clamp-2">
                                        {form.description}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
                            {sortedFields.map(renderField)}
                            
                            <div className="flex justify-end pt-4 sm:pt-6 border-t">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="min-w-24 sm:min-w-32 text-responsive-sm touch-target w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="text-responsive-sm">Enviando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="text-responsive-sm">Enviar</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}