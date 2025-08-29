
'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { updateUserPermission } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

type Chat = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    is_public: boolean;
}

type UserPermission = {
    user_id: string;
    chat_id: string;
    has_access: boolean;
}

type UserWithPermissions = {
  id: string;
  name: string | undefined;
  email: string | undefined;
  avatar: any;
  role: string;
  permissions: { [chatId: string]: boolean };
}

interface UserManagementTableProps {
    initialUsers: User[];
    initialChats: Chat[];
    initialPermissions: UserPermission[];
}

export function UserManagementTable({ initialUsers, initialChats, initialPermissions }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // The data is now passed as props, so we just need to map it.
    const permissionsMap = new Map<string, boolean>();
    initialPermissions.forEach(p => {
        permissionsMap.set(`${p.user_id}-${p.chat_id}`, p.has_access);
    });

    const mappedUsers = initialUsers.map((u) => {
        const userPermissions: { [chatId: string]: boolean } = {};
        initialChats.forEach(chat => {
            userPermissions[chat.id] = permissionsMap.get(`${u.id}-${chat.id}`) ?? false;
        });
        
        return {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split('@')[0],
            email: u.email,
            avatar: u.user_metadata?.avatar_url,
            role: ADMIN_USERS.includes(u.email ?? '') ? 'admin' : 'user',
            permissions: userPermissions,
        };
    });
    setUsers(mappedUsers);
    setChats(initialChats);
  }, [initialUsers, initialChats, initialPermissions]);

  const handlePermissionChange = (userId: string, chatId: string, newPermission: boolean) => {
      // Optimistic UI update
      setUsers(prevUsers => 
          prevUsers.map(user => {
              if (user.id === userId) {
                  return {
                      ...user,
                      permissions: { ...user.permissions, [chatId]: newPermission }
                  };
              }
              return user;
          })
      );

      // Call server action
      startTransition(async () => {
          try {
              await updateUserPermission(userId, chatId, newPermission);
              toast({
                  title: 'Permiso actualizado',
                  description: `El acceso para el chat ha sido ${newPermission ? 'concedido' : 'revocado'}.`,
              });
          } catch (error) {
              toast({
                  title: 'Error al actualizar',
                  description: 'No se pudo guardar el cambio. Por favor, inténtalo de nuevo.',
                  variant: 'destructive',
              });
              // Revert UI change on error
              setUsers(prevUsers => 
                  prevUsers.map(user => {
                      if (user.id === userId) {
                          return { ...user, permissions: { ...user.permissions, [chatId]: !newPermission } };
                      }
                      return user;
                  })
              );
          }
      });
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
                    {chats.map(chat => (
                        <TableHead key={chat.id} className="text-center">{chat.name}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((u) => (
                    <TableRow key={u.id} className={isPending ? 'opacity-50' : ''}>
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
                        {chats.map(chat => (
                             <TableCell key={chat.id} className="text-center">
                                <Switch
                                    checked={u.permissions[chat.id] ?? false}
                                    onCheckedChange={(isChecked) => handlePermissionChange(u.id, chat.id, isChecked)}
                                    aria-label={`Toggle access to ${chat.name} for ${u.name}`}
                                    disabled={isPending}
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
