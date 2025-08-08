import { NextResponse } from "next/server";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import { OpenAI } from "openai";
import { sampleSize } from "lodash";

export async function GET(request) {
  try {
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const folderid = url.searchParams.get("id");

    const { data, error } = await supabase
      .from("folders")
      .select("bookmark_ids")
      .eq("id", folderid);

    if (error || !data) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const bookmarkids = data[0].bookmark_ids;

    const { data: bookmarkdata, error: bookmarkerror } = await supabase
      .from("bookmarks")
      .select("title,url,summary")
      .in("id", bookmarkids);
    if (bookmarkerror || !bookmarkdata) {
      return NextResponse.json(
        { error: "Bookmarks not found" },
        { status: 404 }
      );
    }

    const refinedbookmarkdata = bookmarkdata.map((bookmark) => ({
      title: bookmark.title,
      url: bookmark.url,
      summary: bookmark.summary,
    }));

    const randombookmarks =
      refinedbookmarkdata.length > 5
        ? sampleSize(refinedbookmarkdata, 5)
        : refinedbookmarkdata;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); //Create a new openai instance
    const prompt = `Given these bookmark urls and titles:\n${randombookmarks //Create a prompt for the openai instance
      .map((b, i) => `Value:${b.title} ${b.url}`)
      .join(
        "\n"
      )}\nSummarize the main insights of this folder in 1 paragraph. Also mention a paragraph regarding improvements that can be made in terms of knowledge (what to read next).
    Please answer ONLY in the following JSON format:

{
  insights:["..."],
  improvements:["..."]
}

Do not include any extra commentary outside the JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt },
        {
          role: "system",
          content:
            "You are a helpful assistant for summarizing folder insights.",
        },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });

    const insights = response.choices[0].message.content;

    return NextResponse.json({ insights, success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
