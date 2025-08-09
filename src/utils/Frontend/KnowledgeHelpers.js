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
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
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
