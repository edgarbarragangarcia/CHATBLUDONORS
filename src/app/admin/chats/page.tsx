
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { getChats } from './actions';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function ChatsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''))) {
    return redirect('/');
  }

  const chats = await getChats();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Chats</h2>
                <p className="text-muted-foreground">Create and manage chat rooms.</p>
            </div>
            <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Chat (Soon)
            </Button>
        </div>
       <Card>
        <CardContent className='p-0'>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Chat Name</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {chats.map((c) => (
                    <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
