"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]
type Menu = Database["public"]["Tables"]["menus"]["Row"]

export default function PublicLoyaltyCardPage() {
  const { cardId } = useParams()
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCardDetails()
  }, [cardId])

  const fetchCardDetails = async () => {
    try {
      setLoading(true)

      // Obtener los detalles de la tarjeta
      const { data: cardData, error: cardError } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("id", cardId)
        .single()

      if (cardError) throw cardError

      if (!cardData) {
        setError("Tarjeta no encontrada")
        setLoading(false)
        return
      }

      setCard(cardData)

      // Obtener los detalles del menú
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .eq("id", cardData.menu_id)
        .single()

      if (menuError) throw menuError

      setMenu(menuData)
    } catch (error: any) {
      console.error(error)
      setError("Error al cargar la tarjeta de fidelización")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
      </div>
    )
  }

  if (error || !card || !menu) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error || "No se pudo cargar la tarjeta de fidelización"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 p-4">
      <div className="container mx-auto max-w-md py-8">
        <Card className="overflow-hidden">
          <div className="bg-primary p-6 text-center text-primary-foreground">
            <h1 className="text-2xl font-bold">{menu.name}</h1>
            <p className="mt-2">Tarjeta de Fidelización</p>
          </div>

          <CardHeader>
            <CardTitle className="text-center">{card.customer_name}</CardTitle>
            <CardDescription className="text-center">{card.customer_phone || "Sin teléfono"}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <h3 className="mb-3 text-lg font-medium">Tu progreso</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[...Array(card.max_points)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      i < card.total_points ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < card.total_points && <Award className="h-5 w-5" />}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center">
                <span className="font-bold">{card.total_points}</span> de{" "}
                <span className="font-bold">{card.max_points}</span> puntos
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-card-foreground">
              <h3 className="mb-2 font-medium">Tu premio:</h3>
              <p>{card.reward_description}</p>

              {card.is_completed && (
                <div className="mt-4 rounded-md bg-green-100 p-3 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <p className="text-center font-medium">
                    ¡Felicidades! Has completado tu tarjeta y puedes reclamar tu premio.
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Muestra esta tarjeta en tu próxima visita para acumular más puntos.</p>
              <p className="mt-1">Tarjeta creada el {new Date(card.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
