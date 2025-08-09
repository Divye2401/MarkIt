// Background script to handle token storage
console.log("Background script started");

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "LOGIN_SUCCESS" && message.token) {
    try {
      await chrome.storage.local.set({ token: message.token });
      console.log("Token stored successfully");
      sendResponse({ success: true });
    } catch (error) {
      console.error("Error storing token:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  return true; // Keep message channel open for async response
});
