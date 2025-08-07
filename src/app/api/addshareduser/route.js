import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmailToUser } from "@/utils/Backend/emailHelpers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Only use on the server!
);

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email;
    const bookmarkId = body.id;

    if (!email || !bookmarkId) {
      return NextResponse.json(
        { exists: false, error: "No email or bookmarkId provided" },
        { status: 400 }
      );
    }
    // Get all users
    const result = await supabaseAdmin.auth.admin.listUsers();
    if (result.error) {
      return NextResponse.json(
        { exists: false, error: result.error.message },
        { status: 500 }
      );
    }
    let found = false;
    let userId = null;
    for (let i = 0; i < result.data.users.length; i++) {
      if (result.data.users[i].email === email) {
        found = true;
        userId = result.data.users[i].id;
        break;
      }
    }
    if (found && userId) {
      // Send email
      await sendEmailToUser(email, bookmarkId, "bookmark");
      // Fetch the bookmark
      const fetchRes = await supabaseAdmin
        .from("bookmarks")
        .select("shared_with")
        .eq("id", bookmarkId)
        .single();
      if (fetchRes.error) {
        return NextResponse.json(
          { exists: true, emailSent: true, error: fetchRes.error.message },
          { status: 500 }
        );
      }
      let sharedWith = fetchRes.data.shared_with;
      if (!Array.isArray(sharedWith)) {
        sharedWith = [];
      }
      // Add userId if not already present
      if (sharedWith.indexOf(userId) === -1) {
        sharedWith.push(userId);
      }
      const updateRes = await supabaseAdmin
        .from("bookmarks")
        .update({ shared_with: sharedWith })
        .eq("id", bookmarkId);
      if (updateRes.error) {
        return NextResponse.json(
          { exists: true, emailSent: true, error: updateRes.error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({
        exists: true,
        emailSent: true,
        sharedWith: sharedWith,
      });
    } else {
      return NextResponse.json({ exists: false, emailSent: false });
    }
  } catch (err) {
    return NextResponse.json(
      { exists: false, error: err.message },
      { status: 500 }
    );
  }
}
