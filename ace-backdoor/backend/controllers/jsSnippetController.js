// controllers/jsSnippetController.js
const { JavaScriptSnippet } = require("../models");

exports.getAllScripts = async (req, res) => {
  try {
    const scripts = await JavaScriptSnippet.findAll();
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ message: "Failed to fetch scripts" });
  }
};

exports.getLatestScript = async (req, res) => {
  try {
    const script = await JavaScriptSnippet.findOne({
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
    });
    if (script) {
      res.json({ script: script.script });
    } else {
      res.json({ script: null });
    }
  } catch (error) {
    console.error("Error fetching latest script:", error);
    res.status(500).json({ message: "Failed to fetch latest script" });
  }
};

exports.executeScript = async (req, res) => {
  const { scriptId } = req.body;

  try {
    const script = await JavaScriptSnippet.findByPk(scriptId);
    if (!script) {
      return res.status(404).json({ message: "Script not found." });
    }

    // Set all scripts to inactive
    await JavaScriptSnippet.update({ isActive: false }, { where: {} });

    // Set the selected script to active
    script.isActive = true;
    await script.save();

    // Emit an event to all connected clients
    const io = req.app.get("socketio");
    io.emit("executeScript", script.script);

    res.json({ message: "Script set to execute." });
  } catch (error) {
    console.error("Error executing script:", error);
    res.status(500).json({ message: "Failed to execute script." });
  }
};

exports.createScript = async (req, res) => {
  const { name, script } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Script name is required." });
  }

  if (!script || script.trim() === "") {
    return res.status(400).json({ message: "Script content is required." });
  }

  try {
    // Set all scripts to inactive
    await JavaScriptSnippet.update({ isActive: false }, { where: {} });

    // Create new script and set it as active
    const newScript = await JavaScriptSnippet.create({
      name,
      script,
      isActive: true,
    });
    res.status(201).json(newScript);
  } catch (error) {
    console.error("Error creating script:", error);
    res.status(500).json({ message: "Failed to create script." });
  }
};

exports.updateScript = async (req, res) => {
  const scriptId = req.params.id;
  const { name, script } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Script name is required." });
  }

  if (!script || script.trim() === "") {
    return res.status(400).json({ message: "Script content is required." });
  }

  try {
    const existingScript = await JavaScriptSnippet.findByPk(scriptId);
    if (!existingScript) {
      return res.status(404).json({ message: "Script not found." });
    }

    existingScript.name = name;
    existingScript.script = script;
    await existingScript.save();

    res.json(existingScript);
  } catch (error) {
    console.error("Error updating script:", error);
    res.status(500).json({ message: "Failed to update script." });
  }
};

exports.getLatestScriptContent = async (req, res) => {
  try {
    const script = await JavaScriptSnippet.findOne({
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
    });
    if (script) {
      res.type("application/javascript");
      res.send(script.script);
    } else {
      res.status(404).send("// No script available.");
    }
  } catch (error) {
    console.error("Error fetching latest script content:", error);
    res.status(500).send("// Failed to fetch latest script content");
  }
};

exports.deleteScript = async (req, res) => {
  const scriptId = req.params.id;

  try {
    const existingScript = await JavaScriptSnippet.findByPk(scriptId);
    if (!existingScript) {
      return res.status(404).json({ message: "Script not found." });
    }

    await existingScript.destroy();
    res.json({ message: "Script deleted successfully." });
  } catch (error) {
    console.error("Error deleting script:", error);
    res.status(500).json({ message: "Failed to delete script." });
  }
};
