
'use client';

import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
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

export function ChatRoomList({ availableChats, selectedChatId, onSelectChat }: ChatRoomListProps) {
    return (
        <div className="h-full p-2 bg-background/80 backdrop-blur-sm border-r flex flex-col">
            <h2 className="text-lg font-semibold mb-2 px-2 text-foreground">Salas de Chat</h2>
            <nav className="flex flex-col gap-1">
                {availableChats.map((chat) => (
                    <Button
                        key={chat.id}
                        variant={'ghost'}
                        className={cn(
                            "w-full justify-start gap-3 text-foreground/80 hover:text-foreground",
                            selectedChatId === chat.id 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                                : "hover:bg-accent"
                        )}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        <MessageSquareText className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                           <span className="font-semibold">{chat.name}</span>
                        </div>
                    </Button>
                ))}
            </nav>
        </div>
    )
}
