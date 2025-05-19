"use client"

import { useState, useEffect } from "react"
import type { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ChevronUp, Plus, MenuIcon, MapPin } from "lucide-react"
import { CartProvider, useCart } from "./cart/cart-provider"
import { Cart } from "./cart/cart"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useIsOpen } from "@/hooks/use-is-open"


type Menu = Database["public"]["Tables"]["menus"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type BusinessHours = {
  [day: string]: {
    open: string
    close: string
    isOpen: boolean
  }
}

interface MenuViewProps {
  menu: Menu
  categories: Category[]
  productsMap: Record<string, Product[]>
  isOpen: boolean
}

// Componente para menús con carrito habilitado
function MenuViewWithCart({ menu, categories, productsMap }: MenuViewProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(categories.length > 0 ? categories[0].id : null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")

  const { toast } = useToast()
  const { addItem } = useCart()

  const isOpen = useIsOpen(menu.business_hours as BusinessHours)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openProductDialog = (product: Product) => {
    if (!product.is_available) return
    setSelectedProduct(product)
    setQuantity(1)
    setNotes("")
    setProductDialogOpen(true)
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    addItem(selectedProduct, quantity, notes)

    toast({
      title: "Producto añadido",
      description: `${quantity} x ${selectedProduct.name} añadido al carrito`,
    })

    setProductDialogOpen(false)
    setQuantity(1)
    setNotes("")
  }

  // Función para renderizar los iconos de redes sociales
  const renderSocialIcons = () => {
    const socialLinks = []

    if (menu.facebook_url) {
      socialLinks.push(
        <a
          key="facebook"
          href={menu.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>,
      )
    }

    if (menu.instagram_url) {
      socialLinks.push(
        <a
          key="instagram"
          href={menu.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-800"
          aria-label="Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>,
      )
    }

    if (menu.twitter_url) {
      socialLinks.push(
        <a
          key="twitter"
          href={menu.twitter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-600"
          aria-label="Twitter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </a>,
      )
    }

    if (menu.whatsapp_number) {
      socialLinks.push(
        <a
          key="whatsapp"
          href={`https://wa.me/${menu.whatsapp_number?.replace(/\+/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-700"
          aria-label="WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
          </svg>
        </a>,
      )
    }

    return socialLinks.length > 0 ? (
      <div className="flex items-center justify-center gap-4 mt-2">{socialLinks}</div>
    ) : null
  }

  // Renderizar horarios de negocio
  const renderBusinessHours = () => {
    const businessHours = menu.business_hours as BusinessHours
    if (!businessHours) return null

    const days = [
      { key: "monday", label: "Lunes" },
      { key: "tuesday", label: "Martes" },
      { key: "wednesday", label: "Miércoles" },
      { key: "thursday", label: "Jueves" },
      { key: "friday", label: "Viernes" },
      { key: "saturday", label: "Sábado" },
      { key: "sunday", label: "Domingo" },
    ]

    return (
      <div className="space-y-2">
        {days.map((day) => {
          const dayHours = businessHours[day.key]
          return (
            <div key={day.key} className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="font-medium">{day.label}</span>
              <span>{dayHours && dayHours.isOpen ? `${dayHours.open} - ${dayHours.close}` : "Cerrado"}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar mapa
  const renderMap = () => {
    if (!menu.map_latitude || !menu.map_longitude) {
      return (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Ubicación no disponible</p>
        </div>
      )
    }

    return (
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${menu.map_latitude},${menu.map_longitude}&zoom=16`}
          allowFullScreen
        ></iframe>
        {menu.location && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{menu.location}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium md:hidden">Catálogo Digital</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div
        className="w-full h-40 relative"
        style={{
          backgroundColor: menu.banner_color || "#FF0000",
          backgroundImage: menu.banner_url ? `url(${menu.banner_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Restaurant Logo */}
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
          <img
            src={menu.restaurant_image_url || "/placeholder.svg?height=128&width=128"}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="text-center px-4 mb-6">
        <h1 className="text-2xl font-bold">{menu.name}</h1>

        {menu.location && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{menu.location}</span>
          </div>
        )}

        <div className="flex items-center justify-center mt-2">
          <Dialog open={hoursDialogOpen} onOpenChange={setHoursDialogOpen}>
            <DialogTrigger asChild>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer ${
                  isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{isOpen ? "Abierto ahora" : "Cerrado"}</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Horario de atención</DialogTitle>
                <DialogDescription>Horarios de apertura y cierre</DialogDescription>
              </DialogHeader>
              <div className="mt-4">{renderBusinessHours()}</div>
            </DialogContent>
          </Dialog>
        </div>
        {renderSocialIcons()}

        {menu.description && <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">{menu.description}</p>}
      </div>

      {/* Categories Selector */}
      <div className="px-7 mb-6">
        <Select  onValueChange={(value) => setActiveCategory(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
              
            ))}
          </SelectContent>
        </Select>
        
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 pb-8">
        {activeCategory && (
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              {categories.find((c) => c.id === activeCategory)?.name || "Productos"}
            </h2>
            {categories.find((c) => c.id === activeCategory)?.description && (
              <p className="text-sm text-gray-600">{categories.find((c) => c.id === activeCategory)?.description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {activeCategory &&
            productsMap[activeCategory]?.map((product) => {
              // Calcular precio con descuento
              const originalPrice = product.price
              const discountPercentage = product.discount_percentage || 0
              const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100

              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden ${
                    product.is_available ? "cursor-pointer hover:shadow-md transition-shadow" : "opacity-70"
                  }`}
                  onClick={() => product.is_available && openProductDialog(product)}
                >
                  <div className="relative">
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url || "/placeholder.svg?height=200&width=200"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {discountPercentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">-{discountPercentage}%</Badge>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {discountPercentage > 0 ? (
                          <>
                            <span className="font-bold text-sm">${discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-sm">${originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {product.is_available && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            openProductDialog(product)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 pb-24 mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Ubicación</h2>
          {menu.location && <p className="text-sm text-gray-600">{menu.location}</p>}
        </div>
        {renderMap()}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] max-w-[70vh] overflow-y-auto rounded-lg">
          {selectedProduct && (
            <>
              <div className="relative">
         <DialogClose className="absolute right-3 top-4 z-10 rounded-full bg-white/80 p-1 backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </DialogClose>
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={selectedProduct.image_url || "/placeholder.svg?height=400&width=400"}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>

              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>

                {selectedProduct.description && (
                  <p className="mt-2 text-sm text-gray-700">{selectedProduct.description}</p>
                )}

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <span>-</span>
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <span>+</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas especiales (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Instrucciones especiales, alergias, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sticky bottom-0 bg-transparent p-4">
                  <Button
                    className="w-full py-6 text-base"
                    onClick={handleAddToCart}
                    style={{ backgroundColor: menu.banner_color || "#FF0000" }}
                  >
                    Añadir al carrito ({(selectedProduct.price * quantity).toFixed(2)} $)
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-20 right-4 rounded-full p-3 shadow-md"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          style={{ backgroundColor: menu.banner_color || "#FF0000" }}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Cart button */}
      <Cart menuId={menu.id} menu={menu} />

      {/* Create Menu Button */}
      {menu.show_create_menu_button !== false && (
        <div className="relative bottom-5 left-0 right-0 flex justify-center">
          <a
            href="/"
            className="bg-white text-black border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </svg>
            Crear catálogo digital
          </a>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-gray-600 border-t mt-auto">
        <div className="container mx-auto px-4">
          <p>Catálogo digital creado by Softwans</p>
        </div>
      </footer>
    </div>
  )
}

// Componente para menús sin carrito
function MenuViewWithoutCart({ menu, categories, productsMap, isOpen }: MenuViewProps) {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(categories.length > 0 ? categories[0].id : null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openProductDialog = (product: Product) => {
    if (!product.is_available) return
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }

  // Función para renderizar los iconos de redes sociales
  const renderSocialIcons = () => {
    const socialLinks = []

    if (menu.facebook_url) {
      socialLinks.push(
        <a
          key="facebook"
          href={menu.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>,
      )
    }

    if (menu.instagram_url) {
      socialLinks.push(
        <a
          key="instagram"
          href={menu.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-800"
          aria-label="Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>,
      )
    }

    if (menu.twitter_url) {
      socialLinks.push(
        <a
          key="twitter"
          href={menu.twitter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-600"
          aria-label="Twitter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </a>,
      )
    }

    if (menu.whatsapp_number) {
      socialLinks.push(
        <a
          key="whatsapp"
          href={`https://wa.me/${menu.whatsapp_number?.replace(/\+/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-700"
          aria-label="WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
          </svg>
        </a>,
      )
    }

    return socialLinks.length > 0 ? (
      <div className="flex items-center justify-center gap-4 mt-2">{socialLinks}</div>
    ) : null
  }

  // Renderizar horarios de negocio
  const renderBusinessHours = () => {
    const businessHours = menu.business_hours as BusinessHours
    if (!businessHours) return null

    const days = [
      { key: "monday", label: "Lunes" },
      { key: "tuesday", label: "Martes" },
      { key: "wednesday", label: "Miércoles" },
      { key: "thursday", label: "Jueves" },
      { key: "friday", label: "Viernes" },
      { key: "saturday", label: "Sábado" },
      { key: "sunday", label: "Domingo" },
    ]

    return (
      <div className="space-y-2">
        {days.map((day) => {
          const dayHours = businessHours[day.key]
          return (
            <div key={day.key} className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="font-medium">{day.label}</span>
              <span>{dayHours && dayHours.isOpen ? `${dayHours.open} - ${dayHours.close}` : "Cerrado"}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar mapa
  const renderMap = () => {
    if (!menu.map_latitude || !menu.map_longitude) {
      return (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Ubicación no disponible</p>
        </div>
      )
    }

    return (
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${menu.map_latitude},${menu.map_longitude}&zoom=16`}
          allowFullScreen
        ></iframe>
        {menu.location && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{menu.location}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium md:hidden">Catálogo Digital</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div
        className="w-full h-40 relative"
        style={{
          backgroundColor: menu.banner_color || "#FF0000",
          backgroundImage: menu.banner_url ? `url(${menu.banner_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Restaurant Logo */}
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
          <img
            src={menu.restaurant_image_url || "/placeholder.svg?height=128&width=128"}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="text-center px-4 mb-6">
        <h1 className="text-2xl font-bold">{menu.name}</h1>

        <div className="flex items-center justify-center mt-2">
          <Dialog open={hoursDialogOpen} onOpenChange={setHoursDialogOpen}>
            <DialogTrigger asChild>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer ${
                  isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{isOpen ? "Abierto ahora" : "Cerrado"}</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Horario de atención</DialogTitle>
                <DialogDescription>Horarios de apertura y cierre</DialogDescription>
              </DialogHeader>
              <div className="mt-4">{renderBusinessHours()}</div>
            </DialogContent>
          </Dialog>
        </div>

        {menu.location && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{menu.location}</span>
          </div>
        )}

        {renderSocialIcons()}

        {menu.description && <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">{menu.description}</p>}
      </div>

      {/* Categories Selector */}
      <div className="px-7 mb-6">
        <Select onValueChange={(value) => setActiveCategory(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 pb-8">
        {activeCategory && (
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              {categories.find((c) => c.id === activeCategory)?.name || "Productos"}
            </h2>
            {categories.find((c) => c.id === activeCategory)?.description && (
              <p className="text-sm text-gray-600">{categories.find((c) => c.id === activeCategory)?.description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {activeCategory &&
            productsMap[activeCategory]?.map((product) => {
              // Calcular precio con descuento
              const originalPrice = product.price
              const discountPercentage = product.discount_percentage || 0
              const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100

              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden ${
                    product.is_available ? "cursor-pointer hover:shadow-md transition-shadow" : "opacity-70"
                  }`}
                  onClick={() => product.is_available && openProductDialog(product)}
                >
                  <div className="relative">
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url || "/placeholder.svg?height=200&width=200"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {discountPercentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">-{discountPercentage}%</Badge>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>

                    <div className="mt-1 flex items-center">
                      {discountPercentage > 0 ? (
                        <>
                          <span className="font-bold text-sm">${discountedPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 line-through ml-1">${originalPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-sm">${originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 pb-24 mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Ubicación</h2>
          {menu.location && <p className="text-sm text-gray-600">{menu.location}</p>}
        </div>
        {renderMap()}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <div className="relative">
          <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1 backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </DialogClose>
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={selectedProduct.image_url || "/placeholder.svg?height=400&width=400"}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>

                {selectedProduct.description && (
                  <p className="mt-2 text-sm text-gray-700">{selectedProduct.description}</p>
                )}

                <div className="mt-4">
                  {selectedProduct.discount_percentage ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        $
                        {(
                          selectedProduct.price -
                          (selectedProduct.price * selectedProduct.discount_percentage) / 100
                        ).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">${selectedProduct.price.toFixed(2)}</span>
                      <Badge className="bg-red-500">-{selectedProduct.discount_percentage}%</Badge>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">${selectedProduct.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-20 right-4 rounded-full p-3 shadow-md"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          style={{ backgroundColor: menu.banner_color || "#FF0000" }}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Create Menu Button */}
      {menu.show_create_menu_button !== false && (
        <div className="relative bottom-5 left-0 right-0 flex justify-center">
          <a
            href="/"
            className="bg-white text-black border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </svg>
            Crear catálogo digital
          </a>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-gray-600 border-t mt-auto">
        <div className="container mx-auto px-4">
          <p>Catálogo digital creado by Softwans</p>
        </div>
      </footer>
    </div>
  )
}

export default function MenuView(props: MenuViewProps) {
  // Asegurarnos de que enable_ordering exista y sea true
  const enableOrdering = props.menu.enable_ordering === true

  // Solo mostrar el carrito si el menú tiene habilitada la opción de pedidos
  if (enableOrdering) {
    return (
      <CartProvider menuId={props.menu.id}>
        <MenuViewWithCart {...props} />
      </CartProvider>
    )
  }

  return <MenuViewWithoutCart {...props} />
}
