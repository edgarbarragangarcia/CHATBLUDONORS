'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2 } from 'lucide-react';
import { createChat } from './actions';
// Using simple alerts for now - can be replaced with proper toast system later

export function CreateChatDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await createChat(formData);
      alert('Chat creado exitosamente');
      setOpen(false);
      // Reset form by closing and reopening dialog
    } catch (error) {
      console.error('Error creating chat:', error);
      alert(error instanceof Error ? error.message : 'Error al crear el chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Chat</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Chat</DialogTitle>
            <DialogDescription>
              Crea una nueva sala de chat. Los usuarios necesitarán permisos para acceder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Chat</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Chat de Soporte"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe el propósito de esta sala de chat..."
                required
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="webhookUrl">Webhook URL (Opcional)</Label>
              <Input
                id="webhookUrl"
                name="webhookUrl"
                type="url"
                placeholder="https://ejemplo.com/webhook"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}