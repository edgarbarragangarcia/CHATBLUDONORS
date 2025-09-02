import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'INTERFAZ DE AGENTES',
  description: 'A modern chat application with AI-powered suggestions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-body antialiased", process.env.NODE_ENV === 'development' ? 'debug-screens' : '')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
