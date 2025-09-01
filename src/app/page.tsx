
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatLayout } from '@/components/chat/chat-layout';

// This function now fetches real data from your Supabase tables.
async function getPermittedChatsForUser(userId: string) {
    // We use the standard client here, which will use the user's session
    const supabase = createClient();
    
    // 1. Get all chats the user has explicit permission for
    const { data: permissions, error: permissionsError } = await supabase
        .from('user_chat_permissions')
        .select('chat_id, chats(*)') // Join with chats table
        .eq('user_id', userId)
        .eq('has_access', true);
    
    if (permissionsError) {
        console.error('Error fetching user permissions:', permissionsError.message);
        // Return no chats if permissions can't be fetched
        return [];
    }

    // The result from the join is an array of objects, where each object
    // has a 'chats' property containing the chat details.
    const availableChats = permissions.map(p => p.chats).filter(Boolean); // Filter out any nulls
    
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

  // The 'user' object might contain non-serializable properties.
  // We should pass only what's needed to the client component.
  const { id, email, user_metadata } = user;
  const serializableUser = { id, email, user_metadata };

  return <ChatLayout user={serializableUser as any} availableChats={availableChats as any[]} />;
}
