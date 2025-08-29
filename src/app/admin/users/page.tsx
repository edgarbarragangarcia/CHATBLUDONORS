
'use client';

import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

type MappedUser = {
  id: string;
  name: string | undefined;
  email: string | undefined;
  avatar: any;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !ADMIN_USERS.includes(user.email ?? '')) {
            // This is a client component, so we redirect with router
            // For simplicity, we can just render null or a message
            // as the layout already protects the route.
            return;
        }
        setAuthUser(user);

        // Fetching users requires an admin client, which can't be used
        // directly in the browser. This needs to be an API route
        // or a server action for security reasons.
        // For now, let's use placeholder data to build the UI.
        try {
            // In a real scenario, this would be an API call to a secure endpoint
            // const { data, error } = await supabase.auth.admin.listUsers();
            // For demonstration, using static data.
            const { data, error: fetchError } = await supabase.from('users_public').select('*');

            if (fetchError) {
                throw fetchError;
            }

            // A mock of what listUsers() would return
            const mockUsers = [
                { id: '1', email: 'administrador@ingenes.com', user_metadata: { full_name: 'administrador' } },
                { id: '2', email: 'eabarragang@ingenes.com', user_metadata: { full_name: 'Edgar Alexander Barragan Garcia', avatar_url: '' } },
                { id: '3', email: 'user3@example.com', user_metadata: { full_name: 'Test User' } },
            ];


            const mappedUsers = mockUsers.map((u) => ({
                id: u.id,
                name: u.user_metadata?.full_name || u.email?.split('@')[0],
                email: u.email,
                avatar: u.user_metadata?.avatar_url,
                role: ADMIN_USERS.includes(u.email ?? '') ? 'admin' : 'user',
            }));
            setUsers(mappedUsers);
        } catch (e: any) {
            setError('Could not fetch users. RLS might be blocking the request.');
            console.error('Error fetching users:', e);
        } finally {
            setLoading(false);
        }
    };

    fetchUserData();
  }, []);


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };
  
  if (loading) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Loading user data...</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please wait...</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not fetch users.</CardCardDescription>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage your application users and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead padding="checkbox">
                        <Checkbox
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((u) => (
                    <TableRow key={u.id} data-state={selectedUsers.includes(u.id) ? 'selected' : undefined}>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={selectedUsers.includes(u.id)}
                            onCheckedChange={(checked) => handleSelectUser(u.id, !!checked)}
                            aria-label={`Select user ${u.name}`}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
