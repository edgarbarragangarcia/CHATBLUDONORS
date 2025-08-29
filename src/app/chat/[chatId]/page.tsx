import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatPage from '@/components/chat/chat-page'
import { type User } from '@supabase/supabase-js'

export default async function ChatRoutePage({ params }: { params: { chatId: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // NOTE: In a real app, you should add a step here to verify
  // that the user actually has permission to access params.chatId
  // before rendering the page.

  // The user object needs to be destructured and reconstructed
  // to avoid passing a non-serializable object to the client component.
  const { id, app_metadata, user_metadata, aud, created_at, email } = user
  const serializableUser = { id, app_metadata, user_metadata, aud, created_at } as User

  return <ChatPage user={serializableUser} email={email} chatId={params.chatId} />
}
