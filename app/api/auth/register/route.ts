import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.json()
  const { name, email, password, referralCode } = formData

  const supabase = createRouteHandlerClient({ cookies })

  // Registrar al usuario
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        referredBy: referralCode || null,
      },
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (authData.user) {
    // Crear perfil usando service_role (esto evita las restricciones de RLS)
    const supabaseAdmin = createRouteHandlerClient(
      {
        cookies,
      },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    )

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      name,
      is_premium: false,
      referred_by: referralCode || null,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Si hay un código de referido, registrar la relación
    if (referralCode) {
      try {
        const { error: referralError } = await supabaseAdmin.from("referrals").insert({
          referrer_id: referralCode,
          referred_id: authData.user.id,
          status: "pending", // pending, converted, expired
        })

        if (referralError) {
          console.error("Error al registrar referido:", referralError)
        }
      } catch (refError) {
        console.error("Error al procesar referido:", refError)
      }
    }
  }

  return NextResponse.json({ success: true, user: authData.user }, { status: 200 })
}
