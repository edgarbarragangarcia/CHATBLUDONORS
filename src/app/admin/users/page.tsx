
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
import { Loader2 } from 'lucide-react';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function UsersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_USERS.includes(user.email ?? '')) {
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
  } catch(error) {
      console.error("Failed to load user management data:", error);
       return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not fetch data for user management.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">
                        Could not fetch data. Please check Supabase connection and policies.
                        Ensure the `SUPABASE_SERVICE_ROLE_KEY` is set correctly in your environment variables.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }
}
