"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Chrome } from "lucide-react"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)


  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
        toast({
            title: "Error al iniciar sesión",
            description: "Credenciales inválidas. Por favor, verifica tu correo y contraseña.",
            variant: "destructive",
        })
    } else {
        router.push("/")
        router.refresh()
    }
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    setIsGoogleLoading(false);
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-secondary to-accent opacity-50 blur-3xl"></div>
        <Card className="relative z-10 w-full max-w-sm shadow-2xl">
            <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ChromaChat
            </CardTitle>
            <CardDescription>
                Inicia sesión para comenzar tu conversación.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEmailPasswordLogin}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
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
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continúa con
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? (
                        "Redirigiendo..."
                    ) : (
                        <>
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
