
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getChats() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('chats').select('*').order('name');
  if (error) {
    console.error('Error fetching chats:', error.message);
    throw new Error('Could not fetch chats.');
  }
  return data;
}

export async function createChat(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const webhookUrl = formData.get('webhookUrl') as string;

  if (!name || !description) {
    throw new Error('Name and description are required');
  }

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        name: name.trim(),
        description: description.trim(),
        webhook_url: webhookUrl?.trim() || null
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error.message);
    throw new Error('Could not create chat.');
  }

  revalidatePath('/admin/chats');
  return data;
}
