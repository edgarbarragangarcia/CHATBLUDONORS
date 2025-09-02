
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    GoogleIcon,
    MessageSquareHeart,
} from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: "No se pudo autenticar con Google. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#2f2f3e_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
             <MessageSquareHeart className="h-10 w-10 mb-4 text-primary" />
             <h1 className="text-2xl font-bold tracking-wider text-foreground">INTERFAZ DE AGENTES</h1>
        </div>

        <div className="rounded-xl border bg-card/80 p-6 shadow-lg backdrop-blur-sm md:p-8">
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
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
                                    disabled={isLoading}
                                    className="bg-input/70"
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
                                    disabled={isLoading}
                                    className="bg-input/70"
                                />
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>
                        </div>
                    </form>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                O
                            </span>
                        </div>
                    </div>
                     <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Continuar con Google
                    </Button>
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
