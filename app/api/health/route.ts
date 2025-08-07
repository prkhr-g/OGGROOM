import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase.rpc('tenants_in_app')

    if (error) throw error

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}