import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import type { Database } from "@/types/supabase"
import MenuView from "@/components/menu-view"

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

const isUUID = (str: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(str)

export default async function MenuPage({ params }: { params: { identifier: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { identifier } = params

  // Buscar menú por id si es UUID, sino por slug
  let query = supabase.from("menus").select("*").limit(1)

  if (isUUID(identifier)) {
    query = query.eq("id", identifier)
  } else {
    query = query.eq("slug", identifier)
  }

  const { data: menu, error: menuError } = await query.single()

  if (menuError || !menu) {
    notFound()
  }

  // Obtener categorías relacionadas
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menu.id)
    .order("order")

  if (categoriesError) {
    notFound()
  }

  // Obtener productos por cada categoría
  const productsPromises = categories.map((category) =>
    supabase.from("products").select("*").eq("category_id", category.id).order("order"),
  )

  const productsResults = await Promise.all(productsPromises)

  // Crear mapa de categoría a productos
  const productsMap: Record<string, Product[]> = {}
  categories.forEach((category, index) => {
    productsMap[category.id] = productsResults[index].data || []
  })

  // Función para verificar si el menú está abierto según horario
  const isCurrentlyOpen = () => {
    const businessHours = menu.business_hours as BusinessHours
    if (!businessHours) return false

    const now = new Date()
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const currentDay = days[now.getDay()]

    const dayHours = businessHours[currentDay]
    if (!dayHours || !dayHours.isOpen) return false

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [openHour, openMinute] = dayHours.open.split(":").map(Number)
    const [closeHour, closeMinute] = dayHours.close.split(":").map(Number)

    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute

    return currentTime >= openTime && currentTime < closeTime
  }

  return <MenuView menu={menu} categories={categories} productsMap={productsMap} isOpen={isCurrentlyOpen()} />
}
