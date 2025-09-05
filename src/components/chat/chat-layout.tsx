
'use client';

import { useState } from 'react';
import { type User } from '@supabase/supabase-js';
import { ChatRoomList } from './chat-room-list';
import ChatPage from './chat-page';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    if (availableChats.length === 0) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
                <Card className="glass max-w-lg text-center shadow-modern-lg">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="heading-3">No tienes acceso a ninguna sala</CardTitle>
                            <CardDescription className="body-large">
                                Por favor, contacta a un administrador para que te asigne a una sala de chat.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    // Automatically select the first chat if none is selected
    if (!selectedChatId && availableChats.length > 0) {
        setSelectedChatId(availableChats[0].id);
    }

    if (isMobile) {
        return (
            <div className="h-[calc(100vh-4rem)] w-full relative">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 glass">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="ml-2">Salas</span>
                    </Button>
                    <h1 className="heading-4">INGENIABOTS</h1>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                        <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] glass border-r border-border/50">
                            <div className="flex items-center justify-between p-4 border-b border-border/50">
                                <h2 className="heading-4">Salas de Chat</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <ChatRoomList 
                                availableChats={availableChats}
                                selectedChatId={selectedChatId}
                                onSelectChat={handleSelectChat}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Chat Content */}
                <div className="h-[calc(100%-5rem)] bg-background/50 relative" style={{
                    backgroundImage: 'url(/lego-background.svg)',
                    backgroundSize: '200px 200px',
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'repeat'
                }}>
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    <div className="relative z-10 h-full">
                        {selectedChatId ? (
                            <ChatPage user={user} email={user.email} chatId={selectedChatId} />
                        ) : (
                        <div className="flex h-full items-center justify-center p-6">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
                                        <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <p className="body-large text-muted-foreground">Selecciona una sala para comenzar</p>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="mt-4"
                                >
                                    <Menu className="h-4 w-4 mr-2" />
                                    Ver Salas
                                </Button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] w-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35} className="border-r border-border/50">
                    <div className="h-full glass">
                        <ChatRoomList 
                            availableChats={availableChats}
                            selectedChatId={selectedChatId}
                            onSelectChat={handleSelectChat}
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle className="w-1 bg-border/50 hover:bg-border transition-modern" />
                <ResizablePanel defaultSize={75}>
                    <div className="h-full bg-background/50 relative" style={{
                        backgroundImage: 'url(/lego-background.svg)',
                        backgroundSize: '200px 200px',
                        backgroundPosition: 'top left',
                        backgroundRepeat: 'repeat'
                    }}>
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                        <div className="relative z-10 h-full">
                            {selectedChatId ? (
                                <ChatPage user={user} email={user.email} chatId={selectedChatId} />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
                                                <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <p className="body-large text-muted-foreground">Selecciona un chat para comenzar</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
