"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { ArrowBigDownDash, Check, Crown, LucideArrowUpCircle } from "lucide-react"
import type { Database } from "@/types/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function PremiumPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error
        setProfile(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user, toast])

  const handleUpgrade = async () => {
    if (!user) return

    try {
      setUpgrading(true)

      // Simulación de proceso de pago
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Actualizar el perfil a premium
      const { error } = await supabase.from("profiles").update({ is_premium: true }).eq("id", user.id)

      if (error) throw error

      // Actualizar el estado local
      setProfile((prev) => (prev ? { ...prev, is_premium: true } : null))

      toast({
        title: "¡Actualización exitosa!",
        description: "Tu cuenta ha sido actualizada a Premium. ¡Disfruta de todas las funciones!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo completar la actualización. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Actualizar a Premium</h1>
        <p className="text-muted-foreground">Desbloquea todas las funciones y mejora la experiencia de tus clientes</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle>Plan Gratuito</CardTitle>
            <CardDescription>Para comenzar y probar todas nuestras novedades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">
              $0<span className="text-base font-normal text-muted-foreground">/mes</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>1 menú digital</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Hasta 5 categorías</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Hasta 10 productos por categorías</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Diseños básicos</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Código QR descargable</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled variant="outline" className="w-full">
              Plan actual
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle>Plan Premium</CardTitle>
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <CardDescription>Perfecto para negocios en crecimiento con alto flujo de pedidos</CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">$4.99</span>
                <span className="text-sm line-through text-muted-foreground">$9.99</span>
                <span className="text-base text-muted-foreground">/mes</span>
              </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <LucideArrowUpCircle className="mr-2 h-4 w-4 text-primary" />
                <span>Incluye las funcionalidades del plan Gratis</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Hasta catálogos digitales infinitos</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Categorías ilimitadas</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Productos Ilimitados</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Diseños premium exclusivos</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Personalización avanzada</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Pasarela de pago personalizable</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Sin marca de agua</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Soporte prioritario</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Mantenimiento diario</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {profile?.is_premium ? (
              <Button disabled className="w-full">
                Plan actual
              </Button>
            ) : (
              <Button asChild className="w-full">
                <a
                  href="https://api.whatsapp.com/send?phone=584242670533&text=Estoy%20interesado%20en%20adquirir%20el%20plan%20premium%20de%20Cat%C3%A1logo%20digital.%0AMi%20correo%20resgitrado%20es%3A"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Actualizar ahora
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">¿Qué métodos de pago aceptan?</h3>
            <p className="text-muted-foreground">
              Actualmente contamos con varios metodos de pago como: Paypal, Binance, Pago Móvil, Zinli y Transferencia Bancaria.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">¿Es automática mi compra?</h3>
            <p className="text-muted-foreground">
              No, actualmente tendrás que hablar con uno de nuestros asesores para poder obtener el Catálogo Digital Premium.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">¿Cuando se acaba mi membresia premium?</h3>
            <p className="text-muted-foreground">
              Luego de 30 días su membresia premium será removida si no vuelve a pagar la subscripción, de cualquier forma 5 días antes 
              será avisado de los días restantes de su membresía.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">¿Como puedo volver a comprar mi membresía?</h3>
            <p className="text-muted-foreground">
              Puede comprarla nuevamente con el agente que lo atendío la primera vez, o directamente a nuestro WhatsApp +58 424-2670533.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
