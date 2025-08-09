// Helper functiimons for knowledge gap analysis
import { getAccessToken } from "../Providers/AuthHelpers";

export async function fetchKnowledgeGaps() {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch("/api/knowledge-gaps", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
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
export function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "text-error bg-error/10 border-error/60";
    case "medium":
      return "text-warning bg-warning/10 border-warning/60";
    case "low":
      return "text-success bg-success/10 border-success/60";
    default:
      return "text-foreground-secondary bg-surface border-border";
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
