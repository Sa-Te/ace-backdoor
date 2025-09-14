const { Visitor, Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");
const { Op } = require("sequelize");
const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

/**
 * @file Handles all logic related to visitor tracking and statistics.
 */

/**
 * Normalizes a URL to a consistent format.
 * @param {string} rawUrl - The original URL from the browser.
 * @returns {string} The canonicalized URL.
 */
function canonicalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.protocol = "https:";
    if (u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
    return u.href;
  } catch (e) {
    return rawUrl;
  }
}

/**
 * Extracts the client's real IP address from the request headers.
 * @param {object} req - Express request object.
 * @returns {string} The visitor's IP address.
 */
function getClientIP(req) {
  let ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

/**
 * Finds an existing visitor record or creates a new one.
 * @param {string} ip - The visitor's IP address.
 * @param {string} url - The URL they visited.
 * @param {Date} timestamp - The time of the visit.
 * @returns {Promise<object>} The Sequelize visitor model instance.
 */
async function findOrCreateVisitor(ip, url, timestamp) {
  let visitor = await Visitor.findOne({ where: { ip, url } });
  let country = getCountry(ip) || "??";
  if (country.toUpperCase() === "UK") country = "GB";

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
    Object.assign(visitor, {
      timestamp,
      active: true,
      lastActive: timestamp,
      country,
    });
    await visitor.save();
  }
  return visitor;
}

/**
 * The main endpoint for the tracking script to report a new page visit.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.trackVisitor = async (req, res) => {
  try {
    const ip = getClientIP(req);
    let url = canonicalizeUrl(decodeURIComponent(req.body.url));
    const timestamp = new Date();
    console.log("Incoming tracking request:", { url, ip, timestamp });

    const visitor = await findOrCreateVisitor(ip, url, timestamp);
    const rules = await Rule.findAll({
      where: { url, isActive: true },
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });
    const matchingRules = rules.filter((rule) =>
      (rule.countries || [])
        .map((c) => (c.toUpperCase() === "UK" ? "GB" : c.toUpperCase()))
        .includes(visitor.country.toUpperCase())
    );

    const triggeredRules = [];
    const io = req.app.get("socketio");

    matchingRules.forEach((rule) => {
      if (Math.random() * 100 <= rule.percentage) {
        console.log(`Rule #${rule.id} triggered for visitor #${visitor.id}`);
        triggeredRules.push(rule.id);
        if (rule.script?.script) {
          io.emit("executeScript", {
            snippetCode: rule.script.script,
            snippetId: rule.script.id,
          });
        }
      }
    });

    res.status(201).json({ visitor, triggeredRules });
  } catch (error) {
    console.error("Error tracking visitor:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

/**
 * Endpoint for the tracking script to send heartbeats, keeping a visitor's session "active".
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.visitorPing = async (req, res) => {
  try {
    const ip = getClientIP(req);
    const url = canonicalizeUrl(decodeURIComponent(req.body.url));
    const timestamp = new Date();

    let visitor = await Visitor.findOne({ where: { ip, url } });
    if (!visitor) visitor = await findOrCreateVisitor(ip, url, timestamp);
    else {
      visitor.active = true;
      visitor.lastActive = timestamp;
      await visitor.save();
    }

    res.status(visitor ? 200 : 201).json({ message: "Heartbeat received" });
  } catch (error) {
    console.error("Error processing heartbeat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @deprecated Retrieves a flat list of all visitors. Replaced by getDashboardStats.
 * @param {object} _ - Express request object (unused).
 * @param {object} res - Express response object.
 */
exports.getVisitors = async (_, res) => {
  try {
    res.status(200).json(await Visitor.findAll());
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

/**
 * Retrieves the last 50 visitor activities for a specific URL.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getUserActivities = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url)
      return res.status(400).json({ error: "URL parameter is required" });
    res.status(200).json(
      await Visitor.findAll({
        where: { url },
        order: [["timestamp", "DESC"]],
        limit: 50,
      })
    );
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};

/**
 * Calculates and aggregates all necessary statistics for the main dashboard display.
 * This version uses Sequelize exclusively to ensure database compatibility and
 * processes the data in-memory for flexible aggregation.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Fetch all necessary visitor data using Sequelize
    const allVisitors = await Visitor.findAll({
      attributes: ["url", "ip", "timestamp", "uniqueVisit"],
      where: {
        url: { [Op.notLike]: "%/settings/%" },
      },
      order: [["timestamp", "DESC"]],
      raw: true,
    });

    const domainMap = new Map();

    // 2. Process the data in JavaScript
    for (const visitor of allVisitors) {
      let domain;
      try {
        const urlObject = new URL(visitor.url);
        domain =
          urlObject.protocol === "file:" ? "Local Files" : urlObject.hostname;
      } catch (e) {
        // Handle malformed URLs or local file paths
        domain = "Local Files";
      }

      // Initialize domain stats if it's the first time we see it
      if (!domainMap.has(domain)) {
        domainMap.set(domain, {
          domain: domain,
          lastVisit: new Date(0),
          visitors: 0,
          uniqueVisitors: 0,
          recentUniqueVisitors: 0,
          _recentIPs: new Set(),
          urls: new Map(),
        });
      }
      const domainStat = domainMap.get(domain);

      // Update domain-level stats
      domainStat.visitors += 1;
      if (visitor.uniqueVisit) {
        domainStat.uniqueVisitors += 1;
      }
      if (new Date(visitor.timestamp) > new Date(domainStat.lastVisit)) {
        domainStat.lastVisit = visitor.timestamp;
      }
      if (
        new Date(visitor.timestamp) >= todayStart &&
        !domainStat._recentIPs.has(visitor.ip)
      ) {
        domainStat._recentIPs.add(visitor.ip);
      }

      // Initialize URL-level stats within the domain
      if (!domainStat.urls.has(visitor.url)) {
        domainStat.urls.set(visitor.url, {
          url: visitor.url,
          lastVisit: new Date(0),
          visitors: 0,
          uniqueVisitors: 0,
          recentUniqueVisitors: 0,
          _recentIPs: new Set(),
        });
      }
      const urlStat = domainStat.urls.get(visitor.url);

      // Update URL-level stats
      urlStat.visitors += 1;
      if (visitor.uniqueVisit) {
        urlStat.uniqueVisitors += 1;
      }
      if (new Date(visitor.timestamp) > new Date(urlStat.lastVisit)) {
        urlStat.lastVisit = visitor.timestamp;
      }
      if (
        new Date(visitor.timestamp) >= todayStart &&
        !urlStat._recentIPs.has(visitor.ip)
      ) {
        urlStat._recentIPs.add(visitor.ip);
      }
    }

    // 3. Finalize and format the output
    const finalStats = [];
    for (const domainStat of domainMap.values()) {
      // Calculate final counts from the Sets
      domainStat.recentUniqueVisitors = domainStat._recentIPs.size;
      delete domainStat._recentIPs; // Clean up temporary data

      const urlList = [];
      for (const urlStat of domainStat.urls.values()) {
        urlStat.recentUniqueVisitors = urlStat._recentIPs.size;
        delete urlStat._recentIPs; // Clean up temporary data
        urlList.push(urlStat);
      }

      domainStat.urls = urlList;
      finalStats.push(domainStat);
    }

    res.status(200).json(finalStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard stats",
      details: error.message,
    });
  }
};
