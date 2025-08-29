
'use client';

import Link from 'next/link';
import { type User } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquareHeart } from 'lucide-react';
import { ChatHeader } from './chat-header';

type ChatRoom = {
    id: string;
    name: string;
    description: string;
};

interface ChatRoomListProps {
    user: User;
    availableChats: ChatRoom[];
}

export function ChatRoomList({ user, availableChats }: ChatRoomListProps) {
    return (
        <div className="flex h-screen w-full flex-col bg-muted/40">
            <ChatHeader user={user} email={user.email} />
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                         <MessageSquareHeart className="h-10 w-10 text-primary" />
                         <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Salas de Chat Disponibles</h1>
                            <p className="text-muted-foreground">Selecciona una sala para comenzar a conversar.</p>
                         </div>
                    </div>

                    {availableChats.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {availableChats.map((chat) => (
                                <Card key={chat.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{chat.name}</CardTitle>
                                        <CardDescription>{chat.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <Link href={`/chat/${chat.id}`} passHref>
                                            <Button className="w-full">
                                                Entrar al Chat
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center p-8">
                             <CardHeader>
                                <CardTitle>No tienes acceso a ninguna sala</CardTitle>
                                <CardDescription>
                                    Por favor, contacta a un administrador para que te asigne a una sala de chat.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
