// Content script to bridge communication between webpage and extension
// Listen for messages from the webpage
window.addEventListener("message", (event) => {
  // Only accept messages from same origin
  if (event.origin !== "https://markit-cyan.vercel.app") return;

  if (event.data.type === "LOGIN_SUCCESS" && event.data.token) {
    // Forward the message to the extension background
    chrome.runtime.sendMessage(event.data);
  }
});
