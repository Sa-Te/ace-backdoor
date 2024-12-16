// controllers/ruleController.js
const { Rule, JavaScriptSnippet } = require("../models");

exports.getRules = async (req, res) => {
  try {
    const { url } = req.query;
    const whereClause = url ? { url } : {};
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

exports.createRule = async (req, res) => {
  const { url, countries, percentage, scriptId } = req.body;

  if (!url || url.trim() === "") {
    return res
      .status(400)
      .json({ message: "URL is required for creating a rule." });
  }
  if (!countries || !Array.isArray(countries) || countries.length === 0) {
    return res.status(400).json({
      message: "Countries are required and should be a non-empty array.",
    });
  }
  if (percentage === undefined || percentage < 0 || percentage > 100) {
    return res
      .status(400)
      .json({ message: "Percentage must be a number between 0 and 100." });
  }
  if (!scriptId) {
    return res.status(400).json({ message: "scriptId is required." });
  }

  try {
    const rule = await Rule.create({ url, countries, percentage, scriptId });
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(500).json({ message: "Failed to create rule." });
  }
};

exports.updateRule = async (req, res) => {
  const ruleId = req.params.id;
  const { countries, percentage, scriptId } = req.body;

  try {
    const rule = await Rule.findByPk(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found." });
    }

    if (countries !== undefined) {
      if (!Array.isArray(countries) || countries.length === 0) {
        return res
          .status(400)
          .json({ message: "Countries should be a non-empty array." });
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

    await rule.save();
    res.json(rule);
  } catch (error) {
    console.error("Error updating rule:", error);
    res.status(500).json({ message: "Failed to update rule." });
  }
};

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
