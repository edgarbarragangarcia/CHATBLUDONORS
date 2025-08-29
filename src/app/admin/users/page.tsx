import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function UsersPage() {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !ADMIN_USERS.includes(authUser.email ?? '')) {
    return redirect('/');
  }

  // Fetch all users from Supabase Auth
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    // Handle the error appropriately
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not fetch users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>There was an issue retrieving the user list from the database. Please check the server logs.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const mappedUsers = users.map((u) => ({
    id: u.id,
    name: u.user_metadata?.full_name || u.email?.split('@')[0],
    email: u.email,
    avatar: u.user_metadata?.avatar_url,
    role: ADMIN_USERS.includes(u.email ?? '') ? 'admin' : 'user',
  }));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage your application users and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {mappedUsers.map((u) => (
                    <TableRow key={u.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
