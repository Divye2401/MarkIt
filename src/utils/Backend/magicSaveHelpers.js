import * as cheerio from "cheerio";

export async function fetchPageContent(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return await res.text();
  } catch (err) {
    throw new Error("Failed to fetch URL content: " + err.message);
  }
}
//-----------------------------------------------------------------------------------
export function extractPageData(html) {
  const $ = cheerio.load(html);
  const title = $("title").text() || "";
  const description = $('meta[name="description"]').attr("content") || "";
  const mainContent =
    $("article").text().trim() ||
    $("main").text().trim() ||
    $("body").text().trim();
  return { title, description, mainContent };
}
//-----------------------------------------------------------------------------------
export function refineMainContent(html) {
  const $ = cheerio.load(html);
  // Remove scripts, styles, nav, footer, and images
  $("script, style, nav, footer, img").remove();
  // Get all paragraphs and join them
  const paragraphs = $("p")
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  // Join first 10 paragraphs or up to 2000 chars
  let content = paragraphs.slice(0, 10).join("\n\n");
  if (content.length > 3000) content = content.slice(0, 3000);
  // Remove excessive whitespace
  content = content.replace(/\s+/g, " ").trim();
  return content;
}
//-------------------------------------------------------------------------------
export async function enrichWithAI({
  content,
  title,
  description,
  contentType,
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      summary: "[No OpenAI API key set]",
      tags: [],
      readingTime: 0,
      contentType: "unknown",
    };
  }

  const prompt = `
Given the following web page content, title, and description, do the following:
- Write a concise summary (2-3 sentences)
- Suggest 3-5 topic tags (as a JSON array)
- Estimate reading time in minutes (integer)
- Guess the content type (blog, video, documentation, etc)

Return your answer as a JSON object with keys: summary, tags, readingTime, contentType.

Title: ${title}
Description: ${description}
Content: ${content}
ContentType: ${contentType}
`;

  let result = {
    summary: "",
    tags: [],
    readingTime: 0,
    contentType: "unknown",
  };

  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant for bookmark enrichment.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 512,
          }),
        }
      );
      const data = await response.json();

      console.log("data.choices", data.choices);
      const text = data.choices?.[0]?.message?.content || "";

      result = JSON.parse(text);
      console.log("--------------------------------");
      console.log(result);
      return result; // Success, exit early
    } catch (e) {
      lastError = e;
      // Try again
    }
  }
  // If all attempts fail
  result.summary = "[AI response could not be parsed after 4 attempts]";
  return result;
}
//-------------------------------------------------------------------------------
export function detectContentType(url, html) {
  // Check URL for known platforms
  if (/youtube\.com|youtu\.be/.test(url)) return "video";
  if (/vimeo\.com/.test(url)) return "video";
  if (/spotify\.com/.test(url)) return "audio";
  if (/soundcloud\.com/.test(url)) return "audio";
  // Check og:type meta tag
  const $ = cheerio.load(html);
  const ogType = $('meta[property="og:type"]').attr("content") || "";
  if (ogType.includes("video")) return "video";
  if (ogType.includes("audio") || ogType.includes("music")) return "audio";
  // Default to blog/article
  return "blog";
}
//-------------------------------------------------------------------------------
export async function transcribeWithAssemblyAI(mediaUrl) {
  const apiKey = process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY;
  if (!apiKey) throw new Error("AssemblyAI API key not set");
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ audio_url: mediaUrl }),
  });
  const { id } = await response.json();

  // Poll for completion
  let transcript = "";
  for (let i = 0; i < 40; i++) {
    // up to ~1 min
    await new Promise((res) => setTimeout(res, 2000));
    const pollRes = await fetch(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      {
        headers: { authorization: apiKey },
      }
    );
    const pollData = await pollRes.json();
    if (pollData.status === "completed") {
      console.log("Transcription completed");
      transcript = pollData.text;
      break;
    }
    if (pollData.status === "failed") {
      throw new Error("Transcription failed");
    }
  }
  return transcript;
}
//-------------------------------------------------------------------------------
export function extractMediaDuration(html) {
  const $ = cheerio.load(html);
  const ogDuration =
    $('meta[property="og:video:duration"]').attr("content") ||
    $('meta[property="og:audio:duration"]').attr("content") ||
    "";
  return ogDuration ? Math.ceil(Number(ogDuration) / 60) : null;
}
