// controllers/visitorController.js

const { Visitor, Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");

function canonicalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.protocol = "https:";
    if (u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    // etc. (remove "www.")
    return u.href;
  } catch (e) {
    return rawUrl; // fallback
  }
}

exports.trackVisitor = async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
    if (ip === "::1") ip = "127.0.0.1";

    let url = decodeURIComponent(req.body.url);
    url = canonicalizeUrl(url);

    const timestamp = new Date();
    console.log("Incoming tracking request:", { url, ip, timestamp });

    // 1) Determine visitor's country
    let country = getCountry(ip) || "??";
    if (country.toUpperCase() === "UK") {
      country = "GB";
    }
    console.log("Visitor's country detected:", country);

    // 2) Create or update visitor record
    let visitor = await Visitor.findOne({ where: { ip, url } });
    if (!visitor) {
      visitor = await Visitor.create({
        url,
        ip,
        country,
        timestamp,
        uniqueVisit: true,
        active: true,
        lastActive: timestamp,
      });
    } else {
      visitor.timestamp = timestamp;
      visitor.active = true;
      visitor.lastActive = timestamp;
      visitor.country = country;
      await visitor.save();
    }

    // 3) Fetch all active rules for this URL
    const rules = await Rule.findAll({
      where: { url, isActive: true },
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });
    console.log("Active rules for this URL:", rules);

    // 4) Filter by country
    const matchingRules = rules.filter((rule) => {
      if (!Array.isArray(rule.countries)) return false;
      const normalized = rule.countries.map((c) =>
        c.toUpperCase() === "UK" ? "GB" : c.toUpperCase()
      );
      return normalized.includes(country.toUpperCase());
    });
    console.log("Matching rules after country filter:", matchingRules);

    // 5) Percentage check + emit script
    const triggeredRules = [];
    const io = req.app.get("socketio");

    for (const rule of matchingRules) {
      const randomNum = Math.random() * 100; // between 0 & 100
      if (randomNum <= rule.percentage) {
        console.log(`Rule #${rule.id} triggered for visitor #${visitor.id}`);
        triggeredRules.push(rule.id);

        if (rule.script?.script) {
          io.emit("executeScript", {
            snippetCode: rule.script.script,
            snippetId: rule.script.id,
          });
        }
      }
    }

    return res.status(201).json({ visitor, triggeredRules });
  } catch (error) {
    console.error("Error tracking visitor:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.visitorPing = async (req, res) => {
  try {
    const url = decodeURIComponent(req.body.url);

    let ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }
    if (ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    } else if (ip === "::1") {
      ip = "127.0.0.1";
    }

    const timestamp = new Date();
    const visitor = await Visitor.findOne({ where: { ip, url } });

    if (visitor) {
      visitor.active = true;
      visitor.lastActive = timestamp;
      await visitor.save();
      res.status(200).json({ message: "Heartbeat received" });
    } else {
      // If no visitor record, create one
      const country = getCountry(ip) || "??";
      await Visitor.create({
        url,
        ip,
        country,
        timestamp,
        uniqueVisit: false,
        active: true,
        lastActive: timestamp,
      });
      res
        .status(201)
        .json({ message: "Visitor created and heartbeat received" });
    }
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    console.log("Fetching visitors");
    const visitors = await Visitor.findAll();
    res.status(200).json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

exports.getUserActivities = async (req, res) => {
  try {
    const { url } = req.query;
    console.log("Fetching user activities for URL:", url);

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const userActivities = await Visitor.findAll({
      where: { url },
      order: [["timestamp", "DESC"]],
      limit: 50,
    });

    res.status(200).json(userActivities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};
