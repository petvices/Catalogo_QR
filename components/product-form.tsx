"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useLoading } from "@/components/loading-overlay"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  categoryId: string
  onProductSaved: () => void
}

export function ProductForm({ open, onOpenChange, product, categoryId, onProductSaved }: ProductFormProps) {
  const [name, setName] = useState(product?.name || "")
  const [description, setDescription] = useState(product?.description || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [isAvailable, setIsAvailable] = useState(product?.is_available !== false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  const [uploading, setUploading] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState(product?.discount_percentage?.toString() || "0")

  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price) {
      toast({
        title: "Error",
        description: "Por favor, completa los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      startLoading()

      let imageUrl = product?.image_url || null

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        const path = `products/${categoryId}/${Date.now()}-${imageFile.name}`
        const { data, error } = await supabase.storage.from("menu-images").upload(path, imageFile, {
          cacheControl: "3600",
          upsert: true,
        })

        if (error) throw error

        const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(path)
        imageUrl = urlData.publicUrl
        setUploading(false)
      }

      const productData = {
        name,
        description,
        price: Number.parseFloat(price),
        is_available: isAvailable,
        image_url: imageUrl,
        discount_percentage: discountPercentage ? Number.parseFloat(discountPercentage) : 0,
      }

      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)
        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert({
          ...productData,
          category_id: categoryId,
        })
        if (error) throw error
      }

      toast({
        title: product ? "Producto actualizado" : "Producto creado",
        description: product
          ? "El producto ha sido actualizado correctamente."
          : "El producto ha sido creado correctamente.",
      })

      onOpenChange(false)
      onProductSaved()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            {product ? "Actualiza los detalles del producto." : "Añade un nuevo producto a esta categoría."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Descuento (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Imagen</Label>
              <div className="flex flex-col gap-2">
                {imagePreview && (
                  <div className="w-full h-40 rounded-md overflow-hidden border flex items-center justify-center bg-muted">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-auto object-cover"
                    />
                  </div>
                )}
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is-available" checked={isAvailable} onCheckedChange={setIsAvailable} />
              <Label htmlFor="is-available">Disponible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              {product ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
