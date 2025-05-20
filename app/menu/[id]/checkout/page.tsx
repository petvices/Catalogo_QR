"use client"

import type React from "react"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CartProvider, useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, ArrowLeft, Upload, X, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]


// Componente interno que usa useCart
function CheckoutContent({ menuId }: { menuId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const { items, totalAmount, clearCart } = useCart()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mobile")
  const [loading, setLoading] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null)
  const [menu, setMenu] = useState<Database["public"]["Tables"]["menus"]["Row"] | null>(null)
  const [loadingMenu, setLoadingMenu] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const getDiscountedPrice = (product: Product): number => {
  const discount = product.discount_percentage || 0
  return product.price * (1 - discount / 100)
  }

  const discountedTotal = items.reduce((total, item) => {
  return total + getDiscountedPrice(item.product) * item.quantity
  }, 0)


  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoadingMenu(true)
        const { data, error } = await supabase.from("menus").select("*").eq("id", menuId).single()

        if (error) throw error
        setMenu(data)
      } catch (error) {
        console.error("Error fetching menu:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del menú.",
          variant: "destructive",
        })
      } finally {
        setLoadingMenu(false)
      }
    }

    fetchMenu()
  }, [menuId, supabase, toast])

  // Si el carrito está vacío, redirigir al menú
  useEffect(() => {
    if (items.length === 0 && !loadingMenu) {
      router.push(`/menu/${menuId}`)
    }
  }, [items.length, loadingMenu, menuId, router])

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingProof(true)
      toast({
        title: "Subiendo comprobante",
        description: "Por favor espera mientras se sube el comprobante de pago...",
      })

      // Validar el tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.")
      }

      // Validar el tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!validTypes.includes(file.type)) {
        throw new Error("Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, WebP y GIF.")
      }

      // Subir el archivo a Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `payment-${menuId}-${Date.now()}.${fileExt}`
      const filePath = `${menuId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Obtener la URL pública del archivo
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath)

      setPaymentProofUrl(publicUrl)

      toast({
        title: "Comprobante subido",
        description: "El comprobante de pago ha sido subido correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el comprobante.",
        variant: "destructive",
      })
    } finally {
      setUploadingProof(false)
    }
  }

  const handleRemoveProof = () => {
    setPaymentProofUrl(null)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "mobile" && !paymentProofUrl) {
      toast({
        title: "Comprobante requerido",
        description: "Por favor, sube un comprobante de pago móvil.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Crear la orden
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          menu_id: menuId,
          customer_name: customerName,
          customer_phone: customerPhone || null,
          customer_email: customerEmail || null,
          total_amount: discountedTotal,
          status: "pending",
          payment_method: paymentMethod,
          payment_proof_url: paymentProofUrl,
          notes: notes || null,
          table_number: tableNumber || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Crear los items de la orden
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Mostrar toast de éxito
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido realizado correctamente. Gracias por tu compra.",
      })

      // Redirigir a la página de confirmación
      router.push(`/menu/${menuId}/order-confirmation/${order.id}`)

      // Solo limpiar el carrito después de la redirección exitosa
      setTimeout(() => {
        clearCart()
      }, 500)
    } catch (error: any) {
      console.error("Error al procesar el pedido:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo realizar el pedido. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (loadingMenu) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/menu/${menuId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al menú
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Finalizar pedido</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
              <CardDescription>Revisa los productos de tu pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const discountedPrice = getDiscountedPrice(item.product)
                const lineTotal = discountedPrice * item.quantity

                return (
                  <div key={item.product.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {item.quantity} x {item.product.name}
                      </p>
                      {item.product.discount_percentage && (
                        <p className="text-xs text-green-600">
                          {item.product.discount_percentage}% de descuento
                        </p>
                      )}
                      {item.notes && <p className="text-xs text-muted-foreground italic">Nota: {item.notes}</p>}
                    </div>
                    <p className="font-medium">${lineTotal.toFixed(2)}</p>
                  </div>
                )
              })}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${discountedTotal.toFixed(2)}</span>
              </div>

              {menu?.dollar_exchange_rate && menu.dollar_exchange_rate > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total en Bs.s:</span>
                  <span>Bs.s {(discountedTotal * menu.dollar_exchange_rate).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <form onSubmit={handleSubmitOrder}>
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
                <CardDescription>Completa tus datos para finalizar el pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table">Número de mesa (opcional)</Label>
                  <Input
                    id="table"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales, alergias, etc."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Método de pago *</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={loading}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile">Pago móvil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Efectivo (pago en el local)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="foreign" id="foreign" />
                      <Label htmlFor="foreign">Divisas (pago en el local)</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "mobile" && (
                  <>
                    {menu?.payment_mobile_info && (
                      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle>Información de pago móvil</AlertTitle>
                        <AlertDescription className="mt-2 whitespace-pre-line">
                          {menu.payment_mobile_info}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label>Comprobante de pago *</Label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadProof}
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProof || loading}
                      />

                      {paymentProofUrl ? (
                        <div className="relative">
                          <img
                            src={paymentProofUrl || "/placeholder.svg"}
                            alt="Comprobante de pago"
                            className="w-full h-48 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveProof}
                            disabled={uploadingProof || loading}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingProof || loading}
                          className="w-full h-48 flex flex-col items-center justify-center border-dashed"
                          type="button"
                        >
                          {uploadingProof ? (
                            <>
                              <Loader2 className="h-8 w-8 animate-spin mb-2" />
                              <span>Subiendo comprobante...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 mb-2" />
                              <span>Haz clic para subir el comprobante de pago</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {paymentMethod === "foreign" && menu?.dollar_exchange_rate && menu.dollar_exchange_rate > 0 && (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Tasa de cambio</AlertTitle>
                    <AlertDescription className="mt-2">
                      1 USD = Bs.s {menu.dollar_exchange_rate.toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando pedido...
                    </>
                  ) : (
                    "Confirmar pedido"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente principal que envuelve el contenido con CartProvider
export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: menuId } = use(params) // Desestructuración después de usar use()

  return (
    <CartProvider menuId={menuId}>
      <CheckoutContent menuId={menuId} />
    </CartProvider>
  )
}
