
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatLayout } from '@/components/chat/chat-layout';
import MainNavbar from '@/components/ui/main-navbar';

// This function now fetches real data from your Supabase tables.
async function getPermittedChatsForUser(userId: string) {
    // We use the standard client here, which will use the user's session
    const supabase = await createClient();
    
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const availableChats = await getPermittedChatsForUser(user.id);

  // Check if user is admin
  const isAdmin = user.app_metadata?.role === 'admin' || 
                  user.email === 'edgar.barragan@ingenes.com';

  // The 'user' object might contain non-serializable properties.
  // We should pass only what's needed to the client component.
  const { id, email, user_metadata, app_metadata } = user;
  const serializableUser = { id, email, user_metadata, app_metadata };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar user={serializableUser as any} isAdmin={isAdmin} />
      <main className="flex-1">
        <ChatLayout user={serializableUser as any} availableChats={availableChats as any[]} />
      </main>
    </div>
  );
}
