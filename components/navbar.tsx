"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useSupabase } from "./supabase-provider"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useSupabase()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
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
            <span className="font-bold text-xl">Catálogo Digital</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#benefits" className="text-sm font-medium hover:text-primary">
            Beneficios
          </Link>
          <Link href="/#prices" className="text-sm font-medium hover:text-primary">
            Precios
          </Link>
          <Link href="/#create" className="text-sm font-medium hover:text-primary">
            Crear
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Panel de control</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/#benefits"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Beneficios
                </Link>
                <Link
                  href="/#pricing"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Precios
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Contacto
                </Link>

                {user ? (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      Panel de control
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        Iniciar sesión
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        Registrarse
                      </Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
