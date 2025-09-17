
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
import { MessageCircle, Menu, X, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FormViewer } from '@/components/forms/form-viewer';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type ChatRoom = {
    id: string;
    name: string;
    description: string;
};

type Form = {
    id: string;
    title: string;
    description?: string;
    status: string;
    is_active: boolean;
    created_at: string;
    form_fields?: any[];
};

interface ChatLayoutProps {
    user: User;
    availableChats: ChatRoom[];
    availableForms: Form[];
}

export function ChatLayout({ user, availableChats, availableForms }: ChatLayoutProps) {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chats' | 'forms'>('chats');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
        setSelectedFormId(null);
        setActiveTab('chats');
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleSelectForm = (formId: string) => {
        setSelectedFormId(formId);
        setSelectedChatId(null);
        setActiveTab('forms');
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };



    if (availableChats.length === 0 && availableForms.length === 0) {
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
                            <CardTitle className="heading-3">No hay contenido disponible</CardTitle>
                            <CardDescription className="body-large">
                                No tienes acceso a salas de chat ni formularios.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    // Automatically select the first available content if none is selected
    if (!selectedChatId && !selectedFormId) {
        if (availableChats.length > 0) {
            setSelectedChatId(availableChats[0].id);
            setActiveTab('chats');
        } else if (availableForms.length > 0) {
            setSelectedFormId(availableForms[0].id);
            setActiveTab('forms');
        }
    }

    if (isMobile) {
        return (
            <div className="mobile-nav-height w-full relative">
                {/* Mobile Header */}
                <div className="flex items-center justify-between padding-responsive border-b border-border/50 glass">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden touch-target"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="ml-2 text-responsive-sm">Salas</span>
                    </Button>
                    <h1 className="heading-4 text-responsive-lg">INGENIABOTS</h1>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden mobile-safe-area">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                        <div className="fixed left-0 top-0 mobile-full-height w-80 max-w-[85vw] glass border-r border-border/50">
                            <div className="flex items-center justify-between padding-responsive border-b border-border/50">
                                <h2 className="heading-4 text-responsive-base">Contenido</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="touch-target"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chats' | 'forms')} className="mobile-content-height flex flex-col">
                                <div className="padding-responsive pb-2">
                                    <TabsList className="w-full h-12 touch-target">
                                        {availableChats.length > 0 && (
                                            <TabsTrigger value="chats" className="flex items-center justify-center space-x-2 text-responsive-sm font-medium touch-target">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>Chats</span>
                                            </TabsTrigger>
                                        )}
                                        {availableForms.length > 0 && (
                                            <TabsTrigger value="forms" className="flex items-center justify-center space-x-2 text-responsive-sm font-medium touch-target">
                                                <FileText className="h-4 w-4" />
                                                <span>Formularios</span>
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </div>
                                {availableChats.length > 0 && (
                                    <TabsContent value="chats" className="flex-1 px-4 pb-4 mt-0 overflow-hidden mobile-scroll-container">
                                        <ChatRoomList 
                                            availableChats={availableChats}
                                            selectedChatId={selectedChatId}
                                            onSelectChat={handleSelectChat}
                                        />
                                    </TabsContent>
                                )}
                                {availableForms.length > 0 && (
                                    <TabsContent value="forms" className="flex-1 px-4 pb-4 mt-0 overflow-hidden mobile-scroll-container">
                                        <div className="space-y-2">
                                            {availableForms.map((form) => (
                                                <Card 
                                    key={form.id} 
                                    className={`cursor-pointer transition-all duration-300 py-2 px-3 relative overflow-hidden group ${
                                        selectedFormId === form.id 
                                            ? 'bg-gradient-to-r from-corporate-navy/20 to-corporate-green/20 shadow-lg'
                : 'hover:bg-gradient-to-r hover:from-corporate-gray-light/10 hover:to-corporate-navy/10 hover:shadow-md'
                                    }`}
                                    onClick={() => handleSelectForm(form.id)}
                                >
                                    {/* Efecto de brillo en hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transform"></div>
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-sm font-medium text-center truncate">{form.title}</CardTitle>
                                    </div>
                                </Card>
                                            ))}
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    </div>
                )}

                {/* Mobile Chat Content */}
                <div className="mobile-content-height bg-background/50 relative">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'url(/logoIngenes.png)',
                        backgroundSize: '250px 250px',
                        backgroundPosition: 'right center',
                        backgroundRepeat: 'no-repeat'
                    }} />
                    <div className="absolute inset-0 bg-background/60" />
                    <div className="relative z-10 h-full mobile-scroll-container">
                        {selectedChatId ? (
                            <ChatPage user={user} email={user.email} chatId={selectedChatId} />
                        ) : selectedFormId ? (
                             <FormViewer 
                                  form={{
                                      ...availableForms.find(f => f.id === selectedFormId)!,
                                      description: availableForms.find(f => f.id === selectedFormId)!.description || '',
                                      form_fields: availableForms.find(f => f.id === selectedFormId)!.form_fields || []
                                  }} 
                                  user={user} 
                              />
                        ) : (
                        <div className="flex h-full items-center justify-center padding-responsive">
                            <div className="text-center space-responsive">
                                <div className="flex justify-center">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
                                        <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                                <p className="text-responsive-base text-muted-foreground">Selecciona un chat para comenzar</p>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="mt-4 touch-target"
                                >
                                    <Menu className="h-4 w-4 mr-2" />
                                    Ver Contenido
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
        <div className="mobile-nav-height w-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35} className="border-r border-border/50">
                    <div className="h-full glass">
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chats' | 'forms')} className="h-full flex flex-col">
                            <div className="padding-responsive pb-2">
                                <TabsList className="w-full h-12">
                                    {availableChats.length > 0 && (
                                        <TabsTrigger value="chats" className="flex items-center justify-center space-x-2 text-responsive-sm font-medium">
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Chats</span>
                                        </TabsTrigger>
                                    )}
                                    {availableForms.length > 0 && (
                                        <TabsTrigger value="forms" className="flex items-center justify-center space-x-2 text-responsive-sm font-medium">
                                            <FileText className="h-4 w-4" />
                                            <span>Formularios</span>
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </div>
                            {availableChats.length > 0 && (
                                <TabsContent value="chats" className="flex-1 px-4 pb-4 mt-0 overflow-hidden scrollbar-thin">
                                    <ChatRoomList 
                                        availableChats={availableChats}
                                        selectedChatId={selectedChatId}
                                        onSelectChat={handleSelectChat}
                                    />
                                </TabsContent>
                            )}
                            {availableForms.length > 0 && (
                                <TabsContent value="forms" className="flex-1 px-4 pb-4 mt-0 overflow-hidden scrollbar-thin">
                                    <div className="space-y-2">
                                        {availableForms.map((form) => (
                                            <Card 
                                                key={form.id} 
                                                className={`cursor-pointer transition-all duration-300 py-2 px-3 relative overflow-hidden group ${
                                                    selectedFormId === form.id 
                                                        ? 'bg-gradient-to-r from-corporate-navy/20 to-corporate-green/20 shadow-lg'
                : 'hover:bg-gradient-to-r hover:from-corporate-gray-light/10 hover:to-corporate-navy/10 hover:shadow-md'
                                                }`}
                                                onClick={() => handleSelectForm(form.id)}
                                            >
                                                {/* Efecto de brillo en hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transform"></div>
                                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-medium text-center truncate">{form.title}</CardTitle>
                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle className="w-1 bg-border/50 hover:bg-border transition-modern" />
                <ResizablePanel defaultSize={75}>
                    <div className="h-full bg-background/50 relative">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'url(/logoIngenes.png)',
                            backgroundSize: '250px 250px',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat'
                        }} />
                        <div className="absolute inset-0 bg-background/60" />
                        <div className="relative z-10 h-full">
                            {selectedChatId ? (
                                <ChatPage user={user} email={user.email} chatId={selectedChatId} />
                            ) : selectedFormId ? (
                                 <FormViewer 
                                      form={{
                                          ...availableForms.find(f => f.id === selectedFormId)!,
                                          description: availableForms.find(f => f.id === selectedFormId)!.description || '',
                                          form_fields: availableForms.find(f => f.id === selectedFormId)!.form_fields || []
                                      }} 
                                      user={user} 
                                  />
                            ) : (
                                <div className="flex h-full items-center justify-center padding-responsive">
                                    <div className="text-center space-responsive">
                                        <div className="flex justify-center">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50">
                                                <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <p className="text-responsive-base text-muted-foreground">Selecciona un chat para comenzar</p>
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
