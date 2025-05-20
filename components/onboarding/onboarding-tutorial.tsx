"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Check, ChevronRight, MapPin, Facebook, Instagram, Twitter, Phone } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Crown } from "lucide-react"


interface OnboardingTutorialProps {
  onComplete: () => void
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  // Menu data
  const [menuData, setMenuData] = useState({
    name: "",
    description: "",
    theme: "default",
    restaurantName: "",
    location: "",
    phone: "",
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
    enableOrdering: false,
    bannerColor: "#f97316", // Default orange color
    showCreateButton: true,
  })

  // Categories and products
  const [categories, setCategories] = useState([
    { name: "Entradas", description: "" },
    { name: "Platos principales", description: "" },
    { name: "Postres", description: "" },
  ])

  const [products, setProducts] = useState([
    { name: "Producto de ejemplo 1", description: "Descripción del producto", price: "10.99", categoryIndex: 0 },
    { name: "Producto de ejemplo 2", description: "Descripción del producto", price: "15.99", categoryIndex: 1 },
    { name: "Producto de ejemplo 3", description: "Descripción del producto", price: "8.99", categoryIndex: 2 },
  ])

  useEffect(() => {
    // Update progress based on current step
    const totalSteps = 5
    setProgress((step / totalSteps) * 100)
  }, [step])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMenuData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setMenuData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setMenuData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCategoryChange = (index: number, field: string, value: string) => {
    setCategories((prev) => prev.map((category, i) => (i === index ? { ...category, [field]: value } : category)))
  }

  const handleProductChange = (index: number, field: string, value: string | number) => {
    setProducts((prev) => prev.map((product, i) => (i === index ? { ...product, [field]: value } : product)))
  }

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const createMenu = async () => {
    if (!user) {
      console.error("No user found")
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un menú.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("Creating menu for user:", user.id)

      // Prepare social media JSON
      const socialMedia = {
        facebook: menuData.facebook || null,
        instagram: menuData.instagram || null,
        twitter: menuData.twitter || null,
        whatsapp: menuData.whatsapp || null,
      }

      // 1. Create the menu
      const { data: menuResult, error: menuError } = await supabase
        .from("menus")
        .insert({
          user_id: user.id,
          name: menuData.name,
          description: menuData.description,
          theme: menuData.theme,
          is_active: true,
          enable_ordering: menuData.enableOrdering,
          banner_color: menuData.bannerColor,
          show_create_menu_button: menuData.showCreateButton,
          location: menuData.location,
          social_media: socialMedia,
          business_hours: {
            monday: { open: "09:00", close: "18:00", isOpen: true },
            tuesday: { open: "09:00", close: "18:00", isOpen: true },
            wednesday: { open: "09:00", close: "18:00", isOpen: true },
            thursday: { open: "09:00", close: "18:00", isOpen: true },
            friday: { open: "09:00", close: "18:00", isOpen: true },
            saturday: { open: "10:00", close: "15:00", isOpen: true },
            sunday: { open: "10:00", close: "15:00", isOpen: false },
          },
        })
        .select()
        .single()

      if (menuError) {
        console.error("Error creating menu:", menuError)
        throw menuError
      }

      console.log("Menu created:", menuResult)
      const menuId = menuResult.id

      // 2. Create categories
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i]
        if (!category.name) continue

        console.log(`Creating category ${i + 1}/${categories.length}: ${category.name}`)

        const { data: categoryResult, error: categoryError } = await supabase
          .from("categories")
          .insert({
            menu_id: menuId,
            name: category.name,
            description: category.description,
            order: i,
          })
          .select()
          .single()

        if (categoryError) {
          console.error(`Error creating category ${category.name}:`, categoryError)
          throw categoryError
        }

        console.log("Category created:", categoryResult)

        // 3. Create products for this category
        const categoryProducts = products.filter((p) => p.categoryIndex === i)

        for (let j = 0; j < categoryProducts.length; j++) {
          const product = categoryProducts[j]
          if (!product.name) continue

          console.log(`Creating product ${j + 1}/${categoryProducts.length}: ${product.name}`)

          const { error: productError } = await supabase.from("products").insert({
            category_id: categoryResult.id,
            name: product.name,
            description: product.description,
            price: Number.parseFloat(product.price as string),
            is_available: true,
            order: j,
          })

          if (productError) {
            console.error(`Error creating product ${product.name}:`, productError)
            throw productError
          }
        }
      }

      // Update user's onboarding status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id)

      if (profileError) {
        console.error("Error updating profile:", profileError)
        // No lanzamos error aquí para no interrumpir el flujo
      }

      toast({
        title: "¡Menú creado con éxito!",
        description: "Tu menú digital ha sido creado. Ahora puedes personalizarlo aún más.",
      })

      // Redirect to the menu page
      router.push(`/dashboard/menus/${menuId}`)
      onComplete()
    } catch (error: any) {
      console.error("Error creating menu:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el menú. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">¡Bienvenido a catálogo digital!</CardTitle>
              <CardDescription>
                Vamos a crear tu primer catálogo en unos pocos pasos. Comencemos con la información básica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Nombre de tu negocio</Label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  value={menuData.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Ej. Café Delicioso"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de tú catálogo digital</Label>
                <Input
                  id="name"
                  name="name"
                  value={menuData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Catálogo Principal, Carta de Vinos, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={menuData.description}
                  onChange={handleInputChange}
                  placeholder="Breve descripción de tu menú"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select
                  name="theme"
                  value={menuData.theme}
                  onValueChange={(value) => handleSelectChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Predeterminado</SelectItem>
                    <SelectItem value="elegant">Elegante</SelectItem>
                    <SelectItem value="modern">Moderno</SelectItem>
                    <SelectItem value="rustic">Rústico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" disabled>
                Anterior
              </Button>
              <Button onClick={nextStep} disabled={!menuData.restaurantName || !menuData.name}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 2:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Información de contacto</CardTitle>
              <CardDescription>
                Añade información de contacto para que tus clientes puedan encontrarte fácilmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    value={menuData.location}
                    onChange={handleInputChange}
                    placeholder="Ej. Calle Principal 123, Ciudad"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={menuData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej. +58 412 1234567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Redes sociales (opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="facebook"
                      value={menuData.facebook}
                      onChange={handleInputChange}
                      placeholder="URL de Facebook"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="instagram"
                      value={menuData.instagram}
                      onChange={handleInputChange}
                      placeholder="URL de Instagram"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="twitter"
                      value={menuData.twitter}
                      onChange={handleInputChange}
                      placeholder="URL de Twitter"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="whatsapp"
                      value={menuData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="Número de WhatsApp"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Anterior
              </Button>
              <Button onClick={nextStep}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 3:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Categorías del menú</CardTitle>
              <CardDescription>
                Añade 3 categorías principales de tu menú. (Podrás modificarlas más tarde).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor={`category-${index}`}>Nombre de la categoría</Label>
                    <Input
                      id={`category-${index}`}
                      value={category.name}
                      onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                      placeholder="Ej. Entradas, Platos principales, Postres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-desc-${index}`}>Descripción (opcional)</Label>
                    <Textarea
                      id={`category-desc-${index}`}
                      value={category.description}
                      onChange={(e) => handleCategoryChange(index, "description", e.target.value)}
                      placeholder="Breve descripción de esta categoría"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setCategories([...categories, { name: "", description: "" }])}
                className="w-full"
              >
                Añadir otra categoría
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Anterior
              </Button>
              <Button onClick={nextStep} disabled={categories.some((c) => !c.name)}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 4:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Productos de ejemplo</CardTitle>
              <CardDescription>
                Añade algunos productos de ejemplo a tu menú. (Podrás añadir y editar más productos después)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor={`product-${index}`}>Nombre del producto</Label>
                    <Input
                      id={`product-${index}`}
                      value={product.name}
                      onChange={(e) => handleProductChange(index, "name", e.target.value)}
                      placeholder="Ej. Hamburguesa clásica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`product-desc-${index}`}>Descripción</Label>
                    <Textarea
                      id={`product-desc-${index}`}
                      value={product.description}
                      onChange={(e) => handleProductChange(index, "description", e.target.value)}
                      placeholder="Descripción del producto"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`product-price-${index}`}>Precio</Label>
                      <Input
                        id={`product-price-${index}`}
                        value={product.price}
                        onChange={(e) => handleProductChange(index, "price", e.target.value)}
                        placeholder="Ej. 10.99"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`product-category-${index}`}>Categoría</Label>
                      <Select
                        value={product.categoryIndex.toString()}
                        onValueChange={(value) => handleProductChange(index, "categoryIndex", Number.parseInt(value))}
                      >
                        <SelectTrigger id={`product-category-${index}`}>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setProducts([
                    ...products,
                    {
                      name: "",
                      description: "",
                      price: "",
                      categoryIndex: 0,
                    },
                  ])
                }
                className="w-full"
              >
                Añadir otro producto
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Anterior
              </Button>
              <Button onClick={nextStep} disabled={products.some((p) => !p.name || !p.price)}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )

      case 5:
        return (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Configuración adicional</CardTitle>
              <CardDescription>Últimos detalles antes de crear tu menú digital.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bannerColor">Color del banner</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="bannerColor"
                    name="bannerColor"
                    type="color"
                    value={menuData.bannerColor}
                    onChange={handleInputChange}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-muted-foreground">Selecciona un color para el banner de tu menú</span>
                </div>
              </div>
            <div className="space-y-4">
              {/* Opción solo para premium */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableOrdering"
                      checked={menuData.enableOrdering}
                      onCheckedChange={(checked) => handleSwitchChange("enableOrdering", checked)}
                      disabled={!user?.is_premium} // Deshabilitar si no es premium
                    />
                    <Label htmlFor="enableOrdering">Habilitar pedidos en línea</Label>
                  </div>
                  {!user?.is_premium && (
                    <Button asChild variant="link" size="sm" className="text-primary">
                      <Link href="/dashboard/premium">
                        <Crown className="h-4 w-4 mr-1" />
                        Actualizar
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Permite que los clientes realicen pedidos directamente desde tu menú digital.
                  {!user?.is_premium && (
                    <span className="text-primary font-medium"> (Función premium)</span>
                  )}
                </p>
              </div>
                
              {/* Segunda opción solo para premium */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showCreateButton"
                      checked={menuData.showCreateButton}
                      onCheckedChange={(checked) => handleSwitchChange("showCreateButton", checked)}
                      disabled={!user?.is_premium} // Deshabilitar si no es premium
                    />
                    <Label htmlFor="showCreateButton">Mostrar botón "Crear menú"</Label>
                  </div>
                  {!user?.is_premium && (
                    <Button asChild variant="link" size="sm" className="text-primary">
                      <Link href="/dashboard/premium">
                        <Crown className="h-4 w-4 mr-1" />
                        Actualizar
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Muestra un botón promocional para que otros puedan crear su propio menú digital.
                  {!user?.is_premium && (
                    <span className="text-primary font-medium"> (Función premium)</span>
                  )}
                </p>
              </div>
            </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Anterior
              </Button>
              <Button onClick={createMenu} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Creando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Crear mi menú
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Creación de tu menú digital</h2>
          <span className="text-sm text-muted-foreground">Paso {step} de 5</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      {renderStep()}
    </div>
  )
}
