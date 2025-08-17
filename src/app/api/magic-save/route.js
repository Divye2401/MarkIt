import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import {
  fetchPageContent,
  extractPageData,
  refineMainContent,
  detectContentType,
  extractMediaDuration,
  transcribeWithAssemblyAI,
  enrichWithAI,
  fetchEmbedding,
} from "../../../utils/Backend/magicSaveHelpers";

// Helper: fetch embedding from OpenAI

export async function POST(request) {
  try {
    // Use auth middleware
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { url, mediaUrl } = await request.json();
    const userId = user.id;

    // 1. Fetch the content of the URL
    const html = await fetchPageContent(url);

    // 2. Detect content type
    const contentType = detectContentType(url, html);

    // 3. Extract title, description
    const { title, description } = extractPageData(html);

    // 4. Extract duration for audio/video
    let duration = null;
    if (contentType === "video" || contentType === "audio") {
      duration = extractMediaDuration(html);
    }

    // 5. Prepare content for AI based on type
    let contentForAI = "";
    if ((contentType === "video" || contentType === "audio") && mediaUrl) {
      try {
        contentForAI = await transcribeWithAssemblyAI(mediaUrl);
        if (contentForAI.length > 3000)
          contentForAI = contentForAI.slice(0, 3000);
      } catch (e) {
        contentForAI = `${title}\n${description}`;
      }
    } else if (contentType === "video" || contentType === "audio") {
      contentForAI = `${title}\n${description}`;
    } else {
      contentForAI = refineMainContent(html);
      if (contentForAI.length > 3000)
        contentForAI = contentForAI.slice(0, 3000);
    }

    // 6. AI enrichment
    const aiResult = await enrichWithAI({
      content: contentForAI,
      title,
      description,
      contentType,
    });

    // 7. Override readingTime for audio/video if duration is available
    if ((contentType === "video" || contentType === "audio") && duration) {
      aiResult.readingTime = duration;
    }

    // 8. Generate embedding for the bookmark
    const embedding = await fetchEmbedding(contentForAI);

    // 9. Set the user's JWT for RLS at client creation
    // const supabase = supabase; // This line is removed

    // 10. Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from("bookmarks")
      .insert([
        {
          user_id: userId,
          url,
          title,
          summary: aiResult.summary,
          tags: aiResult.tags,
          bigger_summary: aiResult.biggerSummary,
          content_type: aiResult.contentType,
          reading_time: aiResult.readingTime,
          shared_with: [],
          embedding,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    console.log("Inserted bookmark:", inserted);
    return NextResponse.json({
      success: true,
      bookmark: inserted?.[0] || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    // Use auth middleware
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const {
      id,
      title,
      summary,
      reading_time,
      url,
      tags,
      is_favorite,
      thumbnail_url,
      bigger_summary,
      notes,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing bookmark id" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("bookmarks")
      .update({
        title,
        summary,
        reading_time,
        url,
        tags,
        is_favorite,
        thumbnail_url,
        notes,
        bigger_summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .select();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Updated bookmark:", updated);
    return NextResponse.json({ success: true, bookmark: updated?.[0] || null });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    // const supabase = supabase; // This line is removed

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing bookmark id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
