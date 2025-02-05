// controllers/visitorController.js

const { Visitor, Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");

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

function getClientIP(req) {
  let ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

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

exports.getVisitors = async (_, res) => {
  try {
    res.status(200).json(await Visitor.findAll());
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

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
