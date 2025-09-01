
'use client';

import { useState } from 'react';
import { type User } from '@supabase/supabase-js';
import { ChatHeader } from './chat-header';
import { ChatRoomList } from './chat-room-list';
import ChatPage from './chat-page';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

type ChatRoom = {
    id: string;
    name: string;
    description: string;
};

interface ChatLayoutProps {
    user: User;
    availableChats: ChatRoom[];
}

export function ChatLayout({ user, availableChats }: ChatLayoutProps) {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    if (availableChats.length === 0) {
        return (
             <div className="flex h-screen w-full flex-col bg-muted/40">
                <ChatHeader user={user} email={user.email} />
                <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
                    <Card className="text-center p-8 max-w-lg">
                        <CardHeader>
                            <CardTitle>No tienes acceso a ninguna sala</CardTitle>
                            <CardDescription>
                                Por favor, contacta a un administrador para que te asigne a una sala de chat.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        );
    }
    
    // Automatically select the first chat if none is selected
    if (!selectedChatId && availableChats.length > 0) {
        setSelectedChatId(availableChats[0].id);
    }

    return (
        <div className="flex h-screen w-full flex-col bg-muted/40">
            <ChatHeader user={user} email={user.email} />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                    <ChatRoomList 
                        availableChats={availableChats}
                        selectedChatId={selectedChatId}
                        onSelectChat={handleSelectChat}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    {selectedChatId ? (
                        <ChatPage user={user} email={user.email} chatId={selectedChatId} />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">Select a chat to start messaging</p>
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
