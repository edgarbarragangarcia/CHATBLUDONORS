
'use server';

import { createAdminClient } from '@/lib/supabase/server';

export async function getChats() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('chats').select('*').order('name');
  if (error) {
    console.error('Error fetching chats:', error.message);
    throw new Error('Could not fetch chats.');
  }
  return data;
}
