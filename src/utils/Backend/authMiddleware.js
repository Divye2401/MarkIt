import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function requireAuth(request) {
  //Check Token, Create Supabase Client, getUser from token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return {
      user: null,
      supabase: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  // Create a Supabase client with the user's JWT attached
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return {
      user: null,
      supabase: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      ),
    };
  }
  return { user, supabase, errorResponse: null };
}
