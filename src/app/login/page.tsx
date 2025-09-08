
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
import { Mail, Lock, Sparkles, Bot, Zap } from "lucide-react";
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
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-corporate-gray-light/30 to-corporate-navy/20 dark:from-slate-900 dark:via-corporate-navy/30 dark:to-corporate-black-70/50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-corporate-navy/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-corporate-green/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-corporate-gray-light/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
              {/* Header with Modern Animation */}
              <div className="text-center mb-8 space-y-6">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-corporate-navy to-corporate-green rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-900 rounded-full shadow-2xl transform transition duration-500 hover:scale-110">
                      <Bot className="h-10 w-10 text-transparent bg-gradient-to-r from-corporate-navy to-corporate-green bg-clip-text" />
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-corporate-navy via-corporate-green to-corporate-navy bg-clip-text text-transparent animate-gradient-x">
                    INGENIABOTS
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 font-medium tracking-wide">
                    Interfaz Integradora de Agentes
                  </p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-corporate-navy rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-corporate-green rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-corporate-gray-light rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>

              {/* Modern Glass Card */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-corporate-navy to-corporate-green rounded-3xl blur opacity-30"></div>
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-slate-700/20">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-1 backdrop-blur-sm">
                      <TabsTrigger value="login" className="rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-corporate-navy data-[state=active]:to-corporate-navy/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-corporate-navy/30 data-[state=active]:scale-105 data-[state=active]:font-semibold">Iniciar Sesión</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-corporate-navy data-[state=active]:to-corporate-navy/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-corporate-navy/30 data-[state=active]:scale-105 data-[state=active]:font-semibold">Registrarse</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="mt-6">
                      <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                        <div className="space-y-4">
                          {/* Email Field */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Correo Electrónico
                            </Label>
                            <div className="relative group">
                              <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="h-12 rounded-2xl border-0 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm pl-4 pr-4 text-base transition-all duration-300 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-[1.02] group-hover:shadow-lg"
                              />
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-corporate-navy/20 to-corporate-green/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          {/* Password Field */}
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Contraseña
                            </Label>
                            <div className="relative group">
                              <Input 
                                id="password" 
                                type="password"
                                placeholder="Tu contraseña" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="h-12 rounded-2xl border-0 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm pl-4 pr-4 text-base transition-all duration-300 focus:bg-white dark:focus:bg-slate-800 focus:shadow-xl focus:scale-[1.02] group-hover:shadow-lg"
                              />
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-corporate-navy/20 to-corporate-green/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          {/* Submit Button */}
                          <Button 
                            type="submit" 
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-corporate-navy to-corporate-navy/80 hover:from-corporate-navy/90 hover:to-corporate-navy/70 text-white font-semibold text-base shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                            disabled={isLoading}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isLoading ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Iniciando sesión...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-5 w-5" />
                                  Iniciar Sesión
                                </>
                              )}
                            </div>
                          </Button>
                        </div>
                      </form>
                                
                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            O continúa con
                          </span>
                        </div>
                      </div>
                      
                      {/* Google Button */}
                      <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-2xl border-2 border-corporate-navy/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-corporate-navy hover:text-white hover:border-corporate-navy transition-all duration-300 hover:shadow-xl hover:shadow-corporate-navy/20 hover:scale-[1.02] group" 
                        onClick={handleGoogleLogin}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <GoogleIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                          <span className="font-semibold text-base">Google</span>
                        </div>
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="register" className="mt-8">
                      <div className="text-center p-8 space-y-6">
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full blur opacity-50"></div>
                            <div className="relative flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <Bot className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Próximamente</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                            La funcionalidad de registro estará disponible pronto.
                          </p>
                          <div className="flex justify-center space-x-1 pt-4">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Showcase */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-corporate-navy to-corporate-green rounded-2xl opacity-20 animate-float"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-corporate-gray-light to-corporate-navy rounded-full opacity-20 animate-float-delayed"></div>
              
              {/* Main Content Card */}
              <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-slate-700/30 transform hover:scale-105 transition-all duration-500">
                {/* Animated Illustration */}
                <div className="relative mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-corporate-navy to-corporate-green rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-xl">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col space-y-2">
                          <div className="w-8 h-2 bg-gradient-to-r from-corporate-navy to-corporate-green rounded-full animate-pulse"></div>
                          <div className="w-6 h-2 bg-gradient-to-r from-corporate-gray-light to-corporate-navy rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-10 h-2 bg-gradient-to-r from-corporate-green to-corporate-navy rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <Bot className="h-12 w-12 text-transparent bg-gradient-to-r from-corporate-navy to-corporate-green bg-clip-text" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 items-end">
                          <div className="w-8 h-2 bg-gradient-to-r from-corporate-green to-corporate-navy rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-6 h-2 bg-gradient-to-r from-corporate-navy to-corporate-gray-light rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                          <div className="w-10 h-2 bg-gradient-to-r from-corporate-gray-light to-corporate-navy rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    Comunicación Inteligente
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    Conecta con agentes especializados en salas dedicadas para obtener respuestas precisas y personalizadas al instante.
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <div className="px-4 py-2 bg-corporate-navy/10 dark:bg-corporate-navy/30 text-corporate-navy dark:text-corporate-gray-light rounded-full text-sm font-medium">
                      IA Avanzada
                    </div>
                    <div className="px-4 py-2 bg-corporate-green/10 dark:bg-corporate-green/30 text-corporate-green dark:text-corporate-green rounded-full text-sm font-medium">
                      Tiempo Real
                    </div>
                    <div className="px-4 py-2 bg-corporate-gray-light/20 dark:bg-corporate-gray-light/30 text-corporate-navy dark:text-corporate-gray-light rounded-full text-sm font-medium">
                      Seguro
                    </div>
                  </div>
                  
                  {/* Animated Dots */}
                  <div className="flex justify-center space-x-2 pt-6">
                    <div className="w-3 h-3 bg-gradient-to-r from-corporate-navy to-corporate-green rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-corporate-green to-corporate-navy rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-corporate-gray-light to-corporate-navy rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
