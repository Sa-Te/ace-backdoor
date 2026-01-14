const { Visitor, Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");
const { Op } = require("sequelize");

/**
 * Normalizes a URL to a consistent format.
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
 * Extracts the client's real IP address.
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

exports.getVisitors = async (_, res) => {
  try {
    res.status(200).json(await Visitor.findAll());
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

/**
 * Retrieves the last 50 visitor activities.
 * FIXED: Uses LIKE operator to match partial URLs/domains.
 */
exports.getUserActivities = async (req, res) => {
  try {
    const { url } = req.query;
    let whereClause = {};

    if (url) {
      // If a URL/Domain is provided, search for it anywhere in the stored URL field.
      // This solves the issue where frontend sends "127.0.0.1" but DB has "https://127.0.0.1..."
      whereClause = {
        url: { [Op.like]: `%${url}%` },
      };
    }

    res.status(200).json(
      await Visitor.findAll({
        where: whereClause,
        order: [["timestamp", "DESC"]],
        limit: 50,
      })
    );
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const allVisitors = await Visitor.findAll({
      attributes: ["url", "ip", "timestamp", "uniqueVisit"],
      where: {
        url: { [Op.notLike]: "%/settings/%" },
      },
      order: [["timestamp", "DESC"]],
      raw: true,
    });

    const domainMap = new Map();

    for (const visitor of allVisitors) {
      let domain;
      try {
        const urlObject = new URL(visitor.url);
        domain =
          urlObject.protocol === "file:" ? "Local Files" : urlObject.hostname;
      } catch (e) {
        domain = "Local Files";
      }

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

    const finalStats = [];
    for (const domainStat of domainMap.values()) {
      domainStat.recentUniqueVisitors = domainStat._recentIPs.size;
      delete domainStat._recentIPs;

      const urlList = [];
      for (const urlStat of domainStat.urls.values()) {
        urlStat.recentUniqueVisitors = urlStat._recentIPs.size;
        delete urlStat._recentIPs;
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
