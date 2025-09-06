
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This function fetches all users from Supabase Auth using the admin client
export async function getUsers() {
  const supabase = await createAdminClient();
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    throw new Error('Could not fetch users from Supabase.');
  }
  return users;
}

// This function fetches all available chats from the 'chats' table using the admin client
export async function getChats() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('chats').select('*');
    if (error) {
        console.error('Error fetching chats:', error.message);
        throw new Error('Could not fetch chats from Supabase.');
    }
    return data;
}

// This function fetches all permissions from the 'user_chat_permissions' table using the admin client
export async function getAllUserChatPermissions() {
    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('user_chat_permissions').select('*');
        if (error) {
            console.error('Error fetching permissions:', error.message);
            // Return empty array instead of throwing to prevent page crash
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Error creating admin client or fetching permissions:', error);
        // Return empty array to allow page to load without permissions
        return [];
    }
}

// This function fetches all available forms from the 'forms' table using the admin client
export async function getForms() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('forms').select('id, title, status, is_active').eq('is_active', true);
    if (error) {
        console.error('Error fetching forms:', error.message);
        throw new Error('Could not fetch forms from Supabase.');
    }
    return data;
}

// This function fetches all permissions from the 'user_form_permissions' table using the admin client
export async function getAllUserFormPermissions() {
    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('user_form_permissions').select('*');
        if (error) {
            console.error('Error fetching form permissions:', error.message);
            // Return empty array instead of throwing to prevent page crash
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Error creating admin client or fetching form permissions:', error);
        // Return empty array to allow page to load without form permissions
        return [];
    }
}

// This function updates or inserts a permission in the 'user_chat_permissions' table using the admin client
export async function updateUserPermission(userId: string, chatId: string, hasAccess: boolean) {
    const supabase = await createAdminClient();
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

// This function updates or inserts a permission in the 'user_form_permissions' table using the admin client
export async function updateUserFormPermission(userId: string, formId: string, hasAccess: boolean) {
    const supabase = await createAdminClient();
    const { error } = await supabase
        .from('user_form_permissions')
        .upsert(
            { user_id: userId, form_id: formId, has_access: hasAccess },
            { onConflict: 'user_id, form_id' }
        );
    
    if (error) {
        console.error('Error updating form permission:', error.message);
        throw new Error('Could not update form permission.');
    }
    
    revalidatePath('/admin/users');
}

// This function updates a user's role in Supabase Auth metadata
export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
    const supabase = await createAdminClient();
    
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
