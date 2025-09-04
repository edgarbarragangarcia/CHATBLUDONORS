"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { updateChat } from "@/app/admin/chats/actions";
import { useToast } from "@/hooks/use-toast";
import { useWebhook } from "@/contexts/webhook-context";

interface Chat {
  id: string;
  name: string;
  description: string;
  webhook_url?: string;
}

interface EditChatDialogProps {
  chat: Chat;
  onChatUpdated?: () => void;
}

export function EditChatDialog({ chat, onChatUpdated }: EditChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setWebhookUrl } = useWebhook();
  const [formData, setFormData] = useState({
    name: chat.name,
    description: chat.description,
    webhookUrl: chat.webhook_url || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('chatId', chat.id);
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('webhookUrl', formData.webhookUrl);

      const updatedChat = await updateChat(form);
      
      // Actualizar el caché de webhooks si cambió la URL
      if (updatedChat && formData.webhookUrl !== chat.webhook_url) {
        setWebhookUrl(chat.id, formData.webhookUrl || null);
      }
      
      toast({
        title: "Éxito",
        description: "Chat actualizado exitosamente",
      });
      setOpen(false);
      onChatUpdated?.();
    } catch (error) {
      console.error('Error updating chat:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Chat</DialogTitle>
          <DialogDescription>
            Modifica los detalles del chat. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="col-span-3"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="webhookUrl" className="text-right">
                Webhook URL
              </Label>
              <Input
                id="webhookUrl"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                className="col-span-3"
                placeholder="https://ejemplo.com/webhook"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}