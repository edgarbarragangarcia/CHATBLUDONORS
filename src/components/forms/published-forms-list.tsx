'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type PublishedForm = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    form_fields: {
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
    }[];
};

interface PublishedFormsListProps {
    publishedForms: PublishedForm[];
    selectedFormId: string | null;
    onSelectForm: (formId: string) => void;
}

export function PublishedFormsList({ publishedForms, selectedFormId, onSelectForm }: PublishedFormsListProps) {
    if (publishedForms.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            Formularios
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground/70 ml-11">
                        Selecciona un formulario para completar
                    </p>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">No hay formularios disponibles</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Formularios
                    </h2>
                </div>
                <p className="text-xs text-muted-foreground/70 ml-11">
                    Selecciona un formulario para completar
                </p>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {publishedForms.map((form) => {
                    const isSelected = selectedFormId === form.id;
                    const fieldsCount = form.form_fields?.length || 0;
                    
                    return (
                        <Card 
                            key={form.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isSelected 
                                    ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                                    : 'hover:bg-muted/50'
                            }`}
                            onClick={() => onSelectForm(form.id)}
                        >
                            <CardHeader className="p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        }`}>
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-xs font-medium truncate">
                                                {form.title}
                                            </CardTitle>
                                            {form.description && (
                                                <CardDescription className="text-xs mt-1 line-clamp-2">
                                                    {form.description}
                                                </CardDescription>
                                            )}
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                <span>{fieldsCount} campos</span>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {formatDistanceToNow(new Date(form.created_at), {
                                                            addSuffix: true,
                                                            locale: es
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}