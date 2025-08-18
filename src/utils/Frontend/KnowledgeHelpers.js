// Helper functiimons for knowledge gap analysis
import { getAccessToken } from "../Providers/AuthHelpers";

export async function fetchKnowledgeGaps(bookmarkIds) {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch("/api/knowledge-gaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ bookmarkIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching knowledge gaps:", error);
    throw error;
  }
}

// Helper to get priority color
export function getPriorityColor(priority, darkMode = false) {
  switch (priority) {
    case "high":
      return darkMode
        ? " bg-red-400/50 border-error/60"
        : "text-error bg-red-400/10 border-error/60";
    case "medium":
      return darkMode
        ? " bg-warning/50 border-warning/60"
        : "text-warning bg-warning/10 border-warning/60";
    case "low":
      return darkMode
        ? " bg-success/50 border-success/60"
        : "text-success bg-success/10 border-success/60";
    default:
      return darkMode
        ? "text-foreground-secondary bg-surface border-border"
        : "text-foreground-secondary bg-surface border-border";
  }
}

// Helper to get category icon
export function getCategoryIcon(category) {
  switch (category) {
    case "technical":
      return "🔧";
    case "foundational":
      return "🏗️";
    case "complementary":
      return "🔗";
    default:
      return "💡";
  }
}
