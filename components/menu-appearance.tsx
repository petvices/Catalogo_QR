"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/types/supabase"
import { Crown, Upload, X, Loader2, ImageIcon, DollarSign, Smartphone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Instagram, Twitter, MapPin, Phone } from "lucide-react"
import { useLoading } from "@/components/loading-overlay"




type Menu = Database["public"]["Tables"]["menus"]["Row"]

interface MenuAppearanceProps {
  menu: Menu
  updateMenu: (updatedMenu: Partial<Menu>) => Promise<void>
  isPremium: boolean
}

export default function MenuAppearance({ menu, updateMenu, isPremium }: MenuAppearanceProps) {
  const [theme, setTheme] = useState(menu.theme)
  const [enableOrdering, setEnableOrdering] = useState(menu.enable_ordering || false)
  const [paymentMobileInfo, setPaymentMobileInfo] = useState(menu.payment_mobile_info || "")
  const [dollarExchangeRate, setDollarExchangeRate] = useState(menu.dollar_exchange_rate?.toString() || "")
  const [loading, setLoading] = useState(false)
  const [uploadingRestaurantImage, setUploadingRestaurantImage] = useState(false)
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false)
  const [restaurantImage, setRestaurantImage] = useState<string | null>(menu.restaurant_image_url)
  const [bannerImage, setBannerImage] = useState<string | null>(menu.banner_image_url)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(menu.logo_url || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(menu.banner_url || null)
  const [bannerColor, setBannerColor] = useState<string>(menu.banner_color || "#3b82f6")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [facebook, setFacebook] = useState<string>(menu.facebook_url || "")
  const [instagram, setInstagram] = useState<string>(menu.instagram_url || "")
  const [twitter, setTwitter] = useState<string>(menu.twitter_url || "")
  const [whatsapp, setWhatsapp] = useState<string>(menu.whatsapp_number || "")
  const [location, setLocation] = useState<string>(menu.location || "")
  const [showCreateMenuButton, setShowCreateMenuButton] = useState<boolean>(menu.show_create_menu_button || false)
  const [activeTab, setActiveTab] = useState("general")
  const [mapLatitude, setMapLatitude] = useState<string>(menu.map_latitude?.toString() || "")
  const [mapLongitude, setMapLongitude] = useState<string>(menu.map_longitude?.toString() || "")


  const restaurantImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

  const { supabase } = useSupabase()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const exchangeRate = parseFloat(dollarExchangeRate) || 0
      
      await updateMenu({
        theme,
        enable_ordering: enableOrdering,
        payment_mobile_info: paymentMobileInfo,
        dollar_exchange_rate: exchangeRate,
        restaurant_image_url: restaurantImage,
        banner_image_url: bannerImage
      })
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) throw error

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)
    return urlData.publicUrl
  }

    const saveMapCoordinates = async () => {
    try {
      startLoading()
      await updateMenu({
        map_latitude: mapLatitude ? Number.parseFloat(mapLatitude) : null,
        map_longitude: mapLongitude ? Number.parseFloat(mapLongitude) : null,
      })
      toast({
        title: "Ubicación actualizada",
        description: "Las coordenadas del mapa han sido actualizadas correctamente.",
      })
    } catch (error) {
      console.error("Error saving map coordinates:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las coordenadas. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    try {
      setUploadingLogo(true)
      const path = `logos/${menu.id}/${Date.now()}-${logoFile.name}`
      const url = await uploadImage(logoFile, path)
      await updateMenu({ logo_url: url })
      toast({
        title: "Logo actualizado",
        description: "El logo ha sido actualizado correctamente.",
      })
    } catch (error: any) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el logo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBannerUpload = async () => {
    if (!bannerFile) return

    try {
      setUploadingBanner(true)
      const path = `banners/${menu.id}/${Date.now()}-${bannerFile.name}`
      const url = await uploadImage(bannerFile, path)
      await updateMenu({ banner_url: url })
      toast({
        title: "Banner actualizado",
        description: "El banner ha sido actualizado correctamente.",
      })
    } catch (error: any) {
      console.error("Error uploading banner:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el banner. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleBannerColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerColor(e.target.value)
  }

  const saveBannerColor = async () => {
    try {
      await updateMenu({ banner_color: bannerColor })
      toast({
        title: "Color actualizado",
        description: "El color del banner ha sido actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error saving banner color:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el color. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const saveSocialMedia = async () => {
    try {
      startLoading()
      await updateMenu({
        facebook_url: facebook,
        instagram_url: instagram,
        twitter_url: twitter,
        whatsapp_number: whatsapp,
        location: location,
        show_create_menu_button: showCreateMenuButton,
      })
      toast({
        title: "Información actualizada",
        description: "La información de contacto ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error saving social media:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  const handleUploadRestaurantImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (mantén el mismo código de handleUploadRestaurantImage)
  }

  const handleRemoveRestaurantImage = async () => {
    // ... (mantén el mismo código de handleRemoveRestaurantImage)
  }

  const handleUploadBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (mantén el mismo código de handleUploadBannerImage)
  }

  const handleRemoveBannerImage = async () => {
    // ... (mantén el mismo código de handleRemoveBannerImage)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Apariencia del menú</CardTitle>
          <CardDescription>Personaliza el aspecto visual de tu menú digital</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="information">Información</TabsTrigger>
              <TabsTrigger value="ordering" disabled={!isPremium}>
                Pedidos
                {!isPremium && <Crown className="ml-1 h-3 w-3 text-yellow-500" />}
              </TabsTrigger>
              <TabsTrigger value="location">Ubicación</TabsTrigger>
            </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Logo y banner</CardTitle>
            <CardDescription>Personaliza la apariencia de tu menú con un logo y un banner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Logo del restaurante</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden border flex items-center justify-center bg-muted">
                    {logoPreview ? (
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin logo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                    <Button onClick={handleLogoUpload} disabled={!logoFile || uploadingLogo} size="sm">
                      {uploadingLogo ? (
                        <>
                          Subiendo...
                        </>
                      ) : (
                        "Subir logo"
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Recomendado: imagen cuadrada de al menos 200x200 píxeles.
                </p>
              </div>

              {isPremium && (
                <div>
                  <Label htmlFor="banner">Banner del menú</Label>
                  <div className="mt-2 flex flex-col gap-4">
                    <div className="h-32 w-full rounded-md overflow-hidden border flex items-center justify-center bg-muted">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview || "/placeholder.svg"}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center"
                          style={{ backgroundColor: bannerColor }}
                        >
                          <span className="text-white text-sm">Vista previa del color</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input id="banner" type="file" accept="image/*" onChange={handleBannerChange} />
                      <Button onClick={handleBannerUpload} disabled={!bannerFile || uploadingBanner} size="sm">
                        {uploadingBanner ? (
                          <>
                            Subiendo...
                          </>
                        ) : (
                          "Subir banner"
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Recomendado: imagen de 1200x300 píxeles.</p>
                  </div>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="show-create-menu">Mostrar botón "Crear menú"</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-create-menu"
                  checked={showCreateMenuButton}
                  onCheckedChange={setShowCreateMenuButton}
                />
                <span className="text-sm text-muted-foreground">{showCreateMenuButton ? "Visible" : "Oculto"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Muestra un botón promocional en la parte inferior del menú para que otros usuarios puedan crear su
                propio menú.
              </p>
            </div>
          </CardContent>

                </div>
                
              )}

              {!isPremium && (
                <div>
                  <Label htmlFor="banner-color">Color del banner</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      id="banner-color"
                      type="color"
                      value={bannerColor}
                      onChange={handleBannerColorChange}
                      className="w-20 h-10 p-1"
                    />
                    <Input type="text" value={bannerColor} onChange={handleBannerColorChange} className="w-32" />
                    <Button onClick={saveBannerColor} size="sm">
                      Guardar color
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Elige un color para el banner de tu menú.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="information">
        <Card>
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
            <CardDescription>Añade enlaces a tus redes sociales y ubicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Facebook className="h-4 w-4" />
                </div>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/turestaurante"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Instagram className="h-4 w-4" />
                </div>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/turestaurante"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Twitter className="h-4 w-4" />
                </div>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/turestaurante"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="whatsapp"
                  placeholder="+584141234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">Incluye el código de país (ej: +58 para Venezuela)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <MapPin className="h-4 w-4" />
                </div>
                <Input
                  id="location"
                  placeholder="Av. Principal, Ciudad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

            <TabsContent value="ordering" className="space-y-6">
              {isPremium ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Habilitar pedidos en línea</h3>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enable-ordering" 
                        checked={enableOrdering} 
                        onCheckedChange={setEnableOrdering} 
                      />
                      <Label htmlFor="enable-ordering">
                        Permitir que los clientes realicen pedidos
                      </Label>
                    </div>
                  </div>

                  {enableOrdering && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Configuración de pago móvil
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="payment-info">Información de pago</Label>
                          <Textarea
                            id="payment-info"
                            value={paymentMobileInfo}
                            onChange={(e) => setPaymentMobileInfo(e.target.value)}
                            placeholder="Ejemplo: Banco: Mercantil\nTipo de cuenta: Corriente\nNúmero: 0102-1234-5678-9101\nTitular: Juan Pérez\nCédula: V-12345678"
                            className="min-h-[120px]"
                          />
                          <p className="text-sm text-muted-foreground">
                            Esta información se mostrará a los clientes cuando seleccionen pago móvil.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Tasa de cambio
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="exchange-rate">Tasa de dólar (Bs.s por $1)</Label>
                          <Input
                            id="exchange-rate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={dollarExchangeRate}
                            onChange={(e) => setDollarExchangeRate(e.target.value)}
                            placeholder="Ej: 35.50"
                          />
                          <p className="text-sm text-muted-foreground">
                            Establece la tasa de cambio actual para mostrar precios en bolívares.
                          </p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-md space-y-2">
                          <p className="text-sm font-medium">Con esta función activada:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                            <li>Los clientes podrán añadir productos a un carrito de compra</li>
                            <li>Podrán realizar pedidos y pagar mediante pago móvil o efectivo</li>
                            <li>Recibirás notificaciones de nuevos pedidos</li>
                            <li>Podrás gestionar los pedidos desde tu panel</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">Función premium</p>
                      <p className="text-sm text-muted-foreground">
                        La funcionalidad de pedidos en línea está disponible solo para usuarios premium.
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <a href="/dashboard/premium">Actualizar</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
                  <TabsContent value="location">
        <Card>
          <CardHeader>
            <CardTitle>Ubicación en el mapa</CardTitle>
            <CardDescription>Configura las coordenadas para mostrar tu ubicación en el mapa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map-latitude">Latitud</Label>
              <Input
                id="map-latitude"
                placeholder="Ej: 10.4806"
                value={mapLatitude}
                onChange={(e) => setMapLatitude(e.target.value)}
                type="number"
                step="any"
              />
              <p className="text-xs text-muted-foreground">Coordenada de latitud (ej: 10.4806)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="map-longitude">Longitud</Label>
              <Input
                id="map-longitude"
                placeholder="Ej: -66.8983"
                value={mapLongitude}
                onChange={(e) => setMapLongitude(e.target.value)}
                type="number"
                step="any"
              />
              <p className="text-xs text-muted-foreground">Coordenada de longitud (ej: -66.8983)</p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Puedes obtener las coordenadas de tu ubicación desde Google Maps:
              </p>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Busca tu ubicación en Google Maps</li>
                <li>Haz clic derecho en el punto exacto</li>
                <li>Selecciona "¿Qué hay aquí?"</li>
                <li>En la tarjeta que aparece, encontrarás las coordenadas (ej: 10.4806, -66.8983)</li>
              </ol>
            </div>

            {mapLatitude && mapLongitude && (
              <div className="mt-4 pt-4 border-t">
                <Label className="mb-2 block">Vista previa del mapa</Label>
                <div className="rounded-lg overflow-hidden border border-gray-200 h-[300px]">
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapLatitude},${mapLongitude}&zoom=16`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
          </Tabs>

          {!isPremium && (
            <Card className="bg-muted/50 mt-6">
              <CardContent className="flex items-center gap-4 py-4">
                <Crown className="h-6 w-6 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium">Desbloquea funciones premium</p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza a Premium para acceder a personalización exclusiva, pedidos en línea, catálogos ilimitados y más.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href="/dashboard/premium">Actualizar</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>


        <CardFooter>
        <Button
          type="submit"
          disabled={loading}
          onClick={() => {
            saveSocialMedia();
            saveMapCoordinates();
          }}
        >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
