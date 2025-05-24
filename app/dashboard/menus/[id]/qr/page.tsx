"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Database } from "@/types/supabase"
import { Loader2, Download, Share2 } from "lucide-react"
import QRCode from "qrcode"

type Menu = Database["public"]["Tables"]["menus"]["Row"]

export default function MenuQRPage() {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const menuId = params.id as string
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      if (!user || !menuId) return

      try {
        // Fetch menu
        const { data: menuData, error: menuError } = await supabase.from("menus").select("*").eq("id", menuId).single()

        if (menuError) throw menuError

        // Check if the menu belongs to the user
        if (menuData.user_id !== user.id) {
          router.push("/dashboard")
          return
        }

        setMenu(menuData)

        // Generate QR code
        const menuUrl = `${window.location.origin}/menu/${menuId}`
        const qrCode = await QRCode.toDataURL(menuUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        })

        setQrDataUrl(qrCode)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudo cargar el menú. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [supabase, user, menuId, router, toast])

  const handleDownload = () => {
    if (!qrDataUrl) return

    setDownloading(true)

    try {
      const link = document.createElement("a")
      link.href = qrDataUrl
      link.download = `menu-qr-${menu?.name.toLowerCase().replace(/\s+/g, "-")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el código QR.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!menu) return

    const menuUrl = `${window.location.origin}/menu/${menuId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Menú de ${menu.name}`,
          text: `Escanea el código QR para ver el menú de ${menu.name}`,
          url: menuUrl,
        })
      } else {
        await navigator.clipboard.writeText(menuUrl)
        toast({
          title: "Enlace copiado",
          description: "El enlace del menú ha sido copiado al portapapeles.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo compartir el menú.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!menu) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menú no encontrado</CardTitle>
          <CardDescription>
            El menú que estás buscando no existe o no tienes permisos para acceder a él.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard")}>Volver al panel</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Código QR del menú</h1>
        <p className="text-muted-foreground">Comparte tu menú digital con tus clientes mediante este código QR</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Código QR</CardTitle>
            <CardDescription>Los clientes pueden escanear este código para ver tu menú digital</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-sm">
              {qrDataUrl ? (
                <div className="text-center">
                  <div className="mb-4">
                    <img src={qrDataUrl || "/placeholder.svg"} alt="Código QR del menú" className="mx-auto" />
                  </div>
                  <p className="text-black font-medium">{menu.name}</p>
                  <p className="text-gray-500 text-sm">Escanea para ver el menú</p>
                </div>
              ) : (
                <div className="w-[300px] h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={handleDownload} disabled={!qrDataUrl || downloading} className="gap-2">
              <Download className="h-4 w-4" />
              {downloading ? "Descargando..." : "Descargar"}
            </Button>
            <Button onClick={handleShare} disabled={!qrDataUrl} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
            <CardDescription>Cómo utilizar tu código QR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">1. Descarga el código QR</h3>
              <p className="text-sm text-muted-foreground">
                Haz clic en el botón "Descargar" para guardar la imagen del código QR en tu dispositivo.
              </p>
            </div>
            <div>
              <h3 className="font-medium">2. Imprime el código QR</h3>
              <p className="text-sm text-muted-foreground">
                Imprime el código QR y colócalo en lugares visibles de tu negocio, como mesas, entrada, o mostrador.
              </p>
            </div>
            <div>
              <h3 className="font-medium">3. Comparte digitalmente</h3>
              <p className="text-sm text-muted-foreground">
                Puedes compartir el código QR en tus redes sociales o sitio web para que los clientes accedan a tu menú
                antes de visitar tu negocio.
              </p>
            </div>
            <div>
              <h3 className="font-medium">4. Actualiza tu menú</h3>
              <p className="text-sm text-muted-foreground">
                Cualquier cambio que realices en tu menú se actualizará automáticamente. No necesitas generar un nuevo
                código QR.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push(`/dashboard/menus/${menuId}`)}>
              Volver al editor
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
