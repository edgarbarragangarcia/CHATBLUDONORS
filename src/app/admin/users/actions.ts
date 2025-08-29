
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This function fetches all users from Supabase Auth
export async function getUsers() {
  const supabase = createClient();
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    throw new Error('Could not fetch users from Supabase.');
  }
  return users;
}

// This function fetches all available chats from the 'chats' table
export async function getChats() {
    const supabase = createClient();
    const { data, error } = await supabase.from('chats').select('*');
    if (error) {
        console.error('Error fetching chats:', error.message);
        throw new Error('Could not fetch chats from Supabase.');
    }
    return data;
}

// This function fetches all permissions from the 'user_chat_permissions' table
export async function getAllUserChatPermissions() {
    const supabase = createClient();
    const { data, error } = await supabase.from('user_chat_permissions').select('*');
     if (error) {
        console.error('Error fetching permissions:', error.message);
        throw new Error('Could not fetch permissions from Supabase.');
    }
    return data;
}

// This function updates or inserts a permission in the 'user_chat_permissions' table
export async function updateUserPermission(userId: string, chatId: string, hasAccess: boolean) {
    const supabase = createClient();
    const { error } = await supabase
        .from('user_chat_permissions')
        .upsert(
            { user_id: userId, chat_id: chatId, has_access: hasAccess },
            { onConflict: 'user_id, chat_id' }
        );
    
    if (error) {
        console.error('Error updating permission:', error.message);
        throw new Error('Could not update permission in Supabase.');
    }

    // Revalidate paths to ensure data is fresh on the client-side
    revalidatePath('/admin/users');
    revalidatePath('/');
}
