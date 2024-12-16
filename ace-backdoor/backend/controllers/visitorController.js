// controllers/visitorController.js
const { Visitor } = require("../models");
const { getCountry } = require("../services/geoIPService");

exports.trackVisitor = async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

    // Extract the first IP if multiple are present
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Remove IPv6 prefixes
    if (ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    } else if (ip === "::1") {
      ip = "127.0.0.1";
    }

    const url = req.body.url;
    const timestamp = new Date();

    // Log incoming request
    console.log("Incoming tracking request:", { url, ip, timestamp });

    // Get country from GeoIP service
    const country = getCountry(ip);

    // Check if the visitor already exists
    let visitor = await Visitor.findOne({ where: { ip, url } });
    const uniqueVisit = !visitor;

    if (uniqueVisit) {
      // Create new visitor record
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

    res.status(201).json(visitor);
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.visitorPing = async (req, res) => {
  try {
    const url = req.body.url;
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const timestamp = new Date();

    // Find the visitor record
    const visitor = await Visitor.findOne({ where: { ip, url } });

    if (visitor) {
      visitor.active = true;
      visitor.lastActive = timestamp;
      await visitor.save();
      res.status(200).json({ message: "Heartbeat received" });
    } else {
      // If visitor record doesn't exist, create a new one
      const country = getCountry(ip);
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
    console.log("Fetching visitors for user:", req.user);
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
