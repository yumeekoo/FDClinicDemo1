import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Use status 303 to redirect from POST handler to GET /login
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 303,
  });
}
