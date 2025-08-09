import { currentConfig } from "./config.js";

console.log("Auth module initializing");

export async function getAuthToken() {
  console.log("Getting auth token");
  try {
    // Check if we have a token in storage
    const result = await chrome.storage.local.get("token");
    console.log("Storage result:", result);
    console.log("Token from storage:", result.token ? "exists" : "none");

    if (result.token) {
      return result.token;
    }
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

export async function checkAuth() {
  console.log("Checking auth");
  const token = await getAuthToken();
  console.log("Token exists:", !!token);

  if (!token) {
    // Open login page in new tab
    const loginUrl = `${currentConfig.production.appUrl}`;
    console.log("Opening login URL:", loginUrl);
    chrome.tabs.create({ url: loginUrl });
    return false;
  }
  return true;
}
