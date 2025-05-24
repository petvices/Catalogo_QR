"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Database } from "@/types/supabase"
import { Loader2, ArrowLeft, Eye, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
type Menu = Database["public"]["Tables"]["menus"]["Row"]

export default function OrdersPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  // Obtener el ID del menú de forma segura
  const menuIdParam = params?.id as string

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [userMenus, setUserMenus] = useState<Menu[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [loadingMenus, setLoadingMenus] = useState(true)

  // Cargar los menús del usuario
  useEffect(() => {
    const fetchUserMenus = async () => {
      if (!user) return

      try {
        setLoadingMenus(true)
        const { data, error } = await supabase
          .from("menus")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching user menus:", error)
          throw error
        }

        console.log("User menus fetched:", data)
        setUserMenus(data || [])

        // Si hay menús y estamos en la ruta con "null", seleccionar el primer menú
        if (data && data.length > 0 && (menuIdParam === "null" || menuIdParam === "undefined")) {
          const firstMenuId = data[0].id
          setSelectedMenuId(firstMenuId)

          // Redirigir a la ruta correcta
          router.replace(`/dashboard/menus/${firstMenuId}/orders`)
        } else if (menuIdParam !== "null" && menuIdParam !== "undefined") {
          setSelectedMenuId(menuIdParam)
        }
      } catch (error) {
        console.error("Error in fetchUserMenus:", error)
      } finally {
        setLoadingMenus(false)
      }
    }

    fetchUserMenus()
  }, [user, supabase, menuIdParam, router])

  // Función para cambiar el menú seleccionado
  const handleMenuChange = (menuId: string) => {
    setSelectedMenuId(menuId)
    router.push(`/dashboard/menus/${menuId}/orders`)
  }

  // Función para cargar las órdenes del menú seleccionado
  const fetchOrders = async () => {
    // Si no hay menú seleccionado, no hacer nada
    if (!selectedMenuId) return

    try {
      setLoading(true)
      setError(null)
      console.log("Fetching orders for menu ID:", selectedMenuId)

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("menu_id", selectedMenuId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        setError("Error al cargar las órdenes: " + error.message)
        throw error
      }

      console.log("Orders fetched successfully:", data)
      setOrders(data || [])
    } catch (error: any) {
      console.error("Error in fetchOrders:", error)
      setError("Error al cargar las órdenes: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Cargar órdenes cuando cambia el menú seleccionado
  useEffect(() => {
    if (selectedMenuId) {
      fetchOrders()
    }
  }, [selectedMenuId])

  // Configurar suscripción en tiempo real
  useEffect(() => {
    if (!selectedMenuId) return

    console.log("Setting up real-time subscription for menu ID:", selectedMenuId)

    // Crear un nombre de canal único basado en el ID del menú
    const channelName = `orders-channel-${selectedMenuId}`
    console.log("Channel name:", channelName)

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `menu_id=eq.${selectedMenuId}`,
        },
        (payload) => {
          console.log("Real-time order update received:", payload)

          // Actualizar la lista de pedidos
          if (payload.eventType === "INSERT") {
            console.log("New order received:", payload.new)
            setOrders((prevOrders) => [payload.new as Order, ...prevOrders])

            toast({
              title: "Nuevo pedido",
              description: "Has recibido un nuevo pedido.",
            })
          } else if (payload.eventType === "UPDATE") {
            console.log("Order updated:", payload.new)
            setOrders((prevOrders) =>
              prevOrders.map((order) => (order.id === payload.new.id ? (payload.new as Order) : order)),
            )
          } else if (payload.eventType === "DELETE") {
            console.log("Order deleted:", payload.old)
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== payload.old.id))
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    // Limpiar la suscripción al desmontar
    return () => {
      console.log("Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [selectedMenuId, supabase, toast])

  // Función para actualizar manualmente
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  const fetchOrderDetails = async (order: Order) => {
    try {
      setSelectedOrder(order)
      setDetailsOpen(true)

      console.log("Fetching order details for order ID:", order.id)
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at")

      if (error) {
        console.error("Error fetching order items:", error)
        throw error
      }

      console.log("Order items fetched:", data)
      setOrderItems(data || [])
    } catch (error: any) {
      console.error("Error in fetchOrderDetails:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido.",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (status: string) => {
    if (!selectedOrder) return

    try {
      setUpdatingStatus(true)
      console.log("Updating order status:", selectedOrder.id, status)

      const { error } = await supabase.from("orders").update({ status }).eq("id", selectedOrder.id)

      if (error) {
        console.error("Error updating order status:", error)
        throw error
      }

      console.log("Order status updated successfully")

      // Actualizar el estado local
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status } : order)))
      setSelectedOrder({ ...selectedOrder, status })

      toast({
        title: "Estado actualizado",
        description: `El pedido ha sido marcado como ${getStatusText(status)}.`,
      })
    } catch (error: any) {
      console.error("Error in updateOrderStatus:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            En proceso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "processing":
        return "En proceso"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "mobile":
        return "Pago móvil"
      case "cash":
        return "Efectivo"
      case "foreign":
        return "Divisas"
      default:
        return method
    }
  }

  const filteredOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab)

  // Si estamos cargando los menús, mostrar un indicador de carga
  if (loadingMenus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando menús...</span>
      </div>
    )
  }

  // Si no hay menús, mostrar un mensaje
  if (userMenus.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al dashboard
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">Gestiona los pedidos de tu menú</p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No tienes menús</AlertTitle>
          <AlertDescription>
            No se encontraron menús asociados a tu cuenta. Crea un menú primero para poder gestionar pedidos.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard/menus/create")}>Crear menú</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button variant="outline" onClick={() => router.push(`/dashboard/menus/${selectedMenuId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al menú
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tu menú</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Selector de menú */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar menú</CardTitle>
          <CardDescription>Elige el menú para ver sus pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMenuId || ""} onValueChange={handleMenuChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar menú" />
            </SelectTrigger>
            <SelectContent>
              {userMenus.map((menu) => (
                <SelectItem key={menu.id} value={menu.id}>
                  {menu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="processing">En proceso</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay pedidos</CardTitle>
            <CardDescription>
              {activeTab === "all"
                ? "Aún no has recibido ningún pedido."
                : `No hay pedidos con estado "${getStatusText(activeTab)}".`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Los pedidos aparecerán aquí automáticamente cuando los clientes realicen un pedido desde tu menú.
            </p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Comprobar nuevos pedidos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de pedidos</CardTitle>
            <CardDescription>
              {activeTab === "all"
                ? `Mostrando todos los pedidos (${filteredOrders.length})`
                : `Mostrando pedidos ${getStatusText(activeTab)} (${filteredOrders.length})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentMethodText(order.payment_method)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => fetchOrderDetails(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del pedido</DialogTitle>
            <DialogDescription>
              Pedido #{selectedOrder?.id.substring(0, 8).toUpperCase()} -{" "}
              {new Date(selectedOrder?.created_at || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Información del cliente</h3>
              <div className="space-y-1">
                <p>Nombre: {selectedOrder?.customer_name}</p>
                {selectedOrder?.customer_phone && <p>Teléfono: {selectedOrder.customer_phone}</p>}
                {selectedOrder?.customer_email && <p>Email: {selectedOrder.customer_email}</p>}
                {selectedOrder?.table_number && <p>Mesa: {selectedOrder.table_number}</p>}
              </div>

              <h3 className="font-medium mt-4 mb-2">Método de pago</h3>
              <p>{getPaymentMethodText(selectedOrder?.payment_method || "")}</p>

              {selectedOrder?.payment_method === "mobile" && selectedOrder?.payment_proof_url && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Comprobante de pago</h3>
                  <a href={selectedOrder.payment_proof_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedOrder.payment_proof_url || "/placeholder.svg"}
                      alt="Comprobante de pago"
                      className="w-full max-h-40 object-cover rounded-md"
                    />
                  </a>
                </div>
              )}

              {selectedOrder?.notes && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Notas adicionales</h3>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Productos</h3>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p>
                        {item.quantity} x {item.product_name}
                      </p>
                      {item.notes && <p className="text-xs text-muted-foreground italic">Nota: {item.notes}</p>}
                    </div>
                    <p className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${selectedOrder?.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Estado del pedido</h3>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedOrder?.status || "pending")}
                  <Select value={selectedOrder?.status} onValueChange={updateOrderStatus} disabled={updatingStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="processing">En proceso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => updateOrderStatus("completed")}
                disabled={updatingStatus || selectedOrder?.status === "completed"}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar
              </Button>
              <Button
                variant="outline"
                onClick={() => updateOrderStatus("cancelled")}
                disabled={updatingStatus || selectedOrder?.status === "cancelled"}
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
