"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Database } from "@/types/supabase"
import { Loader2, Crown, Share2, CheckCircle, Copy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const { supabase, user } = useSupabase()
  const [updating, setUpdating] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const [referralCopied, setReferralCopied] = useState(false)
  const { toast } = useToast()

useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error
        setProfile(data)
        setName(data.name || "")

        // Generar enlace de referido
        const baseUrl = window.location.origin
        setReferralLink(`${baseUrl}/register?ref=${user.id}`)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user, toast])

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setReferralCopied(true)
    toast({
      title: "Enlace copiado",
      description: "El enlace de referido ha sido copiado al portapapeles.",
    })
    setTimeout(() => setReferralCopied(false), 2000)
  }

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a MenuQR con mi enlace de referido",
          text: "Regístrate en MenuQR con mi enlace de referido y obtén un descuento en tu suscripción Premium.",
          url: referralLink,
        })
        toast({
          title: "Enlace compartido",
          description: "Gracias por compartir tu enlace de referido.",
        })
      } catch (error) {
        console.error("Error al compartir:", error)
      }
    } else {
      copyReferralLink()
    }
  }


  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get user email
        setEmail(user.email || "")

        // Fetch profile
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        setProfile(data)
        setName(data.name || "")
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user, toast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setUpdatingProfile(true)

      // Update profile
      const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id)

      if (error) throw error

      // Update local state
      setProfile((prev) => (prev ? { ...prev, name } : null))

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdatingPassword(true)

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la contraseña. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="password">Contraseña</TabsTrigger>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
          <TabsTrigger value="referrals">Programa de Referidos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleUpdateProfile}>
            <Card>
              <CardHeader>
                <CardTitle>Información del perfil</CardTitle>
                <CardDescription>Actualiza tu información personal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={email} disabled />
                  <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={updatingProfile}>
                  {updatingProfile ? "Guardando..." : "Guardar cambios"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="password">
          <form onSubmit={handleUpdatePassword}>
            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={updatingPassword}>
                  {updatingPassword ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Estado de suscripción</CardTitle>
              <CardDescription>Administra tu plan y suscripción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {profile?.is_premium ? (
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-gray-500"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{profile?.is_premium ? "Plan Premium" : "Plan Gratuito"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile?.is_premium
                        ? "Tienes acceso a todas las funciones premium"
                        : "Actualiza para acceder a más funciones"}
                    </p>
                  </div>
                </div>
                <Button asChild variant={profile?.is_premium ? "outline" : "default"}>
                  <a href="/dashboard/premium">{profile?.is_premium ? "Administrar" : "Actualizar"}</a>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Características de tu plan</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {profile?.is_premium ? "Hasta 3 menús digitales" : "1 menú digital"}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {profile?.is_premium ? "Categorías ilimitadas" : "Hasta 3 categorías"}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {profile?.is_premium ? "Diseños premium exclusivos" : "Diseños básicos"}
                  </li>
                  {profile?.is_premium && (
                    <>
                      <li className="flex items-center gap-2 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Sin marca de agua
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Soporte prioritario
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {profile?.is_premium ? (
                <Button variant="outline" asChild>
                  <a href="/dashboard/premium">Ver detalles</a>
                </Button>
              ) : (
                <Button asChild>
                  <a href="/dashboard/premium">Actualizar a Premium</a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
                <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Programa de Referidos</CardTitle>
              <CardDescription>
                Comparte tu enlace de referido y gana descuentos en tu suscripción Premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-primary/10 border-primary/20">
                <AlertTitle className="text-primary">¿Cómo funciona?</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    Comparte tu enlace único con amigos y colegas. Cuando alguien se registre con tu enlace y compre una
                    suscripción Premium, recibirás un descuento de $1 en tu próxima renovación.
                  </p>
                  <p className="mt-2">¡No hay límite en la cantidad de referidos que puedes tener!</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="referral-link">Tu enlace de referido</Label>
                <div className="flex space-x-2">
                  <Input id="referral-link" value={referralLink} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyReferralLink}>
                    {referralCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copiar enlace</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareReferralLink}>
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Compartir enlace</span>
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Estadísticas de referidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de referidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Referidos Premium</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Descuento acumulado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">$0.00</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
