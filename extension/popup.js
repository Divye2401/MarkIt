import { currentConfig } from "./config.js";
import { checkAuth, getAuthToken } from "./auth.js";

console.log("Popup script started");

// Get DOM elements
const pageInfo = document.getElementById("pageInfo");
const videoButtons = document.getElementById("videoButtons");
const articleButtons = document.getElementById("articleButtons");
const defaultButtons = document.getElementById("defaultButtons");
const status = document.getElementById("status");

// Show content type UI without checking auth first
async function checkContentType() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Show basic page info
    pageInfo.textContent = tab.title || "Unknown page";

    // Check if it's a video site
    const isVideo =
      tab.url.includes("youtube.com") ||
      tab.url.includes("vimeo.com") ||
      tab.url.includes("netflix.com");

    // Check if it's likely an article
    const isArticle =
      tab.url.includes("medium.com") ||
      tab.url.includes("blog.") ||
      tab.url.includes("article") ||
      tab.url.includes("news");

    // Show appropriate buttons
    if (isVideo) {
      videoButtons.classList.remove("hidden");
    } else if (isArticle) {
      articleButtons.classList.remove("hidden");
    } else {
      defaultButtons.classList.remove("hidden");
    }
  } catch (error) {
    showStatus("Failed to check content type: " + error.message, "error");
  }
}

// Save bookmark with type
async function saveBookmark(type) {
  try {
    console.log("Saving bookmark of type:", type);
    // Check auth before saving
    const isAuthed = await checkAuth();
    if (!isAuthed) {
      showStatus("Please login first. A new tab will open for login.", "info");
      return;
    }

    const token = await getAuthToken();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    let downloadUrl = "";
    let selectedType = type;

    // If it's default type, check radio selection
    if (type === "default") {
      const radioButtons = document.querySelectorAll('input[name="saveTo"]');
      for (const radioButton of radioButtons) {
        if (radioButton.checked) {
          selectedType = radioButton.value;
          break;
        }
      }

      // If video is selected, get download URL
      if (selectedType === "video") {
        downloadUrl = document.getElementById("downloadUrl").value.trim();
      }
    } else if (type === "video") {
      downloadUrl = document.getElementById("downloadUrl").value.trim();
    }

    showStatus("Saving...", "info");

    const response = await fetch(
      `${currentConfig.development.appUrl}/api/magic-save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: tab.url,
          mediaUrl: downloadUrl || undefined,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save bookmark");
    }

    showStatus("Saved successfully!", "success");
    setTimeout(() => window.close(), 1000);
  } catch (error) {
    console.error("Error in saveBookmark:", error);
    showStatus("Failed to save: " + error.message, "error");
  }
}

// Show status message
function showStatus(message, type) {
  console.log("Showing status:", { message, type });
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove("hidden");
}

// Add event listeners
document
  .getElementById("saveVideo")
  ?.addEventListener("click", () => saveBookmark("video"));
document
  .getElementById("saveArticle")
  ?.addEventListener("click", () => saveBookmark("article"));
document
  .getElementById("saveDefault")
  ?.addEventListener("click", () => saveBookmark("default"));

// Handle radio button changes in default mode
document.querySelectorAll('input[name="saveTo"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const downloadUrlField = document.querySelector(
      "#defaultButtons #downloadUrl"
    );
    if (e.target.value === "video") {
      downloadUrlField.classList.remove("hidden");
    } else {
      downloadUrlField.classList.add("hidden");
    }
  });
});

// Initialize without auth check
checkContentType();
