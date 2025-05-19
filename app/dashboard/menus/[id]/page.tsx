"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useLoading } from "@/components/loading-overlay"
import type { Database } from "@/types/supabase"
import MenuDetails from "@/components/menu-details"
import MenuCategories from "@/components/menu-categories"
import MenuHours from "@/components/menu-hours"
import MenuAppearance from "@/components/menu-appearance"
import { ShoppingBag } from "lucide-react"

type Menu = Database["public"]["Tables"]["menus"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Componente para el contenido de la pestaña
function TabContent({
  activeTab,
  menu,
  updateMenu,
  isPremium,
  menuId,
}: {
  activeTab: string
  menu: Menu
  updateMenu: (menu: Partial<Menu>) => Promise<void>
  isPremium: boolean
  menuId: string
}) {
  switch (activeTab) {
    case "details":
      return <MenuDetails menu={menu} updateMenu={updateMenu} />
    case "categories":
      return <MenuCategories menuId={menuId} isPremium={isPremium} />
    case "hours":
      return <MenuHours menu={menu} updateMenu={updateMenu} />
    case "appearance":
      return <MenuAppearance menu={menu} updateMenu={updateMenu} isPremium={isPremium} />
    default:
      return null
  }
}

export default function MenuPage() {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()
  const menuId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!user || !menuId) return

      try {
        if (isMounted) setLoading(true)

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        // Fetch menu
        const { data: menuData, error: menuError } = await supabase.from("menus").select("*").eq("id", menuId).single()

        if (menuError) throw menuError

        // Check if the menu belongs to the user
        if (menuData.user_id !== user.id) {
          router.push("/dashboard")
          return
        }

        if (isMounted) {
          setProfile(profileData)
          setMenu(menuData)
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el menú. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [supabase, user, menuId, router, toast])

  const updateMenu = async (updatedMenu: Partial<Menu>) => {
    if (!menu) return

    try {
      startLoading()

      const { error } = await supabase.from("menus").update(updatedMenu).eq("id", menu.id)

      if (error) throw error

      setMenu({ ...menu, ...updatedMenu })

      toast({
        title: "Menú actualizado",
        description: "Los cambios han sido guardados correctamente.",
      })
    } catch (error: any) {
      console.error("Error updating menu:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  if (!menu) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menú no encontrado</CardTitle>
          <CardDescription>
            El menú que estás buscando no existe o no tienes permisos para acceder a él.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")}>Volver al panel</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{menu.name}</h1>
          <p className="text-muted-foreground">{menu.description || "Sin descripción"}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              window.open(`/menu/${menu.id}`, '_blank', 'noopener noreferrer');
            }}
          >
            Ver menú
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/dashboard/menus/${menu.id}/orders`)
            }}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver pedidos
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/dashboard/menus/${menu.id}/qr`)
            }}
          >
            Código QR
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="categories">Categorías y Productos</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        <Suspense>
          <TabContent
            activeTab={activeTab}
            menu={menu}
            updateMenu={updateMenu}
            isPremium={profile?.is_premium || false}
            menuId={menu.id}
          />
        </Suspense>
      </Tabs>
    </div>
  )
}
