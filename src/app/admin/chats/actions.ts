
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getChats() {
  const supabase = createClient();
  const { data, error } = await supabase.from('chats').select('*').order('name');
  if (error) {
    console.error('Error fetching chats:', error.message);
    throw new Error('Could not fetch chats.');
  }
  return data;
}
