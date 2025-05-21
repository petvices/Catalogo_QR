"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { PlusCircle, QrCode, ExternalLink, Crown } from "lucide-react"
import type { Database } from "@/types/supabase"
import { OnboardingTutorial } from "@/components/onboarding/onboarding-tutorial"
import FacebookPixel from '@/components/FacebookPixel'

type Menu = Database["public"]["Tables"]["menus"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function DashboardPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const fetchData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Check if onboarding needs to be shown
      if (!profileData.onboarding_completed) {
        setShowOnboarding(true)
        setLoading(false)
        return
      }

      // Fetch user menus
      const { data: menusData, error: menusError } = await supabase
        .from("menus")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (menusError) throw menusError
      setMenus(menusData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [supabase, user, toast])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    // Recargar los datos después de completar el onboarding
    fetchData()
  }

  const canCreateMenu = () => {
    if (!profile) return false
    if (profile.is_premium) return menus.length < 3
    return menus.length < 1
  }

  // Mostrar onboarding si es necesario
  if (showOnboarding) {
    return <OnboardingTutorial onComplete={handleOnboardingComplete} />
  }

  // Mostrar loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <FacebookPixel />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
          <p className="text-muted-foreground">Gestiona tus menús digitales y personaliza tu experiencia</p>
        </div>
        {!profile?.is_premium && (
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/premium">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Actualizar a Premium</span>
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de menús</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.length}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.is_premium ? "Límite: 3 menús" : "Límite: 1 menús"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de cuenta</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.is_premium ? "Premium" : "Gratuito"}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.is_premium ? "Acceso a todas las funciones" : "Funciones limitadas"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Mis menús</h2>
          {canCreateMenu() && (
            <Button asChild>
              <Link href="/dashboard/menus/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear nuevo menú
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted"></CardHeader>
                <CardContent className="py-4">
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-1/2 bg-muted rounded mt-2"></div>
                </CardContent>
                <CardFooter className="h-10 bg-muted"></CardFooter>
              </Card>
            ))}
          </div>
        ) : menus.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <CardTitle>{menu.name}</CardTitle>
                  <CardDescription>{menu.description || "Sin descripción"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div
                      className={`mr-2 h-3 w-3 rounded-full ${menu.is_active ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    {menu.is_active ? "Activo" : "Inactivo"}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/menu/${menu.id}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/menus/${menu.id}`}>Editar</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/menus/${menu.id}/qr`}>
                      <QrCode className="mr-2 h-4 w-4" />
                      QR
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No tienes menús</CardTitle>
              <CardDescription>Crea tu primer menú digital para compartirlo con tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Con MenuQR puedes crear menús digitales fácilmente y compartirlos mediante códigos QR. Tus clientes
                podrán acceder a tu menú desde sus dispositivos móviles.
              </p>
            </CardContent>
            <CardFooter>
              {canCreateMenu() ? (
                <Button asChild>
                  <Link href="/dashboard/menus/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear mi primer menú
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/dashboard/premium">
                    <Crown className="mr-2 h-4 w-4" />
                    Actualizar a Premium para crear más menús
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

function Menu(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
