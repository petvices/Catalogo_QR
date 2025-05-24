"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useSupabase } from "./supabase-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Settings, LogOut, User, ChevronDown, ShoppingCart, Award, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const menuIdMatch = pathname.match(/\/dashboard\/menus\/([^/]+)/)
  const menuId = menuIdMatch ? menuIdMatch[1] : null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo y menú móvil */}
        <div className="flex items-center gap-2">
          {/* Menú móvil */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 pt-6">
                  <Link
                    href="/dashboard"
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Home className="h-4 w-4 mr-3" />
                    <span>Inicio</span>
                  </Link>
                  <Link
                    href={`/dashboard/menus/${menuId}/orders`}
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      pathname.includes(`/dashboard/menus/${menuId}/orders`) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span>Pedidos</span>
                  </Link>
                  <Link
                    href={`/dashboard`}
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      pathname.includes(`/dashboard/menus/${menuId}/loyalty`) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    <span>Fidelización</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    <span>Configuración</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
              <rect width="20" height="5" x="2" y="2" rx="2" />
              <path d="M7 17v-5" />
              <path d="M11 17v-5" />
              <path d="M15 17v-5" />
              <path d="M19 17v-5" />
              <path d="M5 7v5" />
              <path d="M19 7v5" />
            </svg>
            <span className="font-bold text-xl hidden md:inline-block">Catálogo Digital</span>
          </Link>
        </div>

        {/* Menú de navegación (desktop) */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Inicio</span>
          </Link>
          <Link
            href={`/dashboard/menus/${menuId}/orders`}
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname.includes(`/dashboard/menus/${menuId}/orders`) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Pedidos</span>
          </Link>
          <Link
            href={`/dashboard`}
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname.includes(`/dashboard/menus/${menuId}/loyalty`) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Award className="h-4 w-4 mr-2" />
            <span>Fidelización</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
              pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Configuración</span>
          </Link>
        </nav>

        {/* Controles de usuario */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">{user?.user_metadata?.name || user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}