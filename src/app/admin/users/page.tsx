
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUsers, getChats, getAllUserChatPermissions, getForms, getAllUserFormPermissions } from './actions';
import { UserManagementTable } from './user-management-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''))) {
    return redirect('/');
  }
  
  try {
    const [usersData, chatsData, permissionsData, formsData, formPermissionsData] = await Promise.all([
      getUsers(),
      getChats(),
      getAllUserChatPermissions(),
      getForms(),
      getAllUserFormPermissions(),
    ]);

    return (
        <UserManagementTable 
            initialUsers={usersData}
            initialChats={chatsData}
            initialPermissions={permissionsData}
            initialForms={formsData}
            initialFormPermissions={formPermissionsData}
        />
    );
  } catch(error: any) {
       if (error.message === 'MISSING_SERVICE_KEY') {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error de Configuración: Falta la Clave de Rol de Servicio</AlertTitle>
                    <AlertDescription>
                        <p className="font-semibold mt-2">El panel de administración no puede funcionar porque falta la Clave de Rol de Servicio de Supabase.</p>
                        <p className="mt-2">Para solucionarlo, debes agregar tu Clave de Rol de Servicio de Supabase como una variable de entorno llamada <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>
                        <p className="mt-2">Puedes obtener esta clave desde el panel de tu proyecto Supabase en <code>Configuración del Proyecto &gt; API &gt; Claves de API del Proyecto</code>.</p>
                        <p className="mt-2">Por favor agrégala a tus variables de entorno y reinicia la aplicación.</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
       }
      
       return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>No se pudieron obtener los datos para la gestión de usuarios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">
                       Ocurrió un error inesperado: {error.message || 'Error desconocido'}. 
                       Por favor revisa los logs del servidor para más detalles.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }
}
