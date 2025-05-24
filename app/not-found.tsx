"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"

export default function NotFound() {
  return (

    <div className="flex flex-col mt-12 items-center justify-center min-h-screen px-4 bg-gradient-to-br from-white to-slate-100 text-center">
      <main className="flex-1">
      {/* Ilustración SVG moderna */}
      <div className="max-w-md mb-6">
        <svg
          viewBox="0 0 700 500"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M614 368c0 64.8-103.7 117.4-231.6 117.4S150.8 432.8 150.8 368c0-34.3 30.1-65.3 77.6-87.4C205.1 255 172 212.4 172 163.2 172 81.3 258.6 14 366.8 14S562 81.3 562 163.2c0 49.2-33.1 91.8-56.4 117.4 47.5 22.1 77.6 53.1 77.6 87.4z"
            fill="#f3f4f6"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="120"
            fill="#94a3b8"
            fontWeight="bold"
          >
            404
          </text>
        </svg>
      </div>

      <h1 className="text-4xl font-bold text-gray-800">Página no encontrada</h1>
      <p className="mt-3 text-gray-600 max-w-md">
        Lo sentimos, la página que estás buscando no existe o fue eliminada. Es posible que la URL esté mal escrita o que el contenido ya no esté disponible.
      </p>

      <Button asChild className="mt-8 px-6 py-3 text-base">
        <Link href="/">Volver al inicio</Link>
      </Button>

      {/* Extras opcionales */}
      <p className="mt-4 text-sm text-muted-foreground">
        Código de error: <code className="bg-gray-200 px-1 rounded">404</code>
      </p>

      </main>
  </div>
    
  )
  
}
