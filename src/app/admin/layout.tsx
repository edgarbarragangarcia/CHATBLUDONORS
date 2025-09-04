
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminNavbar from './admin-navbar';
import { redirect } from 'next/navigation';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const isAdmin = !!user && (user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''));

    if (!isAdmin) {
        return redirect('/');
    }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AdminNavbar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
