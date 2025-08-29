
'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUsers() {
  // We are creating a client with the service role key,
  // which has admin privileges.
  const supabase = createClient();

  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error.message);
    throw new Error('Could not fetch users from Supabase.');
  }

  return users;
}
