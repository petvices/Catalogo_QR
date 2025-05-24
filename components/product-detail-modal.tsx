"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useCart } from "./cart/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type Menu = Database["public"]["Tables"]["menus"]["Row"]

interface ProductDetailModalProps {
  product: Product
  open: boolean
    menu: Menu
  onOpenChange: (open: boolean) => void
}

export function ProductDetailModal({menu, product, open, onOpenChange }: ProductDetailModalProps ) {
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bannerColor, setBannerColor] = useState<string>(menu.banner_color || "#3b82f6")
  const { addItem } = useCart()
  const { toast } = useToast()

  // Calcular precio con descuento
  const originalPrice = product.price
  const discountPercentage = product.discount_percentage || 0
  const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100

  // Simular múltiples imágenes (en realidad solo tenemos una)
  const images = product.image_url ? [product.image_url] : ["/placeholder.svg?height=400&width=400"]

  const handleAddToCart = () => {
    addItem(product, quantity, "")

    toast({
      title: "Producto añadido",
      description: `${quantity} x ${product.name} añadido al carrito`,
    })

    onOpenChange(false)
    setQuantity(1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description || `Mira este producto: ${product.name}`,
        url: window.location.href,
      })
    } else {
      toast({
        title: "Compartir no disponible",
        description: "Tu navegador no soporta la función de compartir.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md mx-auto overflow-hidden rounded-lg">
        <DialogTitle>Prueba</DialogTitle>
        <div className="relative">

          <div className="w-full aspect-square bg-gray-100">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-gray-500">SKU: {product.id.substring(0, 8)}</p>
            </div>
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100" aria-label="Compartir">
              <Share2 className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {product.description && <p className="mt-4 text-gray-700">{product.description}</p>}

          <div className="mt-6 flex items-center">
            {discountPercentage > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">${discountedPrice.toFixed(2)}</span>
                <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  -{discountPercentage}%
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold">${originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={handleAddToCart} className="w-full py-6 text-base"         
                style={{ backgroundColor: menu.banner_color || "#FF0000" }}>
              Añadir al carrito ({quantity} × ${(discountPercentage > 0 ? discountedPrice : originalPrice).toFixed(2)})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
