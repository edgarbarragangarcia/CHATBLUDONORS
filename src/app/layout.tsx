import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";
import { WebhookProvider } from "@/contexts/webhook-context";
import { MessagesProvider } from "@/contexts/messages-context";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ChatBluDonors',
  description: 'Aplicación de chat y formularios para donantes',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChatBluDonors',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "font-body antialiased", process.env.NODE_ENV === 'development' ? 'debug-screens' : '')}>
        <ThemeProvider>
          <WebhookProvider>
            <MessagesProvider>
              {children}
              <Toaster />
              <PWAInstallPrompt />
            </MessagesProvider>
          </WebhookProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
