"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Plus, Printer, Check, Share2, Copy } from "lucide-react"
import type { Database } from "@/types/supabase"
import { LoyaltyCardForm } from "./loyalty-card-form"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]
type PointsHistory = Database["public"]["Tables"]["loyalty_points_history"]["Row"]

interface LoyaltyCardDetailProps {
  card: LoyaltyCard
  onUpdate: () => void
  menuId: string
}

export function LoyaltyCardDetail({ card, onUpdate, menuId }: LoyaltyCardDetailProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [pointsToAdd, setPointsToAdd] = useState(1)
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    fetchPointsHistory()
    // Generar URL para compartir
    const baseUrl = window.location.origin
    setShareUrl(`${baseUrl}/loyalty/${card.id}`)
  }, [card.id])

  const fetchPointsHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_points_history")
        .select("*")
        .eq("loyalty_card_id", card.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPointsHistory(data || [])
    } catch (error: any) {
      console.error(error)
    }
  }

  const handleAddPoints = async () => {
    if (pointsToAdd <= 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos 1 punto",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

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

      setPointsToAdd(1)
      setNotes("")
      onUpdate()
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

  const handleResetCard = async () => {
    try {
      setLoading(true)

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

      onUpdate()
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

  const handlePrint = () => {
    window.print()
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Enlace copiado",
      description: "El enlace para compartir ha sido copiado al portapapeles",
    })
  }

  if (isEditing) {
    return (
      <LoyaltyCardForm menuId={menuId} initialData={card} onSuccess={onUpdate} onCancel={() => setIsEditing(false)} />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                {card.customer_name}
                {card.is_completed && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Completada</span>
                )}
              </CardTitle>
              <CardDescription>
                {card.customer_phone || "Sin teléfono"} • {card.customer_email || "Sin email"}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="share">Compartir</TabsTrigger>
              <TabsTrigger value="qr">Código QR</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Progreso</h3>
                <div className="flex space-x-2 mb-4">
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
                    <Button onClick={handleResetCard} disabled={loading}>
                      Reiniciar tarjeta después de entregar premio
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Añadir puntos</CardTitle>
                    <CardDescription>Añade puntos a la tarjeta de fidelización</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAddPoints} disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? "Añadiendo..." : "Añadir puntos"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de puntos</CardTitle>
                  <CardDescription>Registro de todos los puntos añadidos a esta tarjeta</CardDescription>
                </CardHeader>
                <CardContent>
                  {pointsHistory.length > 0 ? (
                    <div className="space-y-4">
                      {pointsHistory.map((entry) => (
                        <div key={entry.id} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">
                              {entry.points_added > 0 ? "+" : ""}
                              {entry.points_added} puntos
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(entry.created_at).toLocaleDateString()}{" "}
                              {new Date(entry.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                          {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No hay registros de puntos para esta tarjeta
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Compartir Tarjeta
                  </CardTitle>
                  <CardDescription>Comparte esta tarjeta con el cliente para que pueda ver su progreso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="share-link">Enlace para compartir</Label>
                    <div className="flex gap-2">
                      <Input id="share-link" value={shareUrl} readOnly className="flex-1" />
                      <Button variant="outline" onClick={handleCopyShareLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Comparte este enlace con {card.customer_name} para que pueda ver su tarjeta de fidelización y su
                      progreso.
                    </p>
                  </div>

                  <div className="flex flex-col items-center pt-4">
                    <Button
                      variant="default"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        // Abrir ventana para compartir si está disponible
                        if (navigator.share) {
                          navigator.share({
                            title: `Tarjeta de Fidelización para ${card.customer_name}`,
                            text: `Aquí puedes ver tu tarjeta de fidelización con ${card.total_points} de ${card.max_points} puntos.`,
                            url: shareUrl,
                          })
                        } else {
                          handleCopyShareLink()
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir Tarjeta
                    </Button>

                    <div className="mt-4 text-center">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`¡Hola ${card.customer_name}! Aquí puedes ver tu tarjeta de fidelización: ${shareUrl}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
                      >
                        Compartir por WhatsApp
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr">
              <Card>
                <CardHeader>
                  <CardTitle>Código QR de la tarjeta</CardTitle>
                  <CardDescription>Escanea este código para añadir puntos a la tarjeta</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/dashboard/menus/${menuId}/loyalty/scan/${card.id}`)}`}
                      alt="QR Code"
                      width={200}
                      height={200}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-bold text-lg">{card.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{card.customer_phone || "Sin teléfono"}</p>
                    <p className="mt-2">
                      <span className="font-medium">{card.total_points}</span> de{" "}
                      <span className="font-medium">{card.max_points}</span> puntos
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir tarjeta
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
