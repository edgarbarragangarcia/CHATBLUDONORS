import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Calendar,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { getForms, getFormStats } from './actions';
import { FormsTable } from './forms-table';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function FormsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !ADMIN_USERS.includes(user.email || '')) {
    redirect('/login');
  }

  const forms = await getForms();
  const stats = await getFormStats();
  
  // Calcular promedio de campos
  const averageFields = forms.length > 0 
    ? Math.round(forms.reduce((total, form) => total + (form.form_fields?.length || 0), 0) / forms.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Gestión de Formularios
          </h1>
          <p className="text-muted-foreground mt-2">
            Crea, edita y gestiona formularios dinámicos para tu organización
          </p>
        </div>
        <Button 
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Link href="/admin/forms/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Formulario
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formularios</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedForms} publicados
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-pink-200 dark:border-pink-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respuestas</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.totalResponses}
            </div>
            <p className="text-xs text-muted-foreground">
              Respuestas recibidas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Campos</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageFields}
            </div>
            <p className="text-xs text-muted-foreground">
              Campos por formulario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Formularios
          </CardTitle>
          <CardDescription>
            Gestiona todos tus formularios desde aquí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormsTable forms={forms} />
        </CardContent>
      </Card>
    </div>
  );
}