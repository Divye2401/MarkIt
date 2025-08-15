import { NextResponse } from "next/server";
import { requireAuth } from "../../../utils/Backend/authMiddleware";

// Create new research project
export async function POST(request) {
  try {
    // Auth check
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const userId = user.id;

    // Parse request body
    const {
      title,
      description,
      thesis_statement,
      subject_area,
      due_date,
      required_sources,
      selected_bookmarks,
    } = await request.json();

    // Validation
    if (!title || !thesis_statement) {
      return NextResponse.json(
        { success: false, error: "Title and thesis statement are required" },
        { status: 400 }
      );
    }

    // Insert research project
    const { data: inserted, error: insertError } = await supabase
      .from("research_projects")
      .insert([
        {
          user_id: userId,
          title,
          description,
          thesis_statement,
          subject_area,
          due_date: due_date || null,
          required_sources: required_sources || 10,
          bookmark_ids: selected_bookmarks || [],
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
      project: inserted[0],
    });
  } catch (error) {
    console.error("Research project creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get all research projects for user
export async function GET(request) {
  try {
    // Auth check
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    // Fetch user's research projects (RLS handles filtering)
    const { data: projects, error } = await supabase
      .from("research_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Research projects fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
