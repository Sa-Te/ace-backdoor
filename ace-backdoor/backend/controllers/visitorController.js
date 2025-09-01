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
    const url = decodeURIComponent(req.body.url);
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
 * Uses a hybrid approach: a fast SQL query for domain-level totals, and JS processing
 * for the detailed per-URL sub-row data.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Phase 1: Use a fast SQL query to get the main domain-level totals.
    const query = `
  SELECT
    CASE
      WHEN url LIKE 'file:///%' THEN 'Local Files'
      ELSE SUBSTRING_INDEX(REPLACE(REPLACE(url, 'https://', ''), 'http://', ''), '/', 1)
      END as domain,
      MAX(timestamp) as lastVisit,
      COUNT(*) as visitors,
      SUM(CASE WHEN uniqueVisit = 1 THEN 1 ELSE 0 END) as uniqueVisitors,
      COUNT(DISTINCT CASE WHEN timestamp >= CURDATE() THEN ip ELSE NULL END) as recentUniqueVisitors
    FROM
      Visitors
    WHERE
      url NOT LIKE '%/settings/%'
    GROUP BY
      domain;
  `;
    const domainStats = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    const domainMap = new Map(
      domainStats.map((item) => [item.domain, { ...item, urls: [] }])
    );

    // Phase 2: Fetch all visitor data to calculate the per-URL sub-row stats.
    const allVisitors = await Visitor.findAll({
      attributes: ["url", "timestamp", "uniqueVisit"],
      where: { url: { [Op.notLike]: "%/settings/%" } },
      raw: true,
    });

    const urlStatsMap = new Map();

    for (const visitor of allVisitors) {
      // Calculate stats for each individual URL
      if (!urlStatsMap.has(visitor.url)) {
        urlStatsMap.set(visitor.url, {
          url: visitor.url,
          lastVisit: new Date(0),
          visitors: 0,
          uniqueVisitors: 0,
          _recentIPs: new Set(),
        });
      }
      const urlStat = urlStatsMap.get(visitor.url);
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
        urlStat.recentUniqueVisitors = urlStat._recentIPs.size;
      }
    }

    urlStatsMap.forEach((stat) => delete stat._recentIPs);

    // Phase 3: Combine the domain totals with their detailed sub-rows.
    for (const urlStat of urlStatsMap.values()) {
      try {
        const urlObject = new URL(urlStat.url);
        const domain =
          urlObject.protocol === "file:" ? "Local Files" : urlObject.hostname;
        if (domainMap.has(domain)) {
          domainMap.get(domain).urls.push(urlStat);
        }
      } catch (e) {
        // Handle local file paths that aren't valid URLs
        if (urlStat.url.includes("index.html")) {
          if (domainMap.has("Local Files")) {
            domainMap.get("Local Files").urls.push(urlStat);
          }
        } else {
          console.warn(
            `Could not parse domain from invalid URL: ${urlStat.url}`
          );
        }
      }
    }

    res.status(200).json(Array.from(domainMap.values()));
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
