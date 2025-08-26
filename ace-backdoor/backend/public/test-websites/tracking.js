/*******************************************************
 * tracking.js
 *
 * Combined approach:
 *   1) Ephemeral socket events: "executeScript" from server
 *   2) Pull-based check on each new load: fetchActiveRules()
 *******************************************************/

console.log("Tracking script initialized");

// 1) Dynamically load the Socket.IO script
(function loadSocketIO() {
  const socketIoScript = document.createElement("script");
  socketIoScript.src = "https://cdn.socket.io/4.3.2/socket.io.min.js";
  socketIoScript.async = true;
  socketIoScript.onload = () => {
    console.log("Socket.IO script loaded successfully");
    initializeTracking();
  };
  socketIoScript.onerror = () => {
    console.error("Failed to load Socket.IO script.");
  };
  document.head.appendChild(socketIoScript);
})();

// 2) Main logic after Socket.IO loads
function initializeTracking() {
  // Track on the very first load
  trackVisitor();

  // Also track if page is reloaded via forward/back button (bfcache).
  window.addEventListener("pageshow", (evt) => {
    console.log("pageshow event => track again");
    trackVisitor();
  });

  // Additionally fetch any currently active scripts for this URL
  // so we don't miss them if we were offline for a prior "emit".
  fetchActiveRules();

  setupSocketIoConnection();
  setupHeartbeat();
}

// A) Track Visitor exactly once per load
function trackVisitor() {
  console.log("Calling /api/visitors/track ...");
  fetch("http://localhost:3000/api/visitors/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }),
    credentials: "omit",
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
}

// B) Fetch any currently active matching scripts (pull approach)
function fetchActiveRules() {
  const fetchUrl = `http://localhost:3000/api/rules/matching?url=${encodeURIComponent(
    window.location.href
  )}`;
  console.log("Fetching active rules from:", fetchUrl);

  fetch(fetchUrl)
    .then((res) => res.json())
    .then((data) => {
      console.log("Active rules data =>", data);
      if (data.snippetCodes && data.snippetCodes.length > 0) {
        data.snippetCodes.forEach((code) => injectSnippetCode(code));
      }
    })
    .catch((err) => console.error("Error fetching active rules:", err));
}

function injectSnippetCode(snippetCode) {
  const scriptEl = document.createElement("script");
  scriptEl.textContent = snippetCode;
  document.body.appendChild(scriptEl);
  console.log("Injected snippet code:\n", snippetCode);
}

// C) Setup Socket.IO ephemeral approach
function setupSocketIoConnection() {
  if (typeof io === "undefined") {
    console.error("Socket.IO not defined. Check script load.");
    return;
  }

  const socket = io("http://localhost:3000", {
    path: "/socket.io",
    transports: ["polling"],
  });

  socket.on("executeScript", (data) => {
    console.log("Received executeScript event.");

    if (data?.snippetCode) {
      injectSnippetCode(data.snippetCode);
      console.log("Script executed successfully from socket event.");
    } else {
      console.error("No snippetCode in executeScript event.");
    }
  });
}

// D) Heartbeat (no track calls on visibilitychange)
function setupHeartbeat() {
  let heartbeatInterval;
  const heartbeatFrequency = 5000; // 5 seconds

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      fetch("http://localhost:3000/api/visitors/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("Heartbeat error:", err));
    }, heartbeatFrequency);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatInterval);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("Page is visible -> start heartbeat");
      startHeartbeat();
    } else {
      console.log("Page is hidden -> stop heartbeat");
      stopHeartbeat();
    }
  });

  // If page is initially visible, start now
  if (document.visibilityState === "visible") {
    startHeartbeat();
  }
}
