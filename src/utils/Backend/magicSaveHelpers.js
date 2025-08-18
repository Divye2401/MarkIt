import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

export async function fetchPageContent(url) {
  // Try simple fetch first, auto-detect if Puppeteer is needed
  {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const html = await res.text();

      // Check if content seems to be dynamically rendered (heuristic check)
      if (isDynamicContent(html)) {
        console.log("Dynamic content detected, falling back to Puppeteer");
        return await fetchWithPuppeteer(url);
      }

      return html;
    } catch (err) {
      console.log("Simple fetch failed, trying Puppeteer:", err.message);
      return await fetchWithPuppeteer(url);
    }
  }
}

// Helper function to detect if content is likely dynamically rendered
function isDynamicContent(html) {
  const $ = cheerio.load(html);

  // Check for common indicators of dynamic content
  const bodyText = $("body").text().trim();
  const hasReactRoot = $("#root").length > 0 || $("#__next").length > 0;
  const hasVueApp = $("[data-v-]").length > 0;
  const hasAngularApp = $("[ng-app]").length > 0 || $("app-root").length > 0;
  const hasMinimalContent = bodyText.length < 200;
  const hasLoadingIndicators =
    $('[class*="loading"], [class*="spinner"], [id*="loading"]').length > 0;

  // If body has very little text content but has SPA indicators, likely dynamic
  return (
    (hasMinimalContent && (hasReactRoot || hasVueApp || hasAngularApp)) ||
    hasLoadingIndicators
  );
}

// Puppeteer-based fetch function
async function fetchWithPuppeteer(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to page with timeout
    await page.goto(url, {
      waitUntil: "networkidle2", // Wait until there are no more than 2 network connections for 500ms
      timeout: 10000,
    });
    await page.waitForTimeout(2000); // Wait for 2 seconds more for any delayed content loading

    const html = await page.content();

    return html;
  } catch (err) {
    throw new Error(`Failed to fetch URL content : ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
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
- Write a concise summary (2-3 sentences) as 'summary'.
- Write a detailed, comprehensive summary as 'biggerSummary' (minimum 2 paragraphs, between 130 and 150 words, covering all main points and details)..
- Suggest 3-5 topic tags (as a JSON array)
- Estimate reading time in minutes (integer)
- Guess the content type (blog, video, documentation, etc)

Return your answer as a JSON object with keys: summary, biggerSummary, tags, readingTime, contentType.

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
    biggerSummary: "",
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
            max_tokens: 1024,
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
// -----------------------------------------------------------------------------------

export async function fetchEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}

// Helper: Generate a natural language answer from OpenAI based on search results
export async function summarizeSearchResultsWithAI(
  query,
  bookmarks,
  suggestedLinks
) {
  if (!bookmarks || bookmarks.length === 0)
    return "No relevant bookmarks found.";
  const context = bookmarks
    .map((b, i) => `${i + 1}. Title: ${b.title}\nURL: ${b.url}`)
    .join("\n\n");

  const prompt = `
You are a helpful assistant. Given the following user query and a list of bookmarks, first explain how each of the user's bookmarks relate to the query (be specific, reference the title and link). Then, in a separate section, you are given 2 additional relevant articles (with title, url, and description) that were found via Google and are live and recent. For each of these, generate a description as to how it relates to the query, within the JSON below. Do NOT invent or add any links of your own—only describe the ones provided in the suggestedLinks array. Within description just give the description content, nothing else.

Please answer ONLY in the following JSON format:

{
  "ourLinks": [
    { "url": "...", "description": "..." },
    ... (all of the user's bookmarks)
  ],
  "suggestedLinks": [
    { "title": "...", "url": "...", "description": "..." },
    ... (the provided Google links only)
  ]
}

Do not include any extra commentary outside the JSON.

User query: ${query}

Bookmarks:
${context}

SuggestedLinks:
${JSON.stringify(suggestedLinks, null, 2)}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for searching bookmarks.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });
  const data = await response.json();

  return data.choices?.[0]?.message?.content || "";
}
//----------------------------------------------

// Helper: extract {url, description} pairs for our links and suggested links from AI answer (expects JSON)
export function extractLinksWithDescriptions(aiAnswer) {
  try {
    const jsonStart = aiAnswer.indexOf("{");
    const jsonEnd = aiAnswer.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = aiAnswer.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);
      return {
        ourLinks: parsed.ourLinks || [],
        suggestedLinks: parsed.suggestedLinks || [],
      };
    }
  } catch (e) {
    // If parsing fails, return empty arrays
  }
  return { ourLinks: [], suggestedLinks: [] };
}
//---------------------------------------------------------------------------------------------------
// Helper: Fetch top 2 live links from Google Custom Search API
export async function fetchGoogleLinks(query, semantic) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  let url = "";

  const randomStart = Math.floor(Math.random() * 15) + 1; // Start from result 1-15
  const dateOptions = ["d7", "d15", "d30", "m3"]; // 7 days, 15 days, 30 days, 3 months
  const randomDateRestrict =
    dateOptions[Math.floor(Math.random() * dateOptions.length)];

  if (semantic) {
    query = `${query} -site:google.com -site:youtube.com -site:reddit.com`;
    url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&cx=${cx}&key=${apiKey}&num=2&dateRestrict=${randomDateRestrict}&start=${randomStart}`;
  } else {
    query = `${query} -site:google.com`;
    url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&cx=${cx}&key=${apiKey}&num=2&start=${randomStart}&dateRestrict=${randomDateRestrict}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((item) => ({
    title: item.title,
    url: item.link,
  }));
}

export function createFingerprint(bookmarks) {
  let bookmarkFingerprint = [];
  for (let i = 0; i < bookmarks.length; i++) {
    const bookmark = bookmarks[i];
    let fingerprint = bookmark.id + "-";
    if (bookmark.title) {
      fingerprint = fingerprint + bookmark.title;
    }
    fingerprint = fingerprint + "-";
    if (bookmark.summary) {
      fingerprint = fingerprint + bookmark.summary;
    }
    fingerprint = fingerprint + "-";
    if (bookmark.url) {
      fingerprint = fingerprint + bookmark.url;
    }
    fingerprint = fingerprint + "-";
    if (bookmark.tags && bookmark.tags.length > 0) {
      for (let j = 0; j < bookmark.tags.length; j++) {
        fingerprint = fingerprint + bookmark.tags[j];
        if (j < bookmark.tags.length - 1) {
          fingerprint = fingerprint + "|";
        }
      }
    }
    bookmarkFingerprint.push(fingerprint);
  }
  bookmarkFingerprint.sort();
  return bookmarkFingerprint;
}

export function createCacheKeyString(bookmarkFingerprint) {
  let cacheKeyString = "";
  for (let k = 0; k < bookmarkFingerprint.length; k++) {
    cacheKeyString = cacheKeyString + bookmarkFingerprint[k];
    if (k < bookmarkFingerprint.length - 1) {
      cacheKeyString = cacheKeyString + ",";
    }
  }
  return cacheKeyString;
}

export async function summarizeBookmarks(bookmarks) {
  // 1) Keep only unique tags
  const allTagsList = bookmarks.flatMap((bookmark) => bookmark.tags ?? []);
  const allTags = [...new Set(allTagsList)];

  // 2) Count how many bookmarks have each tag
  const tagCounts = {};
  for (const bookmark of bookmarks) {
    const tags = bookmark?.tags ?? [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  // 3) Make a list of { tag, count }, sort by count (desc), then take top 10
  const topTags = Object.keys(tagCounts)
    .map((tag) => ({ tag, count: tagCounts[tag] }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)) // tie-breaker by name
    .slice(0, 10);

  // 4) Build a few bookmark examples (title + short summary) for AI context
  //    Limit to first 15 so it doesn't get too long.
  const exampleBookmarks = bookmarks
    .slice(0, 10)
    .map((b) => {
      const title = b?.title ?? "Untitled";
      const summaryText = (b?.summary ?? "No summary").toString();
      const shortSummary =
        summaryText.length > 100
          ? summaryText.slice(0, 100) + "..."
          : summaryText;
      return `${title}: ${shortSummary}`;
    })
    .join("\n");

  const val = {
    topTags,
    exampleBookmarks,
  };

  return val;
}
