import { NextRequest, NextResponse } from "next/server";

/**
 * Example REST surface for tasks.
 * MVP currently uses client-side localStorage for speed of demo.
 * Replace the body of these handlers with Supabase / Postgres queries
 * and optional Soroban reads for production.
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";
  const category = searchParams.get("category");

  // Production: query DB
  // const tasks = await supabase.from("tasks").select("*").eq("status", status)...

  return NextResponse.json({
    tasks: [],
    message:
      "MVP uses client store. Wire Supabase here for multi-device persistence.",
    filters: { status, category },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate with zod, insert into DB, return created task
    return NextResponse.json({
      success: true,
      task: body,
      message: "Task would be persisted here in production",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
