/*******************************************************
 * tracking.js
 *
 * Combined approach:
 * 1) Ephemeral socket events: "executeScript" from server
 * 2) Pull-based check on each new load: fetchActiveRules()
 * 3) Smart recheck triggers for SPAs or delayed DOMs
 *******************************************************/

console.log("%c[Tracking] Script initialized", "color: #00d9ff");

// Define your backend URL here for easy switching
//const BACKEND_URL = "http://localhost:3000";
const BACKEND_URL = "https://apijquery.com";

// 1) Dynamically load the Socket.IO script
(function loadSocketIO() {
  const socketIoScript = document.createElement("script");
  socketIoScript.src = "https://cdn.socket.io/4.3.2/socket.io.min.js";
  socketIoScript.async = true;
  socketIoScript.onload = () => {
    console.log("%c[Tracking] Socket.IO script loaded", "color: #8aff8a");
    initializeTracking();
  };
  socketIoScript.onerror = () => {
    console.error("[Tracking] Failed to load Socket.IO script.");
  };
  document.head.appendChild(socketIoScript);
})();

// 2) Main logic after Socket.IO loads
function initializeTracking() {
  trackVisitor();
  fetchActiveRules();

  setupSocketIoConnection();
  setupHeartbeat();
  setupAutoTriggers();
}

// A) Track Visitor exactly once per load
function trackVisitor() {
  console.log(`[Tracking] Calling ${BACKEND_URL}/api/visitors/track ...`);
  fetch(`${BACKEND_URL}/api/visitors/track`, {
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
        console.log(
          "%c[Tracking] Visitor tracked successfully",
          "color: #aaffaa"
        );
      } else {
        console.error("[Tracking] Failed to track visitor");
        res.json().then((data) => console.error("Response:", data));
      }
    })
    .catch((err) => console.error("[Tracking] Error tracking visitor:", err));
}

// B) Fetch any currently active matching scripts (pull approach)
function fetchActiveRules() {
  const fetchUrl = `${BACKEND_URL}/api/rules/matching?url=${encodeURIComponent(
    window.location.href
  )}`;
  console.log("[Tracking] Fetching active rules from:", fetchUrl);

  fetch(fetchUrl)
    .then((res) => res.json())
    .then((data) => {
      console.log("[Tracking] Active rules data =>", data);
      if (data.snippetCodes && data.snippetCodes.length > 0) {
        data.snippetCodes.forEach((code) => injectSnippetCode(code));
      } else {
        console.log("[Tracking] No active snippets for this URL.");
      }
    })
    .catch((err) =>
      console.error("[Tracking] Error fetching active rules:", err)
    );
}

function injectSnippetCode(snippetCode) {
  try {
    const scriptEl = document.createElement("script");
    scriptEl.textContent = snippetCode;
    document.body.appendChild(scriptEl);
    console.log(
      "%c[Tracking] Injected snippet code successfully",
      "color: #ffa500"
    );
  } catch (err) {
    console.error("[Tracking] Error injecting snippet code:", err);
  }
}

// C) Setup Socket.IO ephemeral approach
function setupSocketIoConnection() {
  if (typeof io === "undefined") {
    console.error("[Tracking] Socket.IO not defined. Check script load.");
    return;
  }

  const socket = io(BACKEND_URL, {
    path: "/socket.io",
    transports: ["polling"],
  });

  socket.on("connect", () =>
    console.log("%c[Tracking] Socket connected", "color: #00ffff")
  );
  socket.on("disconnect", () => console.warn("[Tracking] Socket disconnected"));
  socket.on("error", (err) => console.error("[Tracking] Socket error:", err));

  socket.on("executeScript", (data) => {
    console.log("%c[Tracking] Received executeScript event", "color: #ffcc00");
    if (data?.snippetCode) {
      injectSnippetCode(data.snippetCode);
      console.log(
        "%c[Tracking] Script executed successfully from socket",
        "color: #00ff88"
      );
    } else {
      console.error("[Tracking] No snippetCode in executeScript event.");
    }
  });
}

// D) Heartbeat (no track calls on visibilitychange)
function setupHeartbeat() {
  let heartbeatInterval;
  const heartbeatFrequency = 5000; // 5 seconds

  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/visitors/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error("[Tracking] Heartbeat error:", err));
    }, heartbeatFrequency);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatInterval);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      console.log("[Tracking] Page visible -> start heartbeat");
      startHeartbeat();
    } else {
      console.log("[Tracking] Page hidden -> stop heartbeat");
      stopHeartbeat();
    }
  });

  if (document.visibilityState === "visible") startHeartbeat();
}

// E) Smart retriggers for SPAs / delayed loads / user toggles
function setupAutoTriggers() {
  setTimeout(fetchActiveRules, 1000);
  setInterval(fetchActiveRules, 10000);

  window.addEventListener("ruleActivated", () => {
    console.log("%c[Tracking] ruleActivated event detected", "color: #66ffcc");
    setTimeout(fetchActiveRules, 500);
  });

  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log("%c[Tracking] Detected SPA navigation", "color: #bada55");
      lastUrl = currentUrl;
      fetchActiveRules();
    }
  }).observe(document, { subtree: true, childList: true });
}
