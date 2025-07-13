"use client"

import { useAuth } from "../../context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Newspaper, Bell, User, LogIn, LogOut, UserPlus, Menu, Plus, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NavBar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  const isActiveRoute = (route) => {
    if (route === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(route)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
    setIsOpen(false)
  }

  const closeSheet = () => setIsOpen(false)

  const NavItems = () => (
    <>
      <Button
        variant={isActiveRoute("/") ? "default" : "ghost"}
        asChild
        onClick={closeSheet}
        className={`justify-start ${isActiveRoute("/") ? "bg-primary text-primary-foreground" : ""} mt-4`}
      >
        <Link href="/" className="justify-start">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>
      <Button
        variant={isActiveRoute("/posts") ? "default" : "ghost"}
        asChild
        onClick={closeSheet}
        className={`justify-start ${isActiveRoute("/posts") ? "bg-primary text-primary-foreground" : ""}`}
      >
        <Link href="/posts" className="justify-start">
          <Newspaper className="mr-2 h-4 w-4" />
          Posts
        </Link>
      </Button>
      <Button
        variant={isActiveRoute("/notices") ? "default" : "ghost"}
        asChild
        onClick={closeSheet}
        className={`justify-start ${isActiveRoute("/notices") ? "bg-primary text-primary-foreground" : ""}`}
      >
        <Link href="/notices" className="justify-start">
          <Bell className="mr-2 h-4 w-4" />
          Notices
        </Link>
      </Button>

      {user ? (
        <>
          {(user.role === "admin" || user.role === "editor") && (
            <>
              <Button
                variant={isActiveRoute("/admin") ? "default" : "ghost"}
                asChild
                onClick={closeSheet}
                className={`justify-start ${isActiveRoute("/admin") ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Link href="/admin" className="justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
              <Button
                variant={isActiveRoute("/admin/notice-sms") ? "default" : "ghost"}
                asChild
                onClick={closeSheet}
                className={`justify-start ${isActiveRoute("/admin/notice-sms") ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Link href="/admin/notice-sms" className="justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notice SMS
                </Link>
              </Button>
            </>
          )}
          <Button
            variant={isActiveRoute("/posts/create") ? "default" : "ghost"}
            asChild
            onClick={closeSheet}
            className={`justify-start ${isActiveRoute("/posts/create") ? "bg-primary text-primary-foreground" : ""}`}
          >
            <Link href="/posts/create" className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Link>
          </Button>
          <Button
            variant={isActiveRoute("/posts/my-posts") ? "default" : "ghost"}
            asChild
            onClick={closeSheet}
            className={`justify-start ${isActiveRoute("/posts/my-posts") ? "bg-primary text-primary-foreground" : ""}`}
          >
            <Link href="/posts/my-posts" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              My Posts
            </Link>
          </Button>
        </>
      ) : null}
    </>
  )

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-xl hover:text-primary/80 transition-colors">
              CivicPress
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button
              variant={isActiveRoute("/") ? "default" : "ghost"}
              size="sm"
              asChild
              className={isActiveRoute("/") ? "bg-primary text-primary-foreground" : ""}
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              variant={isActiveRoute("/posts") ? "default" : "ghost"}
              size="sm"
              asChild
              className={isActiveRoute("/posts") ? "bg-primary text-primary-foreground" : ""}
            >
              <Link href="/posts">
                <Newspaper className="mr-2 h-4 w-4" />
                Posts
              </Link>
            </Button>
            <Button
              variant={isActiveRoute("/notices") ? "default" : "ghost"}
              size="sm"
              asChild
              className={isActiveRoute("/notices") ? "bg-primary text-primary-foreground" : ""}
            >
              <Link href="/notices">
                <Bell className="mr-2 h-4 w-4" />
                Notices
              </Link>
            </Button>

            {user && (
              <>
                {(user.role === "admin" || user.role === "editor") && (
                  <>
                    <Button
                      variant={isActiveRoute("/admin") ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className={isActiveRoute("/admin") ? "bg-primary text-primary-foreground" : ""}
                    >
                      <Link href="/admin">
                        <User className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </Button>
                    <Button
                      variant={isActiveRoute("/admin/notice-sms") ? "default" : "ghost"}
                      size="sm"
                      asChild
                      className={isActiveRoute("/admin/notice-sms") ? "bg-primary text-primary-foreground" : ""}
                    >
                      <Link href="/admin/notice-sms">
                        <Bell className="mr-2 h-4 w-4" />
                        SMS
                      </Link>
                    </Button>
                  </>
                )}
                <Button
                  variant={isActiveRoute("/posts/create") ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActiveRoute("/posts/create") ? "bg-primary text-primary-foreground" : ""}
                >
                  <Link href="/posts/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </Link>
                </Button>
                <Button
                  variant={isActiveRoute("/posts/my-posts") ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActiveRoute("/posts/my-posts") ? "bg-primary text-primary-foreground" : ""}
                >
                  <Link href="/posts/my-posts">
                    <FileText className="mr-2 h-4 w-4" />
                    My Posts
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.username}</span>
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User info in mobile */}
                  {user && (
                    <div className="pb-4 border-b">
                      <p className="text-sm text-center font-bold text-green-400">
                        Welcome, <span className="font-bold text-foreground ">{user.username.toUpperCase()}</span>
                      </p>
                      
                    </div>
                  )}

                  {/* Navigation items */}
                  <div className="flex flex-col space-y-2 p-4">
                    <NavItems />
                  </div>

                  {/* Auth buttons in mobile */}
                  <div className="pt-4 border-t space-y-2 p-4">
                    {user ? (
                      <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          asChild
                          onClick={closeSheet}
                        >
                          <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                          </Link>
                        </Button>
                        <Button className="w-full justify-start bg-blue-400" asChild onClick={closeSheet}>
                          <Link href="/register">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Register
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
