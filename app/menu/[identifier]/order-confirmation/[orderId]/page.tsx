"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"]
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
type Menu = Database["public"]["Tables"]["menus"]["Row"]

function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const identifier = typeof params.identifier === "string" ? params.identifier : ""
  const orderId = typeof params.orderId === "string" ? params.orderId : ""
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar menú por ID o SLUG
        const isId = isUUID(identifier)
        const { data: menuData, error: menuError } = await supabase
          .from("menus")
          .select("*")
          .eq(isId ? "id" : "slug", identifier)
          .maybeSingle()

        if (!menuData || menuError) throw menuError || new Error("Menú no encontrado")
        setMenu(menuData)

        // Buscar orden por ID
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (orderError || !orderData) throw orderError || new Error("Pedido no encontrado")
        setOrder(orderData)

        // Obtener ítems de la orden
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at")

        if (itemsError) throw itemsError
        setOrderItems(itemsData || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || "No se pudo cargar la información del pedido.")
      } finally {
        setLoading(false)
      }
    }

    if (identifier && orderId) fetchData()
  }, [identifier, orderId, supabase])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order || !menu) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar la información del pedido</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || "Pedido no encontrado"}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/menu/${identifier}`}>Volver al menú</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/menu/${identifier}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al menú
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-2xl">¡Pedido confirmado!</CardTitle>
          <CardDescription>Tu pedido ha sido recibido y está siendo procesado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">Número de pedido: {order.id.substring(0, 8).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">Fecha: {new Date(order.created_at).toLocaleString()}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Detalles del pedido</h3>
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
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Información de contacto</h3>
            <p>Nombre: {order.customer_name}</p>
            {order.customer_phone && <p>Teléfono: {order.customer_phone}</p>}
            {order.customer_email && <p>Email: {order.customer_email}</p>}
            {order.table_number && <p>Mesa: {order.table_number}</p>}
          </div>

          <div>
            <h3 className="font-medium mb-2">Método de pago</h3>
            <p>
              {order.payment_method === "mobile"
                ? "Pago móvil"
                : order.payment_method === "cash"
                ? "Efectivo (pago en el local)"
                : "Divisas (pago en el local)"}
            </p>
          </div>

          {order.notes && (
            <div>
              <h3 className="font-medium mb-2">Notas adicionales</h3>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Si tienes alguna pregunta sobre tu pedido, por favor contacta directamente con el restaurante.
          </p>
          <Button asChild className="w-full">
            <Link href={`/menu/${identifier}`}>Volver al menú</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
