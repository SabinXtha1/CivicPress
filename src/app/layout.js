'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Newspaper, Bell, User, LogIn, LogOut, UserPlus } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AuthWrapper({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <nav className="bg-background border-b">
            <div className="container mx-auto flex justify-between items-center p-4">
              <div className="text-primary font-bold text-xl">
                <a href="/">Ward News</a>
              </div>
              <div className="space-x-2 flex items-center">
                <Button variant="ghost" asChild>
                  <a href="/"><Home className="mr-2 h-4 w-4" />Home</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/posts"><Newspaper className="mr-2 h-4 w-4" />Posts</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/notices"><Bell className="mr-2 h-4 w-4" />Notices</a>
                </Button>
                {user ? (
                  <>
                    {(user.role === 'admin' || user.role === 'editor') && (
                      <Button variant="ghost" asChild>
                        <a href="/admin"><User className="mr-2 h-4 w-4" />Admin Panel</a>
                      </Button>
                    )}
                    <Button variant="ghost" asChild>
                      <a href="/users"><User className="mr-2 h-4 w-4" />Users</a>
                    </Button>
                    <span className="text-foreground">Welcome, {user?.username}</span>
                    <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <a href="/login"><LogIn className="mr-2 h-4 w-4" />Login</a>
                    </Button>
                    <Button asChild>
                      <a href="/register"><UserPlus className="mr-2 h-4 w-4" />Register</a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </AuthProvider>
  );
}
