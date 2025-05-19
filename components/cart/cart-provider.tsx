"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface CartItem {
  product: Product
  quantity: number
  notes?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, notes?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNotes: (productId: string, notes: string) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
  menuId: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, menuId }: { children: React.ReactNode; menuId: string }) {
  // Validar que el menuId sea válido
  const router = useRouter()

  useEffect(() => {
    if (!menuId || menuId === "null" || menuId === "undefined") {
      console.error("Invalid menu ID detected in CartProvider:", menuId)
      router.push("/")
    }
  }, [menuId, router])
  const [isInitialized, setIsInitialized] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(`cart-${menuId}`)
        if (savedCart) {
          const parsedItems = JSON.parse(savedCart)
          // Validar que los items tengan la estructura correcta
          if (Array.isArray(parsedItems) && parsedItems.every(isValidCartItem)) {
            setItems(parsedItems)
          } else {
            localStorage.removeItem(`cart-${menuId}`)
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        localStorage.removeItem(`cart-${menuId}`)
      } finally {
        setIsInitialized(true)
      }
    }

    loadCart()
  }, [menuId])

  // Función de validación para los items del carrito
  const isValidCartItem = (item: any): item is CartItem => {
    return (
      item && typeof item === "object" && "product" in item && "quantity" in item && typeof item.quantity === "number"
    )
  }

  // Guardar el carrito en localStorage cuando cambia
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(`cart-${menuId}`, JSON.stringify(items))
    }
  }, [items, menuId, isInitialized])

  const addItem = (product: Product, quantity = 1, notes = "") => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id)

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes,
        }
        return updatedItems
      }
      return [...prevItems, { product, quantity, notes }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const updateNotes = (productId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, notes } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    totalItems,
    totalAmount,
    menuId, // Añadimos menuId al contexto para usarlo en useCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
