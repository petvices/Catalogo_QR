"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Database } from "@/types/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function CreateMenuPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [theme, setTheme] = useState("default")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuCount, setMenuCount] = useState(0)
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  const MAX_DESCRIPTION_LENGTH = 100

  useEffect(() => {
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

        // Count existing menus
        const { count, error: countError } = await supabase
          .from("menus")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (countError) throw countError
        setMenuCount(count || 0)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [supabase, user, toast])

  const canCreateMenu = () => {
    if (!profile) return false
    if (profile.is_premium) return menuCount < 3
    return menuCount < 1
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(newValue)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!canCreateMenu()) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de menús para tu plan. Actualiza a Premium para crear más menús.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Create the menu
      const { data, error } = await supabase
        .from("menus")
        .insert({
          user_id: user.id,
          name,
          description,
          theme,
          is_active: true,
          business_hours: {
            monday: { open: "09:00", close: "18:00", isOpen: true },
            tuesday: { open: "09:00", close: "18:00", isOpen: true },
            wednesday: { open: "09:00", close: "18:00", isOpen: true },
            thursday: { open: "09:00", close: "18:00", isOpen: true },
            friday: { open: "09:00", close: "18:00", isOpen: true },
            saturday: { open: "10:00", close: "15:00", isOpen: true },
            sunday: { open: "10:00", close: "15:00", isOpen: false },
          },
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Menú creado",
        description: "Tu menú ha sido creado correctamente. Ahora puedes agregar categorías y productos.",
      })

      router.push(`/dashboard/menus/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el menú. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!canCreateMenu()) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear nuevo menú</h1>
          <p className="text-muted-foreground">Personaliza tu menú digital para compartirlo con tus clientes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Límite de menús alcanzado</CardTitle>
            <CardDescription>Has alcanzado el límite de menús para tu plan actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {profile?.is_premium
                ? "Tu plan Premium te permite crear hasta 3 menús. Has alcanzado este límite."
                : "Tu plan gratuito te permite crear 1 menú. Actualiza a Premium para crear hasta 3 menús."}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/dashboard/premium">Actualizar a Premium</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear nuevo menú</h1>
        <p className="text-muted-foreground">Personaliza tu menú digital para compartirlo con tus clientes</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Ingresa la información principal de tu menú</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del menú</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Menú Principal, Carta de Vinos, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <span
                  className={`text-xs ${description.length >= MAX_DESCRIPTION_LENGTH * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Breve descripción de tu menú (máximo 100 caracteres)"
                rows={3}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <p className="text-xs text-muted-foreground">Describe brevemente tu menú. Máximo 100 caracteres.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Predeterminado</SelectItem>
                  <SelectItem value="elegant">Elegante</SelectItem>
                  <SelectItem value="modern">Moderno</SelectItem>
                  <SelectItem value="rustic">Rústico</SelectItem>
                  {profile?.is_premium && (
                    <>
                      <SelectItem value="premium-dark">Premium Oscuro</SelectItem>
                      <SelectItem value="premium-light">Premium Claro</SelectItem>
                      <SelectItem value="premium-colorful">Premium Colorido</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {!profile?.is_premium && (
                <p className="text-xs text-muted-foreground mt-1">
                  Actualiza a Premium para acceder a temas exclusivos
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear menú"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
