"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useSupabase } from "@/components/supabase-provider"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import type { Database } from "@/types/supabase"

type Menu = Database["public"]["Tables"]["menus"]["Row"]

interface MenuDetailsProps {
  menu: Menu
  updateMenu: (updatedMenu: Partial<Menu>) => Promise<void>
}

export default function MenuDetails({ menu, updateMenu }: MenuDetailsProps) {
  const [name, setName] = useState(menu.name)
  const [description, setDescription] = useState(menu.description || "")
  const [isActive, setIsActive] = useState(menu.is_active)
  const [loading, setLoading] = useState(false)

  const [slug, setSlug] = useState(menu.slug || "")
  const [slugError, setSlugError] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const { supabase, user } = useSupabase()

  // Cargar el estado premium del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          return
        }

        console.log("User premium status:", data.is_premium)
        setIsPremium(data.is_premium)
      } catch (error) {
        console.error("Error in fetchUserProfile:", error)
      }
    }

    fetchUserProfile()
  }, [supabase, user])

  // Función para validar y verificar slug
  const validateSlug = (value: string) => {
    if (!value) return null

    if (value.length < 3) return "Mínimo 3 caracteres"
    if (value.length > 50) return "Máximo 50 caracteres"
    if (!/^[a-z0-9-]+$/.test(value)) return "Solo letras minúsculas, números y guiones"
    if (value.startsWith("-") || value.endsWith("-")) return "No puede empezar o terminar con guión"
    if (value.includes("--")) return "No puede tener guiones consecutivos"

    const reservedSlugs = ["admin", "api", "www", "app", "dashboard", "login", "register"]
    if (reservedSlugs.includes(value)) return "Esta URL está reservada"

    return null
  }

  const checkSlugAvailability = async (slugValue: string) => {
    if (!slugValue || slugValue === menu.slug) {
      setSlugAvailable(null)
      return
    }

    setCheckingSlug(true)
    try {
      const response = await fetch("/api/menus/check-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugValue, menuId: menu.id }),
      })

      const data = await response.json()
      setSlugAvailable(data.available)
    } catch (error) {
      console.error("Error checking slug:", error)
      setSlugAvailable(null)
    } finally {
      setCheckingSlug(false)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSlug(value)

    const error = validateSlug(value)
    setSlugError(error)

    if (!error && value) {
      const timeoutId = setTimeout(() => checkSlugAvailability(value), 500)
      return () => clearTimeout(timeoutId)
    } else {
      setSlugAvailable(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar los datos para actualizar
      const updateData: Partial<Menu> = {
        name,
        description,
        is_active: isActive,
      }

      // Solo incluir slug si es usuario premium y no hay errores
      if (isPremium && slug) {
        if (slugError) {
          alert("Por favor, corrige los errores en la URL personalizada antes de guardar.")
          setLoading(false)
          return
        }

        if (slugAvailable === false) {
          alert("La URL personalizada ya está en uso. Por favor, elige otra.")
          setLoading(false)
          return
        }

        // Añadir el slug a los datos de actualización
        updateData.slug = slug
        console.log("Guardando slug:", slug)
      }

      // Llamar a la función de actualización
      await updateMenu(updateData)
      console.log("Menú actualizado con éxito, datos enviados:", updateData)
    } catch (error) {
      console.error("Error al guardar:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del menú</CardTitle>
          <CardDescription>Actualiza la información básica de tu menú</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del menú</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de tu menú"
              rows={3}
            />
          </div>

          {/* Campo de slug personalizado - solo para usuarios premium */}
          <div className="space-y-2 border p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="slug" className="text-base font-medium">
                  URL personalizada
                </Label>
                {isPremium ? (
                  <Badge className="bg-green-600">Premium</Badge>
                ) : (
                  <Badge className="bg-amber-600">Solo Premium</Badge>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {isPremium
                ? "Personaliza la URL de tu menú para que sea más fácil de compartir."
                : "Actualiza a Premium para personalizar la URL de tu menú."}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">menu.petvices.lat/menu/</span>
              <div className="relative flex-1">
                <Input
                  id="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  disabled={!isPremium || loading}
                  placeholder="mi-restaurante"
                  className={`flex-1 ${!isPremium ? "bg-gray-100" : ""} ${
                    slugError ? "border-red-500" : slugAvailable === true ? "border-green-500" : ""
                  }`}
                />
                {checkingSlug && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {!checkingSlug && slugAvailable === true && slug && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {!checkingSlug && slugAvailable === false && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            </div>

            {slugError && <p className="text-sm text-red-600">{slugError}</p>}
            {slugAvailable === true && slug && <p className="text-sm text-green-600">✓ URL disponible</p>}
            {slugAvailable === false && <p className="text-sm text-red-600">✗ Esta URL ya está en uso</p>}

            {!isPremium && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 border-0"
                  onClick={() => (window.location.href = "/dashboard/premium")}
                >
                  Actualizar a Premium
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active">Menú activo</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Cuando el menú está inactivo, los clientes verán un mensaje indicando que el menú no está disponible.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
