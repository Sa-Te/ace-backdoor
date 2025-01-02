// controllers/visitorController.js

const { Visitor, Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");

exports.trackVisitor = async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

    // Extract first IP if multiple
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Remove IPv6 prefix
    if (ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    } else if (ip === "::1") {
      ip = "127.0.0.1";
    }

    const url = req.body.url;
    const timestamp = new Date();

    console.log("Incoming tracking request:", { url, ip, timestamp });

    // Determine visitor's country (fallback ?? if not found)
    const country = getCountry(ip) || "??";

    // Check if visitor record already exists
    let visitor = await Visitor.findOne({ where: { ip, url } });
    const uniqueVisit = !visitor;

    if (uniqueVisit) {
      // Create new visitor
      visitor = await Visitor.create({
        url,
        ip,
        country,
        timestamp,
        uniqueVisit,
        active: true,
        lastActive: timestamp,
      });
    } else {
      // Update existing visitor
      visitor.timestamp = timestamp;
      visitor.active = true;
      visitor.lastActive = timestamp;
      await visitor.save();
    }

    // =========================
    //  RULE-BASED EXECUTION
    // =========================
    const io = req.app.get("socketio"); // Socket.IO instance

    // 1) Fetch rules that match this exact URL
    const rules = await Rule.findAll({
      where: { url },
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });
    console.log(
      "Found rules for URL:",
      url,
      rules.map((r) => r.id)
    );

    // 2) Filter rules whose countries array includes this visitor country
    const matchingRules = rules.filter((rule) => {
      if (!Array.isArray(rule.countries)) return false;
      // Use case-insensitive comparison
      return rule.countries
        .map((c) => c.toUpperCase())
        .includes(country.toUpperCase());
    });

    // 3) For each matching rule, do the percentage check
    for (const rule of matchingRules) {
      const randomNum = Math.floor(Math.random() * 100) + 1; // 1..100
      console.log(
        `Checking rule #${rule.id} => countries=${rule.countries}, ` +
          `visitorCountry=${country}, randomNum=${randomNum}, threshold=${rule.percentage}`
      );

      if (randomNum <= rule.percentage) {
        console.log(
          `Rule #${rule.id} TRIGGERED! Setting snippet #${rule.scriptId} active...`
        );

        // Mark the snippet active (so that /api/js-snippets/latest-script.js returns it)
        if (rule.scriptId && rule.script) {
          // Deactivate all existing scripts
          await JavaScriptSnippet.update({ isActive: false }, { where: {} });

          // Activate the triggered snippet
          rule.script.isActive = true;
          await rule.script.save();
        }

        // Tell front-end to load the active snippet
        io.emit("executeScript");
      }
    }

    res.status(201).json(visitor);
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.visitorPing = async (req, res) => {
  try {
    const url = req.body.url;
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
