import { NextResponse } from "next/server";
import {
  fetchPageContent,
  extractPageData,
  refineMainContent,
  enrichWithAI,
  detectContentType,
  transcribeWithAssemblyAI,
  extractMediaDuration,
} from "../../../utils/Backend/magicSaveHelpers";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    // Use auth middleware
    const { user, errorResponse } = await requireAuth(request);
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

    // 8. (DB save will be next steps)
    const { readingTime, summary, tags, contentType: aiContentType } = aiResult;

    // Set the user's JWT for RLS at client creation
    const token = request.headers.get("authorization")?.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 9. Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from("bookmarks")
      .insert([
        {
          user_id: userId,
          url,
          title,
          description,
          summary,
          tags,
          content_type: aiContentType,
          reading_time: readingTime,
          duration,
          shared_with: [],
        },
      ])
      .select();
    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

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
