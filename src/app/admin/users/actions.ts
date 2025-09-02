
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This function fetches all users from Supabase Auth using the admin client
export async function getUsers() {
  const supabase = createAdminClient();
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    throw new Error('Could not fetch users from Supabase.');
  }
  return users;
}

// This function fetches all available chats from the 'chats' table using the admin client
export async function getChats() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('chats').select('*');
    if (error) {
        console.error('Error fetching chats:', error.message);
        throw new Error('Could not fetch chats from Supabase.');
    }
    return data;
}

// This function fetches all permissions from the 'user_chat_permissions' table using the admin client
export async function getAllUserChatPermissions() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('user_chat_permissions').select('*');
     if (error) {
        console.error('Error fetching permissions:', error.message);
        throw new Error('Could not fetch permissions from Supabase.');
    }
    return data;
}

// This function updates or inserts a permission in the 'user_chat_permissions' table using the admin client
export async function updateUserPermission(userId: string, chatId: string, hasAccess: boolean) {
    const supabase = createAdminClient();
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


// This function updates a user's role in Supabase Auth metadata
export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
    const supabase = createAdminClient();
    
    const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: newRole } }
    );

    if (error) {
        console.error('Error updating user role:', error.message);
        throw new Error('Could not update user role in Supabase.');
    }

    revalidatePath('/admin/users');
}
