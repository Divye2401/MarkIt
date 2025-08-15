import { getAccessToken } from "../Providers/AuthHelpers";

// Create a new research project
export async function createResearchProject(projectData) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch("/api/research-projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(projectData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create research project");
    }

    return result;
  } catch (error) {
    console.error("Error creating research project:", error);
    throw error;
  }
}

// Fetch all research projects for the user
export async function fetchResearchProjects() {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch("/api/research-projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch research projects");
    }

    return result.projects;
  } catch (error) {
    console.error("Error fetching research projects:", error);
    throw error;
  }
}

// Fetch a single research project by ID
export async function fetchResearchProject(projectId) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`/api/research-projects/${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch research project");
    }

    return result.project;
  } catch (error) {
    console.error("Error fetching research project:", error);
    throw error;
  }
}

// Update a research project
export async function updateResearchProject(projectId, updateData) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`/api/research-projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update research project");
    }

    return result.project;
  } catch (error) {
    console.error("Error updating research project:", error);
    throw error;
  }
}

// Delete a research project
export async function deleteResearchProject(projectId) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`/api/research-projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete research project");
    }

    return result;
  } catch (error) {
    console.error("Error deleting research project:", error);
    throw error;
  }
}
