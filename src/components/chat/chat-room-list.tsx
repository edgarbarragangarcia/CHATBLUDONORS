
'use client';

import { Button } from '@/components/ui/button';
import { MessageSquareText, Sparkles, Users, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatRoom = {
    id: string;
    name: string;
    description: string;
};

interface ChatRoomListProps {
    availableChats: ChatRoom[];
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}

const getChatIcon = (chatName: string) => {
    if (chatName.toLowerCase().includes('bluedonors')) {
        return <Users className="h-5 w-5" />;
    }
    if (chatName.toLowerCase().includes('projectia')) {
        return <Bot className="h-5 w-5" />;
    }
    return <MessageSquareText className="h-5 w-5" />;
};

const getChatGradient = (chatName: string, isSelected: boolean) => {
    if (chatName.toLowerCase().includes('bluedonors')) {
        return isSelected 
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25" 
            : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20";
    }
    if (chatName.toLowerCase().includes('projectia')) {
        return isSelected 
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" 
            : "hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20";
    }
    return isSelected 
        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25" 
        : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20";
};

export function ChatRoomList({ availableChats, selectedChatId, onSelectChat }: ChatRoomListProps) {
    return (
        <div className="h-full bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col relative overflow-hidden">
            {/* Decorative background elements with floating animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-bounce" 
                 style={{ animationDelay: '0s', animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl pointer-events-none animate-bounce" 
                 style={{ animationDelay: '2s', animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-md pointer-events-none animate-pulse" 
                 style={{ animationDelay: '1s', animationDuration: '2s' }} />
            
            {/* Header */}
            <div className="relative z-10 p-4 border-b border-border/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Salas de Chat
                    </h2>
                </div>
                <p className="text-xs text-muted-foreground/70 ml-11">
                    Selecciona una sala para comenzar
                </p>
            </div>
            
            {/* Chat rooms */}
            <nav className="flex-1 p-3 space-y-2 relative z-10">
                {availableChats.map((chat, index) => {
                    const isSelected = selectedChatId === chat.id;
                    return (
                        <Button
                            key={chat.id}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-4 h-auto p-4 rounded-xl transition-all duration-300 relative overflow-hidden group border border-transparent",
                                "text-foreground/80 hover:text-foreground hover:border-border/50",
                                getChatGradient(chat.name, isSelected),
                                isSelected && "border-border/30 transform scale-[1.02]"
                            )}
                            onClick={() => onSelectChat(chat.id)}
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transform" />
                            
                            {/* Rotating border animation */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spin" 
                                     style={{ animationDuration: '3s' }} />
                            </div>
                            
                            {/* Icon container */}
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 flex-shrink-0",
                                isSelected 
                                    ? "bg-white/20 backdrop-blur-sm" 
                                    : "bg-muted/50 group-hover:bg-muted/70 group-hover:scale-110"
                            )}>
                                <div className={cn(
                                    "transition-all duration-300",
                                    isSelected ? "animate-pulse" : "group-hover:animate-bounce"
                                )}>
                                    {getChatIcon(chat.name)}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className={cn(
                                    "font-semibold text-sm truncate w-full text-left transition-all duration-300",
                                    isSelected ? "text-white" : "group-hover:font-bold"
                                )}>
                                    {chat.name}
                                </span>
                                <span className={cn(
                                    "text-xs opacity-70 truncate w-full text-left transition-all duration-300",
                                    isSelected ? "text-white/80" : "text-muted-foreground group-hover:opacity-90"
                                )}>
                                    {chat.description || "Sala de conversación"}
                                </span>
                            </div>
                            
                            {/* Active indicator */}
                            {isSelected && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            )}
                        </Button>
                    );
                })}
            </nav>
            
            {/* Footer */}
            <div className="relative z-10 p-4 border-t border-border/30">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground/50">
                        {availableChats.length} sala{availableChats.length !== 1 ? 's' : ''} disponible{availableChats.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    )
}
