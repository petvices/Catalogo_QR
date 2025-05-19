import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, Utensils, Clock, Palette, Smartphone, ArrowRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Transforma tus productos con nuestro catálogo digital
                </h1>
                <p className="text-xl text-muted-foreground">
                  Crea, personaliza y actualiza tu catálogo digital en minutos. Mejora la experiencia de tus clientes y
                  ahorra en impresiones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="font-semibold">
                    <Link href="/register">Comenzar gratis</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#benefits">Ver beneficios</Link>
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg transform rotate-3"></div>
                  <div className="absolute inset-0 bg-card border rounded-lg shadow-xl transform -rotate-3 overflow-hidden">
                    <div className="p-6 h-full flex flex-col">
                      <div className="text-2xl font-bold mb-4">Café Delicioso</div>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="bg-muted rounded-md p-3">
                          <div className="font-medium mb-2">Cafés</div>
                          <div className="text-sm text-muted-foreground">8 productos</div>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <div className="font-medium mb-2">Postres</div>
                          <div className="text-sm text-muted-foreground">12 productos</div>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <div className="font-medium mb-2">Desayunos</div>
                          <div className="text-sm text-muted-foreground">6 productos</div>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <div className="font-medium mb-2">Bebidas</div>
                          <div className="text-sm text-muted-foreground">10 productos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Beneficios de un menú QR digital</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre por qué miles de rubros están cambiando a un catálogo digital
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Acceso instantáneo</h3>
                <p className="text-muted-foreground">
                  Tus clientes solo necesitan escanear un código QR para ver tu catálogo actualizado en segundos.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Actualización en tiempo real</h3>
                <p className="text-muted-foreground">
                  Cambia precios, añade platos o actualiza la disponibilidad al instante sin reimprimir menús.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Horarios integrados</h3>
                <p className="text-muted-foreground">
                  Muestra automáticamente si tu negocio está abierto o cerrado según los horarios que configures.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Diseños personalizados</h3>
                <p className="text-muted-foreground">
                  Elige entre múltiples diseños y personaliza los colores para que coincidan con tu marca.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Optimizado para móviles</h3>
                <p className="text-muted-foreground">
                  Tu catálogo digital se verá perfecto en cualquier dispositivo, ofreciendo la mejor experiencia a tus clientes.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Ahorro de costos</h3>
                <p className="text-muted-foreground">
                  Elimina los gastos de impresión y actualización de menús físicos. Comienza gratis y escala según tus
                  necesidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="prices" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes simples y transparentes</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comienza gratis y actualiza cuando necesites más funcionalidades
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card border rounded-lg p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Gratis</h3>
                  <p className="text-muted-foreground">Perfecto para comenzar</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    1 Catálogo digital
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Hasta 5 categorías
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Diseños básicos
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Código QR descargable
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/register">Comenzar gratis</Link>
                </Button>
              </div>

              <div className="bg-card border-2 border-primary rounded-lg p-8 shadow-lg relative">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  Recomendado
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-muted-foreground">Perfecto para negocios en crecimiento con alto flujo de pedidos</p>
                </div>
                <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$4.99</span>
                <span className="text-sm line-through text-muted-foreground">$7.99</span>
                <span className="text-base text-muted-foreground">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Catálogos digitales infinitos
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Categorías ilimitadas
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Diseños premium exclusivos
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Personalización avanzada
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Sin marca de agua
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Pasarela de pagos personalizable
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Mantenimiento diario
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/register">Comenzar ahora</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="create" className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Comienza a digitalizar tu menú hoy mismo</h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Únete a miles de restaurantes que ya están mejorando la experiencia de sus clientes con menús digitales
            </p>
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/register" className="flex items-center">
                Crear mi menú gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
