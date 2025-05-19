import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { referrerId, userId } = await request.json()

    if (!referrerId || !userId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const supabaseAdmin = createRouteHandlerClient(
      {
        cookies,
      },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    )

    // Actualizar el estado del referido a "converted"
    const { error: referralError } = await supabaseAdmin
      .from("referrals")
      .update({ status: "converted", converted_at: new Date().toISOString() })
      .eq("referrer_id", referrerId)
      .eq("referred_id", userId)

    if (referralError) {
      return NextResponse.json({ error: referralError.message }, { status: 400 })
    }

    // Añadir el descuento al referente
    const { error: discountError } = await supabaseAdmin.from("referral_discounts").insert({
      user_id: referrerId,
      amount: 1.0, // $1 de descuento
      status: "active",
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días
    })

    if (discountError) {
      return NextResponse.json({ error: discountError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error al convertir referido:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
