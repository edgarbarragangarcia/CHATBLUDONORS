import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatRoomList } from '@/components/chat/chat-room-list';

// These would normally come from your database
const ALL_CHATS = [
    { id: 'general', name: 'Chat General', description: 'Conversaciones sobre temas generales.' },
    { id: 'support', name: 'Chat de Soporte', description: 'Resolución de dudas y problemas técnicos.' },
    { id: 'project-x', name: 'Proyecto X', description: 'Discusiones del equipo sobre el Proyecto X.' },
];

async function getUserPermissions(userId: string) {
    // In a real app, you would fetch this from your `user_chat_permissions` table in Supabase.
    // For this example, we'll simulate it based on our admin panel's logic.
    // Let's assume every user has access to general, and the rest is random for demonstration.
    return ['general', Math.random() > 0.5 ? 'support' : null, Math.random() > 0.5 ? 'project-x' : null].filter(Boolean) as string[];
}


export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const permittedChatIds = await getUserPermissions(user.id);
  const availableChats = ALL_CHATS.filter(chat => permittedChatIds.includes(chat.id));

  return <ChatRoomList user={user} availableChats={availableChats} />;
}
