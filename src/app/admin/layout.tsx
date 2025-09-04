
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const isAdmin = user.app_metadata?.role === 'admin' || 
                  ADMIN_USERS.includes(user.email ?? '');

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar isAdmin={isAdmin} />
      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
