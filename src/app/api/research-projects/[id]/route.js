import { NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/Backend/authMiddleware";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate AI analysis for research project
async function generateResearchAnalysis(project, bookmarks) {
  if (!bookmarks || bookmarks.length === 0) {
    return {
      progress: {
        totalSources: 0,
        requiredSources: project.required_sources || 10,
      },
      gaps: ["No bookmarks added yet - start by adding some sources"],
      recommendations: ["Add bookmarks to begin research analysis"],
      sourcesBreakdown: { primary: 0, secondary: 0, recent: 0 },
      argumentBalance: { supporting: 0, opposing: 0, neutral: 0 },
    };
  }

  // Prepare bookmark summaries for AI
  const bookmarkSummaries = bookmarks.map((b) => ({
    title: b.title,
    summary: b.summary,
    bigger_summary: b.bigger_summary,
    tags: b.tags,
    url: b.url,
  }));

  const prompt = `
Research Project Analysis:
Thesis: "${project.thesis_statement}"
Subject: ${project.subject_area || "General"}
Required Sources: ${project.required_sources || 10}
Current Sources: ${bookmarks.length}

Bookmarks:
${bookmarkSummaries
  .map(
    (b, i) => `
${i + 1}. ${b.title}
   Summary: ${b.summary || "No summary"}
   Bigger Summary: ${b.bigger_summary || "No detailed summary"}
   Notes: ${b.notes || "No notes"}
   Tags: ${b.tags?.join(", ") || "None"}
   URL: ${b.url}
`
  )
  .join("\n")}

Provide a detailed comprehensive research analysis with extensive explanations:
1. Detailed progress assessment and quality evaluation
2. Specific research gaps and missing elements  
3. Strategic research plan with prioritized next steps
4. Argument analysis and source credibility
5. Timeline recommendations based on due date
6. Citation and methodology suggestions

IMPORTANT: Make each text field very detailed and comprehensive (6-8 lines minimum). Provide thorough explanations, specific reasoning, and actionable insights for all recommendations, gaps, strengths, and plan items.

Respond with valid JSON in this format:
{
  "progress": {
    "totalSources": ${bookmarks.length},
    "requiredSources": ${project.required_sources || 10},
    "completionPercentage": number,
    "qualityScore": number (1-100),
    "readinessLevel": "string (early/developing/advanced/ready)"
  },
  "sourcesBreakdown": {
    "recent": number (sources from 2022+),
    "primary": number (estimate of primary sources),
    "secondary": number (estimate of secondary sources),
    "peerReviewed": number (estimate),
    "credibilityScore": number (1-100)
  },
  "argumentAnalysis": {
    "supporting": number (sources that support thesis),
    "opposing": number (sources that oppose/challenge thesis),
    "neutral": number (neutral/background sources),
    "strongestSupport": "string (6-8 lines describing best supporting evidence with detailed analysis)",
    "weakestPoint": "string (6-8 lines describing argument weakness with specific examples)",
    "counterArgumentStrength": "string (weak/moderate/strong with 4-5 lines explanation)"
  },
  "researchPlan": {
    "immediateNext": [
      "detailed action 1 with 6-8 lines explaining what, why, and how",
      "detailed action 2 with 6-8 lines explaining what, why, and how"
    ],
    "shortTerm": [
      "detailed 1-2 week goal 1 with comprehensive explanation",
      "detailed 1-2 week goal 2 with comprehensive explanation"
    ],
    "longTerm": [
      "detailed remaining research goal 1 with thorough reasoning",
      "detailed remaining research goal 2 with thorough reasoning"
    ],
    "searchTerms": [
      "suggested search term 1",
      "suggested search term 2"
    ]
  },
  "gaps": {
    "critical": [
      "detailed critical missing element 1 with 6-8 lines explaining why it's critical and how to address it",
      "detailed critical missing element 2 with 6-8 lines explaining why it's critical and how to address it"
    ],
    "important": [
      "detailed important gap 1 with comprehensive explanation of impact and solutions",
      "detailed important gap 2 with comprehensive explanation of impact and solutions"
    ],
    "nice-to-have": [
      "detailed additional element 1 with thorough reasoning for inclusion",
      "detailed additional element 2 with thorough reasoning for inclusion"
    ]
  },
  "methodology": {
    "suggestedApproach": "detailed string (6-8 lines) describing research methodology with specific steps and reasoning",
    "citationStyle": "string (APA/MLA/Chicago based on subject with 3-4 lines explanation of why this style fits)",
    "organizationTips": [
      "detailed organization tip 1 with comprehensive explanation of implementation",
      "detailed organization tip 2 with comprehensive explanation of implementation"
    ]
  },
  "timeline": {
    "urgency": "string (low/medium/high with 4-5 lines explaining timeline pressure and recommendations)",
    "weeklyGoals": [
      "detailed week 1 goal with comprehensive breakdown of tasks and expected outcomes",
      "detailed week 2 goal with comprehensive breakdown of tasks and expected outcomes"
    ],
    "milestones": [
      "detailed milestone 1 with thorough explanation of significance and completion criteria",
      "detailed milestone 2 with thorough explanation of significance and completion criteria"
    ]
  },
  "strengths": [
    "detailed current strength 1 with 6-8 lines explaining why it's strong and how to leverage it",
    "detailed current strength 2 with 6-8 lines explaining why it's strong and how to leverage it"
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert research advisor who analyzes academic research collections . Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const analysisContent = response.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(analysisContent);

    // Add metadata
    return {
      ...analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        bookmarkCount: bookmarks.length,
        thesisStatement: project.thesis_statement,
      },
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Return fallback analysis
    return {
      progress: {
        totalSources: bookmarks.length,
        requiredSources: project.required_sources || 10,
        completionPercentage: Math.round(
          (bookmarks.length / (project.required_sources || 10)) * 100
        ),
        qualityScore: 75,
      },
      gaps: ["Unable to generate detailed analysis - AI service unavailable"],
      recommendations: [
        "Continue adding relevant sources",
        "Review existing sources for quality",
      ],
      sourcesBreakdown: { primary: 0, secondary: bookmarks.length, recent: 0 },
      argumentBalance: {
        supporting: bookmarks.length,
        opposing: 0,
        neutral: 0,
      },
      error: "Analysis generation failed",
    };
  }
}

// Get single research project by ID
export async function GET(request, { params }) {
  try {
    // Auth check
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch single research project (RLS ensures user can only see their own)
    const { data: project, error } = await supabase
      .from("research_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { success: false, error: "Research project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch bookmarks for this research project
    let bookmarks = [];
    if (project.bookmark_ids && project.bookmark_ids.length > 0) {
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from("bookmarks")
        .select(
          "id, title, summary, tags, url, created_at, bigger_summary, user_id, notes"
        )
        .in("id", project.bookmark_ids);

      if (!bookmarkError) {
        bookmarks = bookmarkData || [];
      }
    }

    // Generate AI analysis if bookmarks exist
    let analysis = null;
    if (bookmarks.length > 0) {
      try {
        analysis = await generateResearchAnalysis(project, bookmarks);
      } catch (analysisError) {
        console.error("Analysis generation failed:", analysisError);
        // Continue without analysis rather than failing the whole request
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        bookmarks,
        analysis,
      },
    });
  } catch (error) {
    console.error("Research project fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update research project
export async function PUT(request, { params }) {
  try {
    // Auth check
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    const { user_id, created_at, ...allowedUpdates } = updateData;

    // Update research project (RLS ensures user can only update their own)
    const { data: updated, error } = await supabase
      .from("research_projects")
      .update(allowedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Research project not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: updated,
    });
  } catch (error) {
    console.error("Research project update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete research project
export async function DELETE(request, { params }) {
  try {
    // Auth check
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Delete research project (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from("research_projects")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Research project deleted successfully",
    });
  } catch (error) {
    console.error("Research project delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
