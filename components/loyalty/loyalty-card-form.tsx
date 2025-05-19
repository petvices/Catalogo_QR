"use client"

import type React from "react"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]

interface LoyaltyCardFormProps {
  menuId: string
  initialData: LoyaltyCard | null
  onSuccess: () => void
  onCancel: () => void
}

export function LoyaltyCardForm({ menuId, initialData, onSuccess, onCancel }: LoyaltyCardFormProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: initialData?.customer_name || "",
    customer_phone: initialData?.customer_phone || "",
    customer_email: initialData?.customer_email || "",
    total_points: initialData?.total_points || 2,
    max_points: initialData?.max_points || 10,
    reward_description: initialData?.reward_description || "Producto gratis",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_points" || name === "max_points" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      if (initialData) {
        // Actualizar tarjeta existente
        const { error } = await supabase
          .from("loyalty_cards")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Tarjeta actualizada",
          description: "La tarjeta de fidelización se ha actualizado correctamente",
        })
      } else {
        // Crear nueva tarjeta
        const { error } = await supabase.from("loyalty_cards").insert({
          menu_id: menuId,
          ...formData,
        })

        if (error) throw error

        toast({
          title: "Tarjeta creada",
          description: "La tarjeta de fidelización se ha creado correctamente",
        })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Tarjeta" : "Nueva Tarjeta de Fidelización"}</CardTitle>
        <CardDescription>
          {initialData
            ? "Actualiza los datos de la tarjeta de fidelización"
            : "Crea una nueva tarjeta de fidelización para tu cliente"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre del cliente *</Label>
            <Input
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Teléfono</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone || ""}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Email</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              value={formData.customer_email || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_points">Puntos iniciales</Label>
              <Input
                id="total_points"
                name="total_points"
                type="number"
                min="0"
                max="10"
                value={formData.total_points}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_points">Puntos máximos</Label>
              <Input
                id="max_points"
                name="max_points"
                type="number"
                min="5"
                max="20"
                value={formData.max_points}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward_description">Descripción del premio</Label>
            <Textarea
              id="reward_description"
              name="reward_description"
              value={formData.reward_description || ""}
              onChange={handleChange}
              placeholder="Ej: Un café gratis, 50% de descuento, etc."
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Tarjeta"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
