"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GoogleIcon, MessageSquareHeart, MessagesSquare, Bot, Sparkles } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Credenciales inválidas. Por favor, verifica tu correo y contraseña.",
        variant: "destructive",
      });
    } else {
      router.push("/");
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    setIsGoogleLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-start justify-center p-12 bg-gradient-to-br from-accent to-background">
        <div className="flex items-center gap-3 mb-8">
            <MessageSquareHeart className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">BLUEDONORS CHAT</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Conversaciones más inteligentes y fluidas.</h1>
        <p className="text-lg text-muted-foreground mb-12">
            Experimenta un chat potenciado por IA que entiende el contexto, sugiere respuestas y te ayuda a comunicarte mejor.
        </p>
        <div className="space-y-8">
            <div className="flex items-start gap-4">
                <MessagesSquare className="h-8 w-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold text-lg">Salas de Chat Dinámicas</h3>
                    <p className="text-muted-foreground">Comunícate en tiempo real con equipos y amigos en canales organizados.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Bot className="h-8 w-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold text-lg">Asistente de IA</h3>
                    <p className="text-muted-foreground">Deja que nuestro agente de IA te ayude a redactar y te dé sugerencias inteligentes.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold text-lg">Respuestas Sugeridas</h3>
                    <p className="text-muted-foreground">Acelera tus conversaciones con respuestas generadas por IA según el contexto.</p>
                </div>
            </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-center">Bienvenido a BLUEDONORS CHAT</h2>
            <p className="text-muted-foreground text-center mb-6">Elige tu método preferido para continuar.</p>
            
            <Button variant="outline" className="w-full mb-4" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                 {isGoogleLoading ? (
                        "Redirigiendo..."
                    ) : (
                        <>
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Continuar con Google
                        </>
                    )}
            </Button>

             <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continuar con email
                    </span>
                  </div>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <form onSubmit={handleEmailPasswordLogin} className="mt-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading || isGoogleLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    placeholder="Tu contraseña" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading || isGoogleLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>
                        </div>
                    </form>
                </TabsContent>
                <TabsContent value="register">
                   <div className="text-center text-muted-foreground p-8">
                       <p>La funcionalidad de registro estará disponible próximamente.</p>
                   </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
