
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
        <div className="h-full p-4 bg-gradient-to-r from-blue-400 to-blue-600 border-r flex flex-col text-white">
            <h2 className="text-xl font-bold mb-4">Salas de Chat</h2>
            <nav className="flex flex-col gap-2">
                {availableChats.map((chat) => (
                    <Button
                        key={chat.id}
                        variant={selectedChatId === chat.id ? 'secondary' : 'ghost'}
                        className={cn(
                            "w-full justify-start gap-3",
                            selectedChatId === chat.id 
                                ? "bg-white/20 text-white" 
                                : "hover:bg-white/10 hover:text-white"
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
