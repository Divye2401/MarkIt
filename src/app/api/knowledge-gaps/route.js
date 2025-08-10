import { NextResponse } from "next/server";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import { OpenAI } from "openai";
import {
  summarizeBookmarks,
  createFingerprint,
  createCacheKeyString,
} from "../../../utils/Backend/magicSaveHelpers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory cache
const knowledgeCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request) {
  try {
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { bookmarkIds } = await request.json();

    // Get all user's bookmarks with tags and summaries
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("tags, summary, title")
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .not("tags", "is", null)
      .in("id", bookmarkIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({
        strengths: [],
        gaps: [],
        recommendations: [],
        message:
          "Save more bookmarks to get personalized knowledge gap analysis!",
      });
    }

    // Create cache key based on bookmark content
    const bookmarkFingerprint = createFingerprint(bookmarks);
    const cacheKeyString = createCacheKeyString(bookmarkFingerprint);
    const cacheKey = user.id + ":" + cacheKeyString;

    // Check cache first
    const cached = knowledgeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(
        "Returning cached knowledge gap analysis--------------------------------"
      );
      return NextResponse.json(cached.data);
    }

    // 1) Collect all tags from every bookmark and some examples (use empty array if no tags)
    const { topTags, exampleBookmarks } = await summarizeBookmarks(bookmarks);
    // Create AI prompt for analysis
    const prompt = `Analyze this person's learning and knowledge areas based on their saved bookmarks:

TOP TOPICS (by frequency):
${topTags.map((t) => `- ${t.tag} (${t.count} bookmarks)`).join("\n")}

SAMPLE CONTENT:
${exampleBookmarks}

Based on this data, provide a knowledge gap analysis. Consider:
1. What are their clear strengths/focus areas?
2. What important complementary skills might they be missing?
3. What gaps could limit their growth in their main areas?
4. What foundational knowledge might be missing?

Respond ONLY with valid JSON in this exact format:
{
  "strengths": ["area1", "area2", "area3"],
  "gaps": [
    {
      "topic": "missing area name",
      "reason": "why this is important for their growth",
      "priority": "high/medium/low",
      "category": "technical|foundational|complementary"
    }
  ],
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2"
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert learning advisor who analyzes knowledge patterns and identifies growth opportunities. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const analysisContent = response.choices[0]?.message?.content || "{}";
      const analysis = JSON.parse(analysisContent);

      // Add metadata
      const result = {
        ...analysis,
        metadata: {
          totalBookmarks: bookmarks.length,
          topTopics: topTags.slice(0, 5),
          analyzedAt: new Date().toISOString(),
        },
      };

      // Cache the result
      knowledgeCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      console.log(
        "Generated new knowledge gap analysis xxxxxxxxxxxxxxxxxxxxxx"
      );
      return NextResponse.json(result);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
      // Fallback response
      return NextResponse.json(
        { error: aiError.message, message: "AI analysis failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Knowledge gaps API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
