import { NextResponse } from "next/server";
import { requireAuth } from "../../../utils/Backend/authMiddleware";
import { kmeans } from "ml-kmeans";
import { OpenAI } from "openai";
import {
  createFingerprint,
  createCacheKeyString,
} from "@/utils/Backend/magicSaveHelpers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory cache
const clusterCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function POST(request) {
  try {
    const { user, supabase, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;
    const { bookmarkIds } = await request.json();
    // Fetch all bookmarks for this user
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("id, embedding, url, title, summary, tags, created_at")
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .not("embedding", "is", null)
      .in("id", bookmarkIds); //only fetch bookmarks that are in the list

    let numClusters;

    if (bookmarks.length <= 3) {
      numClusters = bookmarks.length;
    } else if (bookmarks.length > 3 && bookmarks.length <= 5) {
      numClusters = 3;
    } else if (bookmarks.length > 5 && bookmarks.length <= 10) {
      numClusters = 7;
    } else if (bookmarks.length > 10 && bookmarks.length <= 15) {
      numClusters = 10;
    } else if (bookmarks.length > 15 && bookmarks.length <= 20) {
      numClusters = 12;
    } else {
      numClusters = 15;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({ clusters: [] });
    }

    // Create cache key based on bookmark content
    let bookmarkFingerprint = createFingerprint(bookmarks);
    let cacheKeyString = createCacheKeyString(bookmarkFingerprint);
    const cacheKey = user.id + ":" + cacheKeyString;

    // Check cache first
    const cached = clusterCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached bookmark clusters----------------------");
      return NextResponse.json({ clusters: cached.data });
    }

    console.log("Not in cache");
    // Prepare data for clustering
    const vectors = bookmarks.map((b) => b.embedding);
    // Run K-means clustering
    const result = kmeans(vectors, numClusters);
    // Group bookmarks by cluster
    const clusters = Array.from({ length: numClusters }, () => []);
    result.clusters.forEach((clusterIdx, i) => {
      clusters[clusterIdx].push(bookmarks[i]);
    });

    // Generate AI label for each cluster and calculate bubble metrics
    const labeledClusters = [];
    for (const cluster of clusters) {
      if (cluster.length === 0) continue; // Skip empty clusters

      const prompt = `Given these bookmark urls and titles:\n${cluster
        .map((b) => `URL: ${b.url}, Title: ${b.title}`)
        .join(
          "\n"
        )}\nSummarize the main topic or theme of this group in 1-3 words. Only return the topic label, nothing else.`;
      let label = "Misc";
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });
        label = response.choices[0].message.content.trim();
      } catch (e) {
        label = "Misc";
      }

      // Calculate bubble chart metrics
      const now = Date.now();
      const createdDates = cluster.map((b) => new Date(b.created_at).getTime());

      // X-axis: Days since last bookmark in this cluster
      const lastBookmarkDate = Math.max(...createdDates);
      const daysSinceLastBookmark = Math.max(
        0,
        (now - lastBookmarkDate) / (1000 * 60 * 60 * 24)
      );

      // Y-axis: Bookmarks per week (frequency)
      const oldestBookmarkDate = Math.min(...createdDates);
      const totalDays = Math.max(
        1,
        (now - oldestBookmarkDate) / (1000 * 60 * 60 * 24)
      );
      const bookmarksPerWeek = (cluster.length / totalDays) * 7;

      // Bubble size: Total bookmark count
      const count = cluster.length;

      labeledClusters.push({
        label,
        count,
        daysSinceLastBookmark: Math.round(daysSinceLastBookmark * 10) / 10, // Round to 1 decimal
        bookmarksPerWeek: Math.round(bookmarksPerWeek * 100) / 100, // Round to 2 decimals
        bookmarks: cluster.map((b) => ({ url: b.url, title: b.title })), // Keep original format for compatibility
      });
    }

    // Cache the result
    clusterCache.set(cacheKey, {
      data: labeledClusters,
      timestamp: Date.now(),
    });

    console.log("Generated new bookmark clusters xxxxxxxxxxxxxxxxxxxxxx");
    return NextResponse.json({ clusters: labeledClusters });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
