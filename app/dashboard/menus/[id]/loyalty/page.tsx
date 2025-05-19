"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Search, Plus, RefreshCw } from "lucide-react"
import type { Database } from "@/types/supabase"
import { LoyaltyCardForm } from "@/components/loyalty/loyalty-card-form"
import { LoyaltyCardList } from "@/components/loyalty/loyalty-card-list"
import { LoyaltyCardDetail } from "@/components/loyalty/loyalty-card-detail"

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"]
type Order = Database["public"]["Tables"]["orders"]["Row"]

export default function LoyaltyPage() {
  const { id: menuId } = useParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("cards")

  useEffect(() => {
    fetchLoyaltyCards()
    fetchRecentOrders()
  }, [menuId])

  const fetchLoyaltyCards = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("menu_id", menuId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLoyaltyCards(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las tarjetas de fidelización",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("menu_id", menuId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentOrders(data || [])
    } catch (error: any) {
      console.error(error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchLoyaltyCards()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("menu_id", menuId)
        .or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLoyaltyCards(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al buscar tarjetas",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setSearchQuery("")
    fetchLoyaltyCards()
    fetchRecentOrders()
  }

  const handleCardSelect = (card: LoyaltyCard) => {
    setSelectedCard(card)
    setActiveTab("detail")
  }

  const handleCreateFromOrder = (order: Order) => {
    setIsCreating(true)
    setActiveTab("create")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Award className="mr-2 h-6 w-6 text-primary" />
            Tarjetas de Fidelización
          </h1>
          <p className="text-muted-foreground">Gestiona las tarjetas de fidelización para tus clientes frecuentes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            onClick={() => {
              setIsCreating(true)
              setActiveTab("create")
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarjeta
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Buscar Tarjetas</CardTitle>
              <CardDescription>Busca por nombre o número de teléfono</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre o teléfono"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total de tarjetas:</span>
                <span className="font-bold">{loyaltyCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarjetas completadas:</span>
                <span className="font-bold">{loyaltyCards.filter((card) => card.is_completed).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarjetas activas:</span>
                <span className="font-bold">{loyaltyCards.filter((card) => !card.is_completed).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="cards">Tarjetas</TabsTrigger>
              <TabsTrigger value="orders">Pedidos Recientes</TabsTrigger>
              {selectedCard && <TabsTrigger value="detail">Detalles</TabsTrigger>}
              {isCreating && <TabsTrigger value="create">Nueva Tarjeta</TabsTrigger>}
            </TabsList>

            <TabsContent value="cards" className="space-y-4">
              <LoyaltyCardList
                cards={loyaltyCards}
                loading={loading}
                onSelect={handleCardSelect}
                onRefresh={fetchLoyaltyCards}
              />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recientes Completados</CardTitle>
                  <CardDescription>Crea tarjetas de fidelización a partir de pedidos recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_phone || "Sin teléfono"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleCreateFromOrder(order)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Tarjeta
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No hay pedidos completados recientes</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {selectedCard && (
              <TabsContent value="detail">
                <LoyaltyCardDetail
                  card={selectedCard}
                  onUpdate={() => {
                    fetchLoyaltyCards()
                    setSelectedCard(null)
                    setActiveTab("cards")
                  }}
                  menuId={menuId as string}
                />
              </TabsContent>
            )}

            {isCreating && (
              <TabsContent value="create">
                <LoyaltyCardForm
                  menuId={menuId as string}
                  initialData={null}
                  onSuccess={() => {
                    fetchLoyaltyCards()
                    setIsCreating(false)
                    setActiveTab("cards")
                  }}
                  onCancel={() => {
                    setIsCreating(false)
                    setActiveTab("cards")
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
