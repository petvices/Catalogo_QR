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

export default async function MenuPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Fetch menu
  const { data: menu, error: menuError } = await supabase.from("menus").select("*").eq("id", params.id).single()

  if (menuError || !menu) {
    notFound()
  }

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menu.id)
    .order("order")

  if (categoriesError) {
    notFound()
  }

  // Fetch products for each category
  const productsPromises = categories.map((category) =>
    supabase.from("products").select("*").eq("category_id", category.id).order("order"),
  )

  const productsResults = await Promise.all(productsPromises)

  // Create a map of category ID to products
  const productsMap: Record<string, Product[]> = {}
  categories.forEach((category, index) => {
    productsMap[category.id] = productsResults[index].data || []
  })

  // Check if the menu is currently open based on business hours
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
