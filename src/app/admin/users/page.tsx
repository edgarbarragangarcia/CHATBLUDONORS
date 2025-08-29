
'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
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
import { getUsers } from './actions';
import { Switch } from '@/components/ui/switch';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

// Define a type for user permissions
type UserPermissions = {
  [key: string]: boolean; // e.g., { 'chat-general': true, 'chat-support': false }
};


type MappedUser = {
  id: string;
  name: string | undefined;
  email: string | undefined;
  avatar: any;
  role: string;
  permissions: UserPermissions; // Add permissions to each user
}

const CHATS = [
    { id: 'general', name: 'Chat General' },
    { id: 'support', name: 'Chat Soporte' },
    { id: 'project-x', name: 'Chat Proyecto X' },
];


export default function UsersPage() {
  const [users, setUsers] = useState<MappedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersData = await getUsers();
        
        const mappedUsers = usersData.map((u: any) => ({
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split('@')[0],
            email: u.email,
            avatar: u.user_metadata?.avatar_url,
            role: ADMIN_USERS.includes(u.email ?? '') ? 'admin' : 'user',
            // Placeholder permissions - in a real app, you'd fetch this from your DB
            permissions: {
                'general': true,
                'support': Math.random() > 0.5,
                'project-x': Math.random() > 0.5,
            }
        }));
        setUsers(mappedUsers);
      } catch (e: any) {
          setError('Could not fetch users. Please ensure the service_role key is correct.');
          console.error('Error fetching users:', e);
      } finally {
          setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePermissionChange = (userId: string, chatId: string, newPermission: boolean) => {
      setUsers(prevUsers => 
          prevUsers.map(user => {
              if (user.id === userId) {
                  return {
                      ...user,
                      permissions: {
                          ...user.permissions,
                          [chatId]: newPermission,
                      }
                  };
              }
              return user;
          })
      )
      // In a real app, you would also call an action here to update the database.
      console.log(`User ${userId} permission for ${chatId} changed to ${newPermission}`);
  }
  
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
                    <CardDescription>Could not fetch users.</CardDescription>
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
          <CardTitle>User Access Management</CardTitle>
          <CardDescription>Enable or disable access to chats for each user.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[250px]">User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {CHATS.map(chat => (
                        <TableHead key={chat.id} className="text-center">{chat.name}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((u) => (
                    <TableRow key={u.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback>{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{u.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                        </TableCell>
                        {CHATS.map(chat => (
                             <TableCell key={chat.id} className="text-center">
                                <Switch
                                    checked={u.permissions[chat.id] ?? false}
                                    onCheckedChange={(isChecked) => handlePermissionChange(u.id, chat.id, isChecked)}
                                    aria-label={`Toggle access to ${chat.name} for ${u.name}`}
                                />
                             </TableCell>
                        ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
