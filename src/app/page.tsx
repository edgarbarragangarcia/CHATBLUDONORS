import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatPage from '@/components/chat/chat-page'
import { type User } from '@supabase/supabase-js'

export default async function Home() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // The user object needs to be destructured and reconstructed
  // to avoid passing a non-serializable object to the client component.
  const { id, app_metadata, user_metadata, aud, created_at } = user
  const serializableUser = { id, app_metadata, user_metadata, aud, created_at } as User

  return <ChatPage user={serializableUser} />
}
