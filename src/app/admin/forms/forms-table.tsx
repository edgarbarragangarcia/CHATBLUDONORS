'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Edit, Copy, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { deleteForm, duplicateForm, updateFormStatus } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Form {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  form_fields?: any[];
}

interface FormsTableProps {
  forms: Form[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Publicado</Badge>;
    case 'draft':
      return <Badge variant="secondary">Borrador</Badge>;
    case 'archived':
      return <Badge variant="outline">Archivado</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function FormsTable({ forms }: FormsTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el formulario "${formTitle}"?`)) {
      return;
    }

    setIsLoading(formId);
    try {
      await deleteForm(formId);
      toast({
        title: "Formulario eliminado",
        description: `El formulario "${formTitle}" ha sido eliminado exitosamente.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el formulario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDuplicateForm = async (formId: string, formTitle: string) => {
    setIsLoading(formId);
    try {
      await duplicateForm(formId);
      toast({
        title: "Formulario duplicado",
        description: `Se ha creado una copia de "${formTitle}".`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo duplicar el formulario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleStatusChange = async (formId: string, newStatus: 'draft' | 'published' | 'archived', formTitle: string) => {
    setIsLoading(formId);
    try {
      await updateFormStatus(formId, newStatus);
      const statusText = newStatus === 'published' ? 'publicado' : newStatus === 'draft' ? 'borrador' : 'archivado';
      toast({
        title: "Estado actualizado",
        description: `El formulario "${formTitle}" ahora está ${statusText}.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del formulario.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay formularios</h3>
        <p className="text-muted-foreground mb-4">
          Comienza creando tu primer formulario
        </p>
        <Button asChild>
          <Link href="/admin/forms/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Formulario
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-center">Campos</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map((form) => (
          <TableRow key={form.id} className="hover:bg-muted/50">
            <TableCell>
              <div>
                <div className="font-medium">{form.title}</div>
                {form.description && (
                  <div className="text-sm text-muted-foreground">
                    {form.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(form.status)}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline">{form.form_fields?.length || 0}</Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(form.updated_at).toLocaleDateString('es-ES')}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    disabled={isLoading === form.id}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  {form.status !== 'published' && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(form.id, 'published', form.title)}
                      disabled={isLoading === form.id}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Publicar
                    </DropdownMenuItem>
                  )}
                  {form.status === 'published' && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(form.id, 'draft', form.title)}
                      disabled={isLoading === form.id}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Despublicar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => handleDuplicateForm(form.id, form.title)}
                    disabled={isLoading === form.id}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteForm(form.id, form.title)}
                    className="text-red-600 focus:text-red-600"
                    disabled={isLoading === form.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}