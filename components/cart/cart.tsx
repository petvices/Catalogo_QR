"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart, X, Plus, Minus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database } from "@/types/supabase"

type Menu = Database["public"]["Tables"]["menus"]["Row"]

interface CartView {
  menu: Menu;
  menuId: string; 

}

export function Cart({ menuId, menu }: CartView) {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, updateNotes } = useCart()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  

  const handleCheckout = () => {
    setOpen(false)
    router.push(`/menu/${menuId}/checkout`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Botón flotante del carrito */}
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full p-3 bg-primary text-primary-foreground shadow-lg"
          aria-label="Abrir carrito"
          style={{ backgroundColor: menu.banner_color || "#FF0000" }}>

          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Carrito de compra
            {totalItems > 0 && <span className="ml-2 text-sm text-muted-foreground">({totalItems} items)</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mt-1">Añade productos del menú para realizar un pedido</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4">
              <div className="space-y-4 px-1">
                {items.map((item) => (
                  <div key={item.product.id} className="bg-accent/50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className="mt-2">
                      <Textarea
                        placeholder="Notas especiales (opcional)"
                        className="min-h-[60px] text-sm"
                        value={item.notes || ""}
                        onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-auto">
              <Separator />
              <div className="py-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button className="w-full" onClick={handleCheckout}>
                  Proceder al pago
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Seguir comprando
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
