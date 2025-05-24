"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Database } from "@/types/supabase"
import { Loader2, Plus, Trash, Edit, ChevronUp, ChevronDown, Crown, Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

type Category = Database["public"]["Tables"]["categories"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]

interface MenuCategoriesProps {
  menuId: string
  isPremium: boolean
}

export default function MenuCategories({ menuId, isPremium }: MenuCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  // Estados de carga para diferentes acciones
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [movingCategory, setMovingCategory] = useState<string | null>(null)
  const [movingProduct, setMovingProduct] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form states
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productPrice, setProductPrice] = useState("")
  const [productAvailable, setProductAvailable] = useState(true)
  const [productImage, setProductImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [productDiscount, setProductDiscount] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [menuId])

  const fetchCategories = async () => {
    try {
      setLoading(true)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("menu_id", menuId)
        .order("order")

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      // Fetch products for each category
      const productsRecord: Record<string, Product[]> = {}

      // Usar Promise.all para cargar todos los productos en paralelo
      const productPromises = categoriesData.map(async (category) => {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", category.id)
          .order("order")

        if (productsError) throw productsError
        productsRecord[category.id] = productsData || []
      })

      await Promise.all(productPromises)
      setProducts(productsRecord)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías y productos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    // Verificar límite de categorías
    if (!isPremium && categories.length >= 5) {
      toast({
        title: "Límite alcanzado",
        description: "El plan gratuito permite hasta 5 categorías. Actualiza a Premium para agregar más.",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingCategory(true)
      const newOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 0

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: categoryName,
            description: categoryDescription,
          })
          .eq("id", editingCategory.id)

        if (error) throw error

        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id ? { ...c, name: categoryName, description: categoryDescription } : c,
          ),
        )

        toast({
          title: "Categoría actualizada",
          description: "La categoría ha sido actualizada correctamente.",
        })
      } else {
        // Add new category
        const { data, error } = await supabase
          .from("categories")
          .insert({
            menu_id: menuId,
            name: categoryName,
            description: categoryDescription,
            order: newOrder,
          })
          .select()
          .single()

        if (error) throw error

        setCategories([...categories, data])
        setProducts({ ...products, [data.id]: [] })

        toast({
          title: "Categoría creada",
          description: "La categoría ha sido creada correctamente.",
        })
      }

      setCategoryDialogOpen(false)
      resetCategoryForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría.",
        variant: "destructive",
      })
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría? Se eliminarán todos los productos asociados.")) {
      return
    }

    try {
      setDeletingCategory(categoryId)

      // Delete all products in the category first
      const { error: productsError } = await supabase.from("products").delete().eq("category_id", categoryId)

      if (productsError) throw productsError

      // Then delete the category
      const { error: categoryError } = await supabase.from("categories").delete().eq("id", categoryId)

      if (categoryError) throw categoryError

      // Update local state
      setCategories(categories.filter((c) => c.id !== categoryId))

      const newProducts = { ...products }
      delete newProducts[categoryId]
      setProducts(newProducts)

      toast({
        title: "Categoría eliminada",
        description: "La categoría y sus productos han sido eliminados correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría.",
        variant: "destructive",
      })
    } finally {
      setDeletingCategory(null)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingProduct) return

    try {
      setUploadingImage(true)

      // Mostrar toast de carga
      toast({
        title: "Subiendo imagen",
        description: "Por favor espera mientras se sube la imagen...",
      })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("productId", editingProduct.id)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen")
      }

      // Actualizar la URL de la imagen en el estado local
      setProductImage(data.imageUrl)

      // Actualizar el producto en el estado local
      const updatedProducts = { ...products }
      updatedProducts[selectedCategoryId!] = products[selectedCategoryId!].map((p) =>
        p.id === editingProduct.id ? { ...p, image_url: data.imageUrl } : p,
      )
      setProducts(updatedProducts)

      toast({
        title: "Imagen subida",
        description: "La imagen ha sido subida correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!editingProduct) return

    try {
      setUploadingImage(true)

      // Mostrar toast de carga
      toast({
        title: "Eliminando imagen",
        description: "Por favor espera mientras se elimina la imagen...",
      })

      // Actualizar el producto en la base de datos
      const { error } = await supabase.from("products").update({ image_url: null }).eq("id", editingProduct.id)

      if (error) throw error

      // Actualizar el estado local
      setProductImage(null)

      // Actualizar el producto en el estado local
      const updatedProducts = { ...products }
      updatedProducts[selectedCategoryId!] = products[selectedCategoryId!].map((p) =>
        p.id === editingProduct.id ? { ...p, image_url: null } : p,
      )
      setProducts(updatedProducts)

      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la imagen.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddProduct = async () => {
    if (!selectedCategoryId) return

    // Verificar límite de productos por categoría
    if (!isPremium && selectedCategoryId && products[selectedCategoryId]?.length >= 10) {
      toast({
        title: "Límite alcanzado",
        description: "El plan gratuito permite hasta 10 productos por categoría. Actualiza a Premium para agregar más.",
        variant: "destructive",
      })
      return
    }

    try {
      setSavingProduct(true)
      const price = Number.parseFloat(productPrice)
      if (isNaN(price) || price < 0) {
        throw new Error("El precio debe ser un número válido mayor o igual a cero.")
      }

      const categoryProducts = products[selectedCategoryId] || []
      const newOrder = categoryProducts.length > 0 ? Math.max(...categoryProducts.map((p) => p.order)) + 1 : 0

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: productName,
            description: productDescription,
            price,
            discount_percentage: productDiscount ? parseInt(productDiscount) : null,
            is_available: productAvailable,
          })
          .eq("id", editingProduct.id)

        if (error) throw error

        // Update local state
        const updatedProducts = { ...products }
        updatedProducts[selectedCategoryId] = categoryProducts.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: productName,
                description: productDescription,
                price,
                discount_percentage: productDiscount ? parseInt(productDiscount) : null,
                is_available: productAvailable,
              }
            : p,
        )
        setProducts(updatedProducts)

        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente.",
        })
      } else {
        // Add new product
        const { data, error } = await supabase
          .from("products")
          .insert({
            category_id: selectedCategoryId,
            name: productName,
            description: productDescription,
            price,
            discount_percentage: productDiscount ? parseInt(productDiscount) : null,
            is_available: productAvailable,
            order: newOrder,
          })
          .select()
          .single()

        if (error) throw error

        // Update local state
        const updatedProducts = { ...products }
        updatedProducts[selectedCategoryId] = [...categoryProducts, data]
        setProducts(updatedProducts)

        toast({
          title: "Producto creado",
          description: "El producto ha sido creado correctamente.",
        })
      }

      setProductDialogOpen(false)
      resetProductForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto.",
        variant: "destructive",
      })
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) {
      return
    }

    try {
      setDeletingProduct(productId)

      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      // Update local state
      const updatedProducts = { ...products }
      updatedProducts[categoryId] = products[categoryId].filter((p) => p.id !== productId)
      setProducts(updatedProducts)

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    } finally {
      setDeletingProduct(null)
    }
  }

  const handleMoveCategory = async (categoryId: string, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((c) => c.id === categoryId)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === categories.length - 1)
    ) {
      return
    }

    try {
      setMovingCategory(categoryId)
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      const targetCategory = categories[newIndex]

      // Swap orders in database
      const batch = [
        supabase.from("categories").update({ order: targetCategory.order }).eq("id", categoryId),
        supabase.from("categories").update({ order: categories[currentIndex].order }).eq("id", targetCategory.id),
      ]

      await Promise.all(batch)

      // Update local state immediately for better UX
      const newCategories = [...categories]
      ;[newCategories[currentIndex], newCategories[newIndex]] = [newCategories[newIndex], newCategories[currentIndex]]

      // Update orders to match new positions
      newCategories.forEach((cat, idx) => {
        cat.order = idx
      })

      setCategories(newCategories)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el orden de las categorías.",
        variant: "destructive",
      })
    } finally {
      setMovingCategory(null)
    }
  }

  const handleMoveProduct = async (categoryId: string, productId: string, direction: "up" | "down") => {
    const categoryProducts = products[categoryId] || []
    const currentIndex = categoryProducts.findIndex((p) => p.id === productId)

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === categoryProducts.length - 1)
    ) {
      return
    }

    try {
      setMovingProduct(productId)
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      const targetProduct = categoryProducts[newIndex]

      // Swap orders in database
      const batch = [
        supabase.from("products").update({ order: targetProduct.order }).eq("id", productId),
        supabase.from("products").update({ order: categoryProducts[currentIndex].order }).eq("id", targetProduct.id),
      ]

      await Promise.all(batch)

      // Update local state immediately for better UX
      const newCategoryProducts = [...categoryProducts]
      ;[newCategoryProducts[currentIndex], newCategoryProducts[newIndex]] = [
        newCategoryProducts[newIndex],
        newCategoryProducts[currentIndex],
      ]

      // Update orders to match new positions
      newCategoryProducts.forEach((prod, idx) => {
        prod.order = idx
      })

      const updatedProducts = { ...products }
      updatedProducts[categoryId] = newCategoryProducts
      setProducts(updatedProducts)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el orden de los productos.",
        variant: "destructive",
      })
    } finally {
      setMovingProduct(null)
    }
  }

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryName(category.name)
      setCategoryDescription(category.description || "")
    } else {
      resetCategoryForm()
    }
    setCategoryDialogOpen(true)
  }

  const openProductDialog = (categoryId: string, product?: Product) => {
    setSelectedCategoryId(categoryId)
    if (product) {
      setEditingProduct(product)
      setProductName(product.name)
      setProductDescription(product.description || "")
      setProductPrice(product.price.toString())
      setProductDiscount(product.discount_percentage?.toString() || "")
      setProductAvailable(product.is_available)
      setProductImage(product.image_url || null)
    } else {
      resetProductForm()
    }
    setProductDialogOpen(true)
  }

  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryName("")
    setCategoryDescription("")
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setProductName("")
    setProductDescription("")
    setProductPrice("")
    setProductAvailable(true)
    setProductImage(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Categorías y Productos</h2>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar categoría" : "Agregar categoría"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Modifica los detalles de la categoría" : "Agrega una nueva categoría a tu menú"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nombre de la categoría</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej. Entradas, Platos principales, Postres"
                  required
                  disabled={savingCategory}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Descripción (opcional)</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Breve descripción de la categoría"
                  rows={3}
                  disabled={savingCategory}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)} disabled={savingCategory}>
                Cancelar
              </Button>
              <Button onClick={handleAddCategory} disabled={savingCategory}>
                {savingCategory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategory ? "Guardando..." : "Creando..."}
                  </>
                ) : (
                  <>{editingCategory ? "Guardar cambios" : "Agregar categoría"}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!isPremium && categories.length >= 5 && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center gap-4 py-4">
            <Crown className="h-6 w-6 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium">Límite de categorías alcanzado</p>
              <p className="text-sm text-muted-foreground">
                El plan gratuito permite hasta 5 categorías. Actualiza a Premium para agregar más categorías.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href="/dashboard/premium">Actualizar</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay categorías</CardTitle>
            <CardDescription>Agrega categorías a tu menú para organizar tus productos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Las categorías te permiten organizar tu menú en secciones como Entradas, Platos principales, Postres, etc.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar primera categoría
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-4">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    {category.description && (
                      <span className="text-sm text-muted-foreground hidden md:inline-block">
                        - {category.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {products[category.id]?.length || 0} productos
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCategoryDialog(category)}
                        disabled={deletingCategory === category.id}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategory === category.id}
                      >
                        {deletingCategory === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash className="h-4 w-4 mr-1" />
                        )}
                        {deletingCategory === category.id ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveCategory(category.id, "up")}
                        disabled={
                          categories.indexOf(category) === 0 ||
                          movingCategory === category.id ||
                          Boolean(movingCategory)
                        }
                      >
                        {movingCategory === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        <span className="sr-only">Mover arriba</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveCategory(category.id, "down")}
                        disabled={
                          categories.indexOf(category) === categories.length - 1 ||
                          movingCategory === category.id ||
                          Boolean(movingCategory)
                        }
                      >
                        {movingCategory === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Mover abajo</span>
                      </Button>
                    </div>
                  </div>

                  <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openProductDialog(category.id)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Editar producto" : "Agregar producto"}</DialogTitle>
                        <DialogDescription>
                          {editingProduct
                            ? "Modifica los detalles del producto"
                            : "Agrega un nuevo producto a esta categoría"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Nombre del producto</Label>
                          <Input
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Ej. Hamburguesa, Pizza, Ensalada"
                            required
                            disabled={savingProduct}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productDescription">Descripción (opcional)</Label>
                          <Textarea
                            id="productDescription"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Ingredientes o descripción del producto"
                            rows={3}
                            disabled={savingProduct}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productPrice">Precio</Label>
                          <Input
                            id="productPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="0.00"
                            required
                            disabled={savingProduct}
                          />
                        <div className="space-y-2">
                          <Label htmlFor="productDiscount">Descuento (%)</Label>
                          <Input
                            id="productDiscount"
                            type="number"
                            min="0"
                            max="100"
                            value={productDiscount}
                            onChange={(e) => setProductDiscount(e.target.value)}
                            placeholder="Ej: 10"
                            disabled={savingProduct}
                          />
                        </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="productAvailable"
                            checked={productAvailable}
                            onCheckedChange={setProductAvailable}
                            disabled={savingProduct}
                          />
                          <Label htmlFor="productAvailable">Disponible</Label>
                        </div>

                        {/* Sección de carga de imágenes */}
                        <div className="space-y-2">
                          <Label>Imagen del producto (opcional)</Label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={!editingProduct || uploadingImage || savingProduct}
                          />

                          {!editingProduct ? (
                            <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                              Guarda el producto primero para poder añadir una imagen
                            </div>
                          ) : productImage ? (
                            <div className="relative">
                              <img
                                src={productImage || "/placeholder.svg"}
                                alt={productName}
                                className="w-full h-48 object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                                disabled={uploadingImage || savingProduct}
                              >
                                {uploadingImage ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage || savingProduct}
                              className="w-full h-48 flex flex-col items-center justify-center border-dashed"
                            >
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                  <span>Subiendo imagen...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 mb-2" />
                                  <span>Haz clic para subir una imagen</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setProductDialogOpen(false)}
                          disabled={savingProduct || uploadingImage}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddProduct} disabled={savingProduct || uploadingImage}>
                          {savingProduct ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {editingProduct ? "Guardando..." : "Creando..."}
                            </>
                          ) : (
                            <>{editingProduct ? "Guardar cambios" : "Agregar producto"}</>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {products[category.id]?.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      {products[category.id].map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{product.name}</h4>
                                {!product.is_available && (
                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded">
                                    No disponible
                                  </span>
                                )}
                              </div>
                              {product.description && (
                                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                              )}
                              <p className="font-medium mt-1">${product.price.toFixed(2)}</p>

                              {/* Mostrar miniatura de la imagen si existe */}
                              {product.image_url && (
                                <div className="mt-2">
                                  <img
                                    src={product.image_url || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveProduct(category.id, product.id, "up")}
                                disabled={
                                  products[category.id].indexOf(product) === 0 ||
                                  movingProduct === product.id ||
                                  Boolean(movingProduct)
                                }
                              >
                                {movingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )}
                                <span className="sr-only">Mover arriba</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveProduct(category.id, product.id, "down")}
                                disabled={
                                  products[category.id].indexOf(product) === products[category.id].length - 1 ||
                                  movingProduct === product.id ||
                                  Boolean(movingProduct)
                                }
                              >
                                {movingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="sr-only">Mover abajo</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openProductDialog(category.id, product)}
                                disabled={deletingProduct === product.id}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(category.id, product.id)}
                                disabled={deletingProduct === product.id}
                              >
                                {deletingProduct === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {deletingProduct === product.id ? "Eliminando..." : "Eliminar"}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 text-center mt-4">
                      <p className="text-sm text-muted-foreground">No hay productos en esta categoría</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => openProductDialog(category.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar producto
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
