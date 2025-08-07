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
    const folderId = body.id;

    if (!email || !folderId) {
      return NextResponse.json(
        { exists: false, error: "No email or folderId provided" },
        { status: 400 }
      );
    }
    //------------------------------- Get all users

    const result = await supabaseAdmin.auth.admin.listUsers();
    if (result.error) {
      return NextResponse.json(
        { exists: false, error: result.error.message },
        { status: 500 }
      );
    }

    //------------------------------- Check if the user exists
    let found = false;
    let userId = null;
    for (let i = 0; i < result.data.users.length; i++) {
      if (result.data.users[i].email === email) {
        found = true;
        userId = result.data.users[i].id;
        break;
      }
    }

    //------------------------------- Changing all bookmarks in the folder to shared with the new user
    if (found && userId) {
      // Send email

      await sendEmailToUser(email, folderId, "folder");

      // Fetch the bookmark ids in the folder

      const bookmarkdata = await supabaseAdmin
        .from("folders")
        .select("bookmark_ids")
        .eq("id", folderId);
      if (bookmarkdata.error) {
        return NextResponse.json(
          { exists: true, emailSent: true, error: bookmarkdata.error.message },
          { status: 500 }
        );
      }

      let bookmarkIds = bookmarkdata.data[0].bookmark_ids;

      for (let i = 0; i < bookmarkIds.length; i++) {
        const bookmarkId = bookmarkIds[i];
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
      }

      //------------------------------- Adding the user to the folder

      const updateFolder = await supabaseAdmin
        .from("folders")
        .select("user_ids")
        .eq("id", folderId);
      if (updateFolder.error) {
        return NextResponse.json({
          exists: true,
          emailSent: true,
          bookkmarupdated: true,
          error: updateFolder.error.message,
        });
      }

      let userIds = updateFolder.data[0].user_ids;

      if (!Array.isArray(userIds)) {
        userIds = [];
      }
      if (userIds.indexOf(userId) === -1) {
        userIds.push(userId);
      }

      const updateRes = await supabaseAdmin
        .from("folders")
        .update({ user_ids: userIds })
        .eq("id", folderId);
      if (updateRes.error) {
        return NextResponse.json(
          { exists: true, emailSent: true, error: updateRes.error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        exists: true,
        emailSent: true,
        bookkmarupdated: true,
        folderupdated: true,
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
