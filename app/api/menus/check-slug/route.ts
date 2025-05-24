import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { slug, menuId } = await request.json()

    if (!slug) {
      return NextResponse.json({ available: false, error: "Slug is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el slug ya existe (excluyendo el menú actual si se está editando)
    let query = supabase.from("menus").select("id").eq("slug", slug)

    if (menuId) {
      query = query.neq("id", menuId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("Error checking slug availability:", error)
      return NextResponse.json({ available: false, error: "Database error" }, { status: 500 })
    }

    // Si no se encontró ningún menú con ese slug, está disponible
    const available = !data

    return NextResponse.json({ available })
  } catch (error) {
    console.error("Error in check-slug API:", error)
    return NextResponse.json({ available: false, error: "Internal server error" }, { status: 500 })
  }
}
