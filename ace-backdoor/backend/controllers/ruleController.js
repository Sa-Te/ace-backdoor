const { Rule, JavaScriptSnippet } = require("../models");
const { getCountry } = require("../services/geoIPService");

/**
 * @file Manages the business logic for targeting rules.
 */

/**
 * Fetch rules based on the provided URL.
 */
exports.getRules = async (req, res) => {
  try {
    const { url } = req.query;
    const normalizedUrl = url ? decodeURIComponent(url) : null; // Decode URL if present
    const whereClause = normalizedUrl ? { url: normalizedUrl } : {};

    const rules = await Rule.findAll({
      where: whereClause,
      include: [
        { model: JavaScriptSnippet, as: "script", attributes: ["id", "name"] },
      ],
    });
    res.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ message: "Failed to fetch rules" });
  }
};

/**
 * Creates a new targeting rule.
 * @param {object} req - Express request object. Body contains rule details.
 * @param {object} res - Express response object.
 */
exports.createRule = async (req, res) => {
  const { url, countries, percentage, scriptId } = req.body;

  // Validation
  if (!url || url.trim() === "") {
    return res
      .status(400)
      .json({ message: "URL is required for creating a rule." });
  }
  if (!countries || !Array.isArray(countries) || countries.length === 0) {
    return res
      .status(400)
      .json({ message: "Countries must be a non-empty array." });
  }
  if (percentage == null || percentage < 0 || percentage > 100) {
    return res
      .status(400)
      .json({ message: "Percentage must be between 0 and 100." });
  }
  if (!scriptId) {
    return res.status(400).json({ message: "scriptId is required." });
  }

  try {
    const rule = await Rule.create({
      url: decodeURIComponent(url), // Normalize URL
      countries,
      percentage,
      scriptId,
      isActive: false, // By default, new rules are inactive
    });
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(500).json({ message: "Failed to create rule." });
  }
};

/**
 * Updates an existing rule's properties, including its active status.
 * @param {object} req - Express request object. Params contain rule ID, body contains updates.
 * @param {object} res - Express response object.
 */
exports.updateRule = async (req, res) => {
  const ruleId = req.params.id;
  const { countries, percentage, scriptId, isActive } = req.body;

  try {
    const rule = await Rule.findByPk(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found." });
    }

    // Update fields if provided
    if (countries !== undefined) {
      if (
        !Array.isArray(countries) ||
        countries.some((c) => typeof c !== "string")
      ) {
        return res
          .status(400)
          .json({ message: "Countries must be an array of strings." });
      }
      rule.countries = countries;
    }

    if (percentage !== undefined) {
      if (percentage < 0 || percentage > 100) {
        return res
          .status(400)
          .json({ message: "Percentage must be between 0 and 100." });
      }
      rule.percentage = percentage;
    }

    if (scriptId !== undefined) {
      rule.scriptId = scriptId;
    }

    if (typeof isActive === "boolean") {
      rule.isActive = isActive;
    }

    await rule.save();
    res.json(rule);
  } catch (error) {
    console.error("Error updating rule:", error);
    res.status(500).json({ message: "Failed to update rule." });
  }
};

/**
 * Deletes a rule by its ID.
 * @param {object} req - Express request object. Params contain rule ID.
 * @param {object} res - Express response object.
 */
exports.deleteRule = async (req, res) => {
  const ruleId = req.params.id;
  try {
    const rule = await Rule.findByPk(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found." });
    }
    await rule.destroy();
    res.json({ message: "Rule deleted successfully." });
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ message: "Failed to delete rule." });
  }
};

/**
 * Retrieves active rules that match a visitor's request criteria (URL, country).
 * This is a public endpoint called by the tracking script on client websites.
 * @param {object} req - Express request object. Query contains the visitor's 'url'.
 * @param {object} res - Express response object.
 */
exports.getMatchingRules = async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).json({ message: "Missing ?url= param." });
    }

    // 1) detect visitor IP for country
    let ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
    if (ip === "::1") ip = "127.0.0.1";

    let country = getCountry(ip) || "??";
    if (country.toUpperCase() === "UK") {
      country = "GB";
    }

    // 2) find all active rules for this URL
    const url = decodeURIComponent(rawUrl);
    const activeRules = await Rule.findAll({
      where: { url, isActive: true },
      include: [{ model: JavaScriptSnippet, as: "script" }],
    });

    // 3) country filter
    const matchingByCountry = activeRules.filter((rule) => {
      if (!Array.isArray(rule.countries)) return false;
      const normalized = rule.countries.map((c) =>
        c.toUpperCase() === "UK" ? "GB" : c.toUpperCase()
      );
      return normalized.includes(country.toUpperCase());
    });

    // 4) percentage check
    // For each rule, randomly decide if it triggers, if rule.percentage=100 => always triggers
    const triggeredRules = matchingByCountry.filter((rule) => {
      const randomNum = Math.random() * 100;
      return randomNum <= rule.percentage;
    });

    // 5) collect snippet codes
    const snippetCodes = triggeredRules
      .filter((r) => r.script && r.script.script)
      .map((r) => r.script.script);

    // optionally return some info
    return res.json({
      triggeredCount: snippetCodes.length,
      snippetCodes,
    });
  } catch (error) {
    console.error("Error in getMatchingRules:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
