// public/tracking.js
console.log("Tracking script initialized");

// Send visitor data to your backend
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

// Establish WebSocket connection
const socket = io("http://localhost:3000");

// Listen for the 'executeScript' event
socket.on("executeScript", () => {
  console.log("Received executeScript event.");

  // Create a new script element and set its src to the script URL with a timestamp to prevent caching
  const scriptElement = document.createElement("script");
  scriptElement.src = `/api/js-snippets/latest-script.js?t=${new Date().getTime()}`;
  document.body.appendChild(scriptElement);
});

// Heartbeat mechanism
let heartbeatInterval;
const heartbeatFrequency = 5000; // Send heartbeat every 5 seconds

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

// Start sending heartbeats when the page is visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Page is visible. Starting heartbeat.");
    startHeartbeat();
  } else {
    console.log("Page is hidden. Stopping heartbeat.");
    stopHeartbeat();
  }
});

// Start heartbeat when the script loads, if the page is visible
if (document.visibilityState === "visible") {
  startHeartbeat();
}
