
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
import { DeleteChatButton } from './delete-chat-button';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function ChatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''))) {
    redirect('/login');
  }

  const chats = await getChats();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Chats</h1>
          <p className="text-muted-foreground">Crear y gestionar salas de chat</p>
        </div>
        <CreateChatDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Mensajes</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell className="font-medium">{chat.name}</TableCell>
                  <TableCell>{chat.description}</TableCell>
                  <TableCell>
                    {new Date(chat.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>{chat.message_count || 0}</TableCell>
                  <TableCell>
                    <DeleteChatButton chatId={chat.id} chatName={chat.name} />
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
