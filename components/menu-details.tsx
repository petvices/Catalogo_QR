"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateMenu({
        name,
        description,
        is_active: isActive,
      })
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
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
