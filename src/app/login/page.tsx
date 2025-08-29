"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChromeIcon } from "lucide-react"

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-secondary to-accent opacity-50 blur-3xl"></div>
        <Card className="relative z-10 w-full max-w-sm shadow-2xl">
            <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ChromaChat
            </CardTitle>
            <CardDescription>
                Sign in to start your colorful conversation.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Button
                onClick={handleGoogleLogin}
                className="w-full transition-transform hover:scale-105"
                variant="default"
                size="lg"
            >
                <ChromeIcon className="mr-2 h-5 w-5" />
                Sign in with Google
            </Button>
            </CardContent>
        </Card>
    </div>
  )
}
