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

// This is a placeholder. In a real app, you would fetch users from your database
const users = [
    { id: '1', name: 'Edgar Barragan', email: 'eabarragang@ingenes.com', avatar: '', role: 'admin' },
    { id: '2', name: 'Nancy Torres', email: 'ntorres@ingenes.com', avatar: '', role: 'admin' },
    { id: '6', name: 'Admin User', email: 'administrador@ingenes.com', avatar: '', role: 'admin' },
    { id: '3', name: 'John Doe', email: 'john.doe@example.com', avatar: '', role: 'user' },
    { id: '4', name: 'Jane Smith', email: 'jane.smith@example.com', avatar: '', role: 'user' },
    { id: '5', name: 'Test User', email: 'test.user@example.com', avatar: '', role: 'user' },
]

export default async function UsersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_USERS.includes(user.email ?? '')) {
    return redirect('/');
  }

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
                {users.map((u) => (
                    <TableRow key={u.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.name?.charAt(0)}</AvatarFallback>
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
