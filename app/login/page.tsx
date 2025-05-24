"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const isEmail = identifier.includes("@")

      if (isEmail) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })

        if (signInError) {
          throw new Error(signInError.message)
        }
      } else {
        const response = await fetch("/api/auth/login-by-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: identifier, password }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Credenciales inválidas")
        }
      }

      // Esperar a que la sesión esté disponible
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData.session) {
        throw new Error("No se pudo establecer la sesión correctamente.")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo.",
      })

      // Redirección asegurada
      setTimeout(() => {
      router.push("/dashboard")
      router.refresh()
    }, 1000) // 
    } catch (error: any) {
      console.error("Error durante el login:", error)

      let errorMessage = "Error al iniciar sesión. Verifica tus credenciales."

      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Credenciales inválidas. Verifica tu email/usuario y contraseña."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Por favor, verifica tu email antes de iniciar sesión."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)

      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center mb-4">
              <img src="/logo3.png" alt="Avatar" className="w-12 h-12 object-cover" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6 pb-4">
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Email o nombre de usuario
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    placeholder="tu@ejemplo.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="*******"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Regístrate
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
