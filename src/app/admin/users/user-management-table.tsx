
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
import { updateUserPermission, updateUserRole } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
  role: 'admin' | 'user';
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
  const [isRolePending, startRoleTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const permissionsMap = new Map<string, boolean>();
    initialPermissions.forEach(p => {
        permissionsMap.set(`${p.user_id}-${p.chat_id}`, p.has_access);
    });

    const mappedUsers = initialUsers.map((u) => {
        const userPermissions: { [chatId: string]: boolean } = {};
        initialChats.forEach(chat => {
            userPermissions[chat.id] = permissionsMap.get(`${u.id}-${chat.id}`) ?? false;
        });

        const role = u.app_metadata?.role === 'admin' || ADMIN_USERS.includes(u.email ?? '') ? 'admin' : 'user';
        
        return {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split('@')[0],
            email: u.email,
            avatar: u.user_metadata?.avatar_url,
            role: role as 'admin' | 'user',
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

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
      const oldRole = users.find(u => u.id === userId)?.role;
      // Optimistic UI update
      setUsers(prevUsers => 
          prevUsers.map(user => {
              if (user.id === userId) {
                  return { ...user, role: newRole as 'admin' | 'user' };
              }
              return user;
          })
      );

      // Call server action
      startRoleTransition(async () => {
          try {
              await updateUserRole(userId, newRole);
              toast({
                  title: 'Rol actualizado',
                  description: `El usuario ahora es ${newRole}.`,
              });
          } catch (error) {
              toast({
                  title: 'Error al actualizar rol',
                  description: 'No se pudo guardar el cambio. Por favor, inténtalo de nuevo.',
                  variant: 'destructive',
              });
              // Revert UI change on error
              setUsers(prevUsers => 
                  prevUsers.map(user => {
                      if (user.id === userId) {
                          return { ...user, role: oldRole || 'user' };
                      }
                      return user;
                  })
              );
          }
      });
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
        <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">User Access Management</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Enable or disable access to chats for each user.</p>
        </div>
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] sm:w-[250px] min-w-[180px]">User</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead className="min-w-[100px]">Role</TableHead>
                            {chats.map(chat => (
                                <TableHead key={chat.id} className="text-center min-w-[80px] sm:min-w-[100px]">
                                    <span className="hidden sm:inline">{chat.name}</span>
                                    <span className="sm:hidden">{chat.name.substring(0, 8)}...</span>
                                </TableHead>
                            ))}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} className={(isPending || isRolePending) ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                            <AvatarImage src={u.avatar} />
                                            <AvatarFallback className="text-xs sm:text-sm">{u.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <span className="font-medium text-sm sm:text-base truncate block">{u.name}</span>
                                            <span className="text-xs text-muted-foreground sm:hidden truncate block">{u.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                                <TableCell>
                                   <Select
                                        value={u.role}
                                        onValueChange={(value: 'admin' | 'user') => handleRoleChange(u.id, value)}
                                        disabled={isRolePending}
                                   >
                                        <SelectTrigger className="w-[90px] sm:w-[110px] h-8 sm:h-10">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                   </Select>
                                </TableCell>
                                {chats.map(chat => (
                                     <TableCell key={chat.id} className="text-center">
                                        <Switch
                                            checked={u.permissions[chat.id] ?? false}
                                            onCheckedChange={(isChecked) => handlePermissionChange(u.id, chat.id, isChecked)}
                                            aria-label={`Toggle access to ${chat.name} for ${u.name}`}
                                            disabled={isPending}
                                            className="scale-75 sm:scale-100"
                                        />
                                     </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
