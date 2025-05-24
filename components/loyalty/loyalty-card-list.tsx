"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Trash2, Edit } from "lucide-react"
import type { Database } from "@/types/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]

interface LoyaltyCardListProps {
  cards: LoyaltyCard[]
  loading: boolean
  onSelect: (card: LoyaltyCard) => void
  onRefresh: () => void
}

export function LoyaltyCardList({ cards, loading, onSelect, onRefresh }: LoyaltyCardListProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)

      // Primero eliminar el historial de puntos asociado a la tarjeta
      const { error: historyError } = await supabase.from("loyalty_points_history").delete().eq("loyalty_card_id", id)

      if (historyError) {
        console.error("Error al eliminar historial:", historyError)
        // Continuamos con la eliminación de la tarjeta incluso si hay error en el historial
      }

      // Luego eliminar la tarjeta
      const { error } = await supabase.from("loyalty_cards").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Tarjeta eliminada",
        description: "La tarjeta de fidelización ha sido eliminada correctamente",
      })

      onRefresh()
    } catch (error: any) {
      console.error("Error completo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarjeta. " + (error.message || ""),
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/4 mt-1"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay tarjetas</CardTitle>
          <CardDescription>Aún no has creado ninguna tarjeta de fidelización para tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Crea tu primera tarjeta de fidelización para recompensar a tus clientes frecuentes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} className={card.is_completed ? "border-green-500" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  {card.customer_name}
                  {card.is_completed && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Completada</span>
                  )}
                </CardTitle>
                <CardDescription>{card.customer_phone || "Sin teléfono"}</CardDescription>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onSelect(card)}>
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la tarjeta de fidelización de{" "}
                        {card.customer_name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(card.id)} disabled={deletingId === card.id}>
                        {deletingId === card.id ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex space-x-1">
                  {[...Array(card.max_points)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        i < card.total_points ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < card.total_points && <Award className="h-3 w-3" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {card.total_points}/{card.max_points} puntos
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">Premio: </span>
              {card.reward_description}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Creada: {new Date(card.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
