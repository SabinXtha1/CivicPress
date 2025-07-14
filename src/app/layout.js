'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/ui/footer"
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Newspaper, Bell, User, LogIn, LogOut, UserPlus } from 'lucide-react';

import { Toaster } from 'react-hot-toast';
import Header from '@/components/ui/Header';

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
      <body className={`${geistSans.variable} ${geistMono.variable} `}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="container mx-auto ">
            {children}
          </main>
          <Footer/>
		  <Toaster />
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
