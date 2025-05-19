"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/types/supabase"

type Menu = Database["public"]["Tables"]["menus"]["Row"]
type BusinessHours = {
  [day: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

interface MenuHoursProps {
  menu: Menu
  updateMenu: (updatedMenu: Partial<Menu>) => Promise<void>
}

const DAYS = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return { value: `${hour}:00`, label: `${hour}:00` }
})

export default function MenuHours({ menu, updateMenu }: MenuHoursProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    (menu.business_hours as BusinessHours) || {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: true },
      sunday: { open: "10:00", close: "15:00", isOpen: false },
    },
  )
  const [loading, setLoading] = useState(false)

  const handleToggleDay = (day: string, isOpen: boolean) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        isOpen,
      },
    })
  }

  const handleChangeHours = (day: string, type: "open" | "close", value: string) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [type]: value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateMenu({
        business_hours: businessHours,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Horarios de atención</CardTitle>
          <CardDescription>Configura los horarios en los que tu negocio está abierto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="w-full sm:w-1/3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${day.id}-toggle`}
                      checked={businessHours[day.id]?.isOpen}
                      onCheckedChange={(checked) => handleToggleDay(day.id, checked)}
                    />
                    <Label htmlFor={`${day.id}-toggle`} className="font-medium">
                      {day.label}
                    </Label>
                  </div>
                </div>

                {businessHours[day.id]?.isOpen ? (
                  <div className="flex items-center gap-2 w-full sm:w-2/3">
                    <div className="w-1/2">
                      <Label htmlFor={`${day.id}-open`} className="text-sm mb-1 block">
                        Apertura
                      </Label>
                      <Select
                        value={businessHours[day.id]?.open}
                        onValueChange={(value) => handleChangeHours(day.id, "open", value)}
                      >
                        <SelectTrigger id={`${day.id}-open`}>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={`${day.id}-open-${hour.value}`} value={hour.value}>
                              {hour.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor={`${day.id}-close`} className="text-sm mb-1 block">
                        Cierre
                      </Label>
                      <Select
                        value={businessHours[day.id]?.close}
                        onValueChange={(value) => handleChangeHours(day.id, "close", value)}
                      >
                        <SelectTrigger id={`${day.id}-close`}>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((hour) => (
                            <SelectItem key={`${day.id}-close-${hour.value}`} value={hour.value}>
                              {hour.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground w-full sm:w-2/3">Cerrado</div>
                )}
              </div>
            ))}
          </div>
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
