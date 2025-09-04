
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUsers, getChats, getAllUserChatPermissions } from './actions';
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
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''))) {
    return redirect('/');
  }
  
  try {
    const [usersData, chatsData, permissionsData] = await Promise.all([
      getUsers(),
      getChats(),
      getAllUserChatPermissions(),
    ]);

    return (
        <UserManagementTable 
            initialUsers={usersData}
            initialChats={chatsData}
            initialPermissions={permissionsData}
        />
    );
  } catch(error: any) {
       if (error.message === 'MISSING_SERVICE_KEY') {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Configuration Error: Missing Service Role Key</AlertTitle>
                    <AlertDescription>
                        <p className="font-semibold mt-2">The admin panel cannot function because the Supabase Service Role Key is missing.</p>
                        <p className="mt-2">To fix this, you must add your Supabase Service Role Key as an environment variable named `SUPABASE_SERVICE_ROLE_KEY`.</p>
                        <p className="mt-2">You can get this key from your Supabase project dashboard under `Project Settings > API > Project API keys`.</p>
                        <p className="mt-2">Please add it to your environment variables and restart the application.</p>
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
                    <CardDescription>Could not fetch data for user management.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">
                       An unexpected error occurred: {error.message || 'Unknown error'}. 
                       Please check the server logs for more details.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }
}
