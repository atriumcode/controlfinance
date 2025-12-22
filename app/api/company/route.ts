import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      cnpj,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      logo_url,
      user_id,
    } = body

    if (!user_id) {
      return NextResponse.json(
        { error: "Usuário não informado" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,               // ✅ BACKEND URL
      process.env.SUPABASE_SERVICE_ROLE_KEY!   // ✅ SERVICE ROLE
    )

    /* =======================
       CRIAR EMPRESA
    ======================= */

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name,
        cnpj,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        logo_url,
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json(
        { error: companyError.message },
        { status: 500 }
      )
    }

    /* =======================
       VINCULAR USUÁRIO À EMPRESA
    ======================= */

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        company_id: company.id,
        role: "admin",
      })
      .eq("id", user_id)

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro interno ao criar empresa" },
      { status: 500 }
    )
  }
}
