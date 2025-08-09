import { NextResponse } from "next/server";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import {
  fetchEmbedding,
  summarizeSearchResultsWithAI,
  extractLinksWithDescriptions,
  fetchGoogleLinks,
} from "@/utils/Backend/magicSaveHelpers";

//-----------------------------------------------------------------------
// Helper: cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

//-----------------------------------------------------------------------
export async function POST(request) {
  try {
    // Auth
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    // Parse body
    const { query, semantic } = await request.json();
    if (!query)
      return NextResponse.json(
        { success: false, error: "Missing query" },
        { status: 400 }
      );

    const queryEmbedding = await fetchEmbedding(query);

    // Fetch bookmarks with embeddings
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("*")
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .not("embedding", "is", null);
    if (error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );

    // Compute similarity
    const results = bookmarks
      .map((b) => ({
        ...b,
        similarity: cosineSimilarity(queryEmbedding, b.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    // Fetch 2 live links from Google
    const googleLinks = await fetchGoogleLinks(query, semantic);

    // Get AI-generated answer, passing googleLinks as suggestedLinks
    const aiAnswer = await summarizeSearchResultsWithAI(
      query,
      results,
      googleLinks
    );

    // Extract links and descriptions from AI answer
    const { ourLinks: aiOurLinks, suggestedLinks } =
      extractLinksWithDescriptions(aiAnswer);

    // Merge title from results into ourLinks
    const ourLinks = aiOurLinks.map((aiLink, i) => ({
      title: results[i]?.title || "",
      url: aiLink.url,
      description: aiLink.description,
    }));

    return NextResponse.json({
      success: true,
      ourLinks,
      suggestedLinks,
    });
  } catch (err) {
    // TODO: Better error handling/logging
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
