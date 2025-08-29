
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatRoomList } from '@/components/chat/chat-room-list';

// This function now fetches real data from your Supabase tables.
async function getPermittedChatsForUser(userId: string) {
    const supabase = createClient();
    
    // 1. Get all chats
    const { data: allChats, error: chatsError } = await supabase.from('chats').select('*');
    if (chatsError) {
        console.error('Error fetching chats:', chatsError.message);
        return [];
    }

    // 2. Get user's permissions
    const { data: permissions, error: permissionsError } = await supabase
        .from('user_chat_permissions')
        .select('chat_id')
        .eq('user_id', userId)
        .eq('has_access', true);
    
    if (permissionsError) {
        console.error('Error fetching user permissions:', permissionsError.message);
        // Return no chats if permissions can't be fetched
        return [];
    }

    const permittedChatIds = new Set(permissions.map(p => p.chat_id));

    // 3. Filter all chats to only include those the user has access to
    const availableChats = allChats.filter(chat => permittedChatIds.has(chat.id));
    
    return availableChats;
}

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const availableChats = await getPermittedChatsForUser(user.id);

  return <ChatRoomList user={user} availableChats={availableChats} />;
}
