
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

// Function to get permitted forms for a user
async function getPermittedFormsForUser(userId: string) {
    const supabase = await createClient();
    
    // Get all forms the user has explicit permission for and are published
    const { data: permissions, error: permissionsError } = await supabase
        .from('user_form_permissions')
        .select(`
            form_id, 
            forms!inner(
                id,
                title,
                description,
                status,
                is_active,
                created_at,
                form_fields(
                    id,
                    field_type,
                    label,
                    placeholder,
                    help_text,
                    is_required,
                    field_order,
                    validation_rules,
                    options,
                    default_value
                )
            )
        `)
        .eq('user_id', userId)
        .eq('has_access', true)
        .eq('forms.status', 'published')
        .eq('forms.is_active', true);
    
    if (permissionsError) {
        console.error('Error fetching form permissions:', permissionsError.message);
        return [];
    }

    // Extract forms from the permissions data
    const availableForms = permissions?.map(p => p.forms).filter(Boolean) || [];
    
    return availableForms;
}



export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const [availableChats, availableForms] = await Promise.all([
    getPermittedChatsForUser(user.id),
    getPermittedFormsForUser(user.id)
  ]);

  // Check if user is admin
  const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];
  const isAdmin = user.app_metadata?.role === 'admin' || 
                  ADMIN_USERS.includes(user.email ?? '');

  // The 'user' object might contain non-serializable properties.
  // We should pass only what's needed to the client component.
  const { id, email, user_metadata, app_metadata } = user;
  const serializableUser = { id, email, user_metadata, app_metadata };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar user={serializableUser as any} isAdmin={isAdmin} />
      <main className="flex-1">
        <ChatLayout user={serializableUser as any} availableChats={availableChats as any[]} availableForms={availableForms as any[]} />
      </main>
    </div>
  );
}
