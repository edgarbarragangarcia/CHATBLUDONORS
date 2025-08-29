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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

// Placeholder data for chats
const chats = [
    { id: '1', name: 'General', participants: ['Edgar Barragan', 'Nancy Torres', 'John Doe'] },
    { id: '2', name: 'Support Team', participants: ['Nancy Torres', 'Jane Smith'] },
    { id: '3', name: 'Project X', participants: ['Edgar Barragan', 'John Doe', 'Jane Smith'] },
]

export default async function ChatsPage() {
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
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Chats</CardTitle>
                <CardDescription>Create and manage chat rooms.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Chat
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Chat Name</TableHead>
                    <TableHead>Participants</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {chats.map((c) => (
                    <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.participants.join(', ')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
