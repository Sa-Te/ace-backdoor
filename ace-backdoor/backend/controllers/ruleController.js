const { Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");
const { Op } = require("sequelize");

// Helper to get client IP
function getClientIP(req) {
  //standard headers used by cPanel/Proxies
  const headerIP =
    req.headers["x-client-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.headers["cf-connecting-ip"];

  let ip = headerIP || req.socket.remoteAddress || "Unknown";

  // Handle lists (e.g. "client, proxy1, proxy2") -> take the first one
  if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();

  // Cleanup IPv6 mapping
  if (ip && ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
}

exports.createRule = async (req, res) => {
  try {
    const { url, countries, percentage, scriptId } = req.body;
    const rule = await Rule.create({
      url,
      countries,
      percentage,
      scriptId,
      isActive: true,
    });
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(500).json({ error: "Failed to create rule" });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.findAll({
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });
    res.status(200).json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, countries, percentage, scriptId, isActive } = req.body;

    const rule = await Rule.findByPk(id);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    await rule.update({ url, countries, percentage, scriptId, isActive });
    res.status(200).json(rule);
  } catch (error) {
    console.error("Error updating rule:", error);
    res.status(500).json({ error: "Failed to update rule" });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await Rule.destroy({ where: { id } });
    res.status(200).json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ error: "Failed to delete rule" });
  }
};

exports.toggleRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const rule = await Rule.findByPk(id);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    rule.isActive = isActive;
    await rule.save();
    res.status(200).json(rule);
  } catch (error) {
    console.error("Error toggling rule:", error);
    res.status(500).json({ error: "Failed to toggle rule" });
  }
};

exports.getMatchingRules = async (req, res) => {
  try {
    const { url, test_country } = req.query; // Check for Developer Override
    const ip = getClientIP(req);
    let rawCountry = getCountry(ip);
    let country =
      !rawCountry || rawCountry.toLowerCase() === "unknown" ? "??" : rawCountry;

    // 1. DEVELOPER OVERRIDE (The "Cheat" Mode)
    let debugMode = "Live";
    if (test_country) {
      country = test_country.toUpperCase(); // Force the country
      debugMode = "Developer Override";
    }

    // Fetch active rules
    const activeRules = await Rule.findAll({
      where: { isActive: true },
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });

    const snippetCodes = [];
    let triggeredCount = 0;

    activeRules.forEach((rule) => {
      // 2. URL Check
      const ruleUrl = (rule.url || "").toLowerCase();
      const visitedUrl = (url || "").toLowerCase();

      if (!visitedUrl.includes(ruleUrl)) return;

      // 3. Country Check
      let countriesList = rule.countries;
      if (typeof countriesList === "string") {
        try {
          countriesList = JSON.parse(countriesList);
        } catch (e) {
          countriesList = [];
        }
      }
      if (!Array.isArray(countriesList)) countriesList = [];

      // Filter out "GLOBAL" (Fix for legacy data)
      countriesList = countriesList.filter(
        (c) => c && c.toUpperCase() !== "GLOBAL"
      );

      if (countriesList.length > 0) {
        // Normalize Country Codes
        const ruleCountries = countriesList.map((c) =>
          c.toUpperCase() === "UK" ? "GB" : c.toUpperCase()
        );
        const visitorCountry =
          country.toUpperCase() === "UK" ? "GB" : country.toUpperCase();

        if (!ruleCountries.includes(visitorCountry)) return;
      }

      // 4. Percentage Check
      const roll = Math.random() * 100;
      // If Developer Mode is ON, we force the roll to succeed (optional, but helpful)
      const threshold = test_country ? 100 : rule.percentage;

      if (roll <= threshold) {
        triggeredCount++;
        if (rule.script && rule.script.script) {
          snippetCodes.push(rule.script.script);
        }
      }
    });

    res.json({
      triggeredCount,
      snippetCodes,
      debug: { ip, country, mode: debugMode }, // <--- This is what the script reads
    });
  } catch (error) {
    console.error("Error matching rules:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
