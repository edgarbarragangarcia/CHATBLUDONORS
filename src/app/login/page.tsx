
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
    AiAssistantIcon,
} from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
       <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                        <div className="flex justify-center">
                            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
                                <AiAssistantIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">INGENIABOTS</h1>
                <p className="text-base sm:text-lg text-muted-foreground">Interfaz Integradora de Agentes</p>
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6 sm:p-8 shadow-modern-lg">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 glass rounded-xl p-1">
                                <TabsTrigger value="login" className="rounded-lg transition-modern">Iniciar Sesión</TabsTrigger>
                                <TabsTrigger value="register" className="rounded-lg transition-modern">Registrarse</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login" className="mt-6">
                                <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="body-medium font-medium">Correo Electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="tu@email.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                className="rounded-xl h-11 sm:h-12 transition-modern focus:shadow-modern"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="body-medium font-medium">Contraseña</Label>
                                            <Input 
                                                id="password" 
                                                type="password"
                                                placeholder="Tu contraseña" 
                                                required 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                className="rounded-xl h-11 sm:h-12 transition-modern focus:shadow-modern"
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            className="w-full h-11 sm:h-12 rounded-xl transition-modern hover:shadow-modern" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                        </Button>
                                    </div>
                                </form>
                                
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border/50" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-4 caption text-muted-foreground uppercase tracking-wider">
                                            O continúa con
                                        </span>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-12 rounded-xl transition-modern hover:shadow-modern" 
                                    onClick={handleGoogleLogin}
                                >
                                    <GoogleIcon className="mr-3 h-5 w-5" />
                                    Google
                                </Button>
                            </TabsContent>
                            <TabsContent value="register" className="mt-6">
                                <div className="text-center p-8 space-y-4">
                                    <div className="flex justify-center">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 shadow-sm">
                                            <AiAssistantIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="heading-4">Próximamente</h3>
                                        <p className="body-medium text-muted-foreground">La funcionalidad de registro estará disponible pronto.</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center glass rounded-2xl p-8 shadow-modern-lg transition-modern hover:shadow-modern">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl"></div>
                    <Image 
                        src="https://picsum.photos/600/400"
                        alt="AI Agents" 
                        width={600} 
                        height={400}
                        data-ai-hint="AI chat"
                        className="relative rounded-2xl shadow-modern"
                    />
                </div>
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="heading-2 text-foreground">Comunicación Inteligente</h2>
                    <p className="body-large text-muted-foreground">
                        Conecta con agentes especializados en salas dedicadas para obtener respuestas precisas y personalizadas al instante.
                    </p>
                    <div className="flex justify-center gap-2 pt-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
}
