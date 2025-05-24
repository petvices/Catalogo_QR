import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const productId = formData.get("productId") as string

    if (!file || !productId) {
      return NextResponse.json({ error: "Archivo o ID de producto no proporcionado" }, { status: 400 })
    }

    // Validar el tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. El tamaño máximo permitido es 5MB." },
        { status: 400 },
      )
    }

    // Validar el tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, WebP y GIF." },
        { status: 400 },
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verificar la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el producto para verificar que pertenece al usuario
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("category_id")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Obtener la categoría para verificar que pertenece al usuario
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("menu_id")
      .eq("id", product.category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Obtener el menú para verificar que pertenece al usuario
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("user_id")
      .eq("id", category.menu_id)
      .single()

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 })
    }

    // Verificar que el menú pertenece al usuario
    if (menu.user_id !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Eliminar la imagen anterior si existe
    const { data: existingProduct } = await supabase.from("products").select("image_url").eq("id", productId).single()

    if (existingProduct?.image_url) {
      // Extraer el path del archivo de la URL
      const urlParts = existingProduct.image_url.split("/")
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `products/${fileName}`

      // Eliminar el archivo anterior
      await supabase.storage.from("product-images").remove([filePath])
    }

    // Subir el archivo a Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Obtener la URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    // Actualizar el producto con la URL de la imagen
    const { error: updateError } = await supabase.from("products").update({ image_url: publicUrl }).eq("id", productId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, imageUrl: publicUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
