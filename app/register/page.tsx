"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, Phone, User, Lock, Gift } from "lucide-react"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [acceptPromotions, setAcceptPromotions] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Obtener el código de referido de la URL si existe
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
      // Guardar el código de referido en localStorage para usarlo después
      localStorage.setItem("referralCode", ref)
      toast({
        title: "Código de referido detectado",
        description: "Te has registrado con un código de referido. Obtendrás un descuento al actualizar a Premium.",
      })
    }
  }, [searchParams, toast])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      toast({
        title: "Términos y servicios requeridos",
        description: "Debes aceptar los términos y servicios para continuar.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Iniciando registro con:", { email, firstName, lastName, username })

      // Preparar los datos para el registro, incluyendo el código de referido si existe
      const registerData = {
        firstName,
        lastName,
        username, // Enviamos el username por separado
        email,
        password,
        phone,
        acceptPromotions,
        referralCode,
      }

      // Usar la API route en lugar de llamar directamente a Supabase
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario")
      }

      setSuccess(
        "¡Tu cuenta ha sido creada correctamente! Por favor, verifica tu correo electrónico antes de iniciar sesión. Si no encuentras el correo de verificación, revisa tu carpeta de spam. Serás redirigido al inicio de sesión en unos momentos...",
      )

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente. Por favor, verifica tu correo electrónico.",
      })

      // Esperar un momento antes de redirigir para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        router.push("/login")
      }, 15000)
    } catch (error: any) {
      console.error("Error durante el registro:", error)

      // Mensajes de error más descriptivos
      let errorMessage = "Ha ocurrido un error al crear la cuenta."

      if (error.message) {
        if (error.message.includes("duplicate key")) {
          errorMessage = "Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo."
        } else if (error.message.includes("password")) {
          errorMessage = "La contraseña no cumple con los requisitos mínimos. Debe tener al menos 6 caracteres."
        } else if (error.message.includes("email")) {
          errorMessage = "El formato del correo electrónico no es válido."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)

      toast({
        title: "Error al registrarse",
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
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crear cuenta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Únete a nosotros y comienza a crear tu menú digital
            </CardDescription>
            {referralCode && (
              <Alert className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <Gift className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">¡Código de referido aplicado!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Te has registrado con un código de referido. Obtendrás un descuento al actualizar a Premium.
                </AlertDescription>
              </Alert>
            )}
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

          {success && (
            <div className="px-6 pb-4">
              <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Nombre
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="Tu nombre"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Apellido
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Tu apellido"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nombre de usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="tu_usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Este será tu identificador único para iniciar sesión</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Número telefónico
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="**********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
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
                <p className="text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={() => window.open("/terms-of-service", "_blank")}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      términos y servicios
                    </button>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptPromotions"
                    checked={acceptPromotions}
                    onCheckedChange={(checked) => setAcceptPromotions(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="acceptPromotions" className="text-sm text-gray-600 leading-relaxed">
                    Acepto recibir correos promocionales y ofertas especiales
                  </label>
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
                    Creando cuenta...
                  </>
                ) : (
                  "Crear mi cuenta"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
