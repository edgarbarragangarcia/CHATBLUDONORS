
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

  // Generate a unique ID based on the name
  const chatId = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50); // Limit length

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        id: chatId,
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

export async function deleteChat(chatId: string) {
  if (!chatId) {
    throw new Error('ID del chat es requerido');
  }

  const supabase = await createAdminClient();
  
  // First delete all messages in the chat
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError.message);
    throw new Error('No se pudieron eliminar los mensajes del chat.');
  }

  // Then delete the chat
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) {
    console.error('Error deleting chat:', error.message);
    throw new Error('No se pudo eliminar el chat.');
  }

  revalidatePath('/admin/chats');
}
