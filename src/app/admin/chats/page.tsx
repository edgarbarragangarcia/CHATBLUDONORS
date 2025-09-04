
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
import { getChats } from './actions';
import { CreateChatDialog } from './create-chat-dialog';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function ChatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''))) {
    return redirect('/');
  }

  const chats = await getChats();

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Chats</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Create and manage chat rooms.</p>
            </div>
            <CreateChatDialog />
        </div>
       <Card>
        <CardContent className='p-0'>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[150px]">Chat Name</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {chats.map((c: { id: string; name: string; description: string }) => (
                        <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm sm:text-base">{c.description}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
