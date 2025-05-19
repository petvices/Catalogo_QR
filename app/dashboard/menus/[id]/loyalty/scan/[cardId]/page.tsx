"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, redirect } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Plus, ArrowLeft, Check } from "lucide-react"
import type { Database } from "@/types/supabase"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]

export default function ScanCardPage() {
  const { id: menuId, cardId } = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [pointsToAdd, setPointsToAdd] = useState(1)
  const [notes, setNotes] = useState("")
  const [addingPoints, setAddingPoints] = useState(false)

  // Verificar si el menú es premium
  const checkPremiumStatus = async () => {
    try {
      const { data, error } = await supabase.from("menus").select("is_premium").eq("id", menuId).single()

      if (error) throw error

      if (!data?.is_premium) {
        toast({
          title: "Acceso restringido",
          description: "El sistema de fidelización solo está disponible para usuarios premium",
          variant: "destructive",
        })
        redirect(`/dashboard/menus/${menuId}/premium`)
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkPremiumStatus()
    fetchCardDetails()
  }, [cardId, menuId])

  const fetchCardDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("id", cardId)
        .eq("menu_id", menuId)
        .single()

      if (error) throw error
      setCard(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la tarjeta de fidelización",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPoints = async () => {
    if (!card) return

    if (pointsToAdd <= 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos 1 punto",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingPoints(true)

      // Primero, añadir el registro al historial
      const { error: historyError } = await supabase.from("loyalty_points_history").insert({
        loyalty_card_id: card.id,
        points_added: pointsToAdd,
        notes: notes || null,
      })

      if (historyError) throw historyError

      // Luego, actualizar el total de puntos en la tarjeta
      const newTotalPoints = Math.min(card.total_points + pointsToAdd, card.max_points)
      const isNowCompleted = newTotalPoints >= card.max_points

      const { error: updateError } = await supabase
        .from("loyalty_cards")
        .update({
          total_points: newTotalPoints,
          is_completed: isNowCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.id)

      if (updateError) throw updateError

      toast({
        title: "Puntos añadidos",
        description: `Se han añadido ${pointsToAdd} puntos a la tarjeta de ${card.customer_name}`,
      })

      if (isNowCompleted) {
        toast({
          title: "¡Tarjeta completada!",
          description: `${card.customer_name} ha completado su tarjeta y puede reclamar su premio: ${card.reward_description}`,
        })
      }

      // Actualizar la tarjeta en el estado
      setCard({
        ...card,
        total_points: newTotalPoints,
        is_completed: isNowCompleted,
      })

      setPointsToAdd(1)
      setNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setAddingPoints(false)
    }
  }

  const handleResetCard = async () => {
    if (!card) return

    try {
      setAddingPoints(true)

      const { error } = await supabase
        .from("loyalty_cards")
        .update({
          total_points: 0,
          is_completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.id)

      if (error) throw error

      // Añadir entrada al historial
      await supabase.from("loyalty_points_history").insert({
        loyalty_card_id: card.id,
        points_added: -card.total_points,
        notes: "Tarjeta reiniciada después de reclamar premio",
      })

      toast({
        title: "Tarjeta reiniciada",
        description: `La tarjeta de ${card.customer_name} ha sido reiniciada después de reclamar su premio`,
      })

      // Actualizar la tarjeta en el estado
      setCard({
        ...card,
        total_points: 0,
        is_completed: false,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setAddingPoints(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/menus/${menuId}/loyalty`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cargando tarjeta...</CardTitle>
            <CardDescription>Espera un momento mientras cargamos la información</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tarjeta no encontrada</CardTitle>
            <CardDescription>No se pudo encontrar la tarjeta de fidelización solicitada</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4 text-muted-foreground">
              La tarjeta que intentas acceder no existe o no tienes permisos para verla
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a tarjetas
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                {card.customer_name}
                {card.is_completed && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Completada</span>
                )}
              </CardTitle>
              <CardDescription>{card.customer_phone || "Sin teléfono"}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Progreso</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[...Array(card.max_points)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    i < card.total_points ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < card.total_points && <Award className="h-4 w-4" />}
                </div>
              ))}
            </div>
            <p className="text-center text-sm">
              <span className="font-bold">{card.total_points}</span> de{" "}
              <span className="font-bold">{card.max_points}</span> puntos
            </p>
            <p className="text-center text-sm mt-2">
              <span className="font-medium">Premio: </span>
              {card.reward_description}
            </p>
          </div>

          {card.is_completed ? (
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  ¡Tarjeta completada!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {card.customer_name} ha completado su tarjeta y puede reclamar su premio:
                  <span className="font-medium block mt-1">{card.reward_description}</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleResetCard} disabled={addingPoints} className="w-full">
                  Reiniciar tarjeta después de entregar premio
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="points">Puntos a añadir</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max={card.max_points - card.total_points}
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Visita del 15/05/2023"
                />
              </div>
              <Button onClick={handleAddPoints} disabled={addingPoints} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {addingPoints ? "Añadiendo..." : "Añadir puntos"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
