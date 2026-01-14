const { JavaScriptSnippet } = require("../models");

/**
 * @file Manages the business logic for creating, viewing, and managing JavaScript snippets.
 */

/**
 * Retrieves all JavaScript snippets from the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getAllScripts = async (req, res) => {
  try {
    const scripts = await JavaScriptSnippet.findAll();
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ message: "Failed to fetch scripts" });
  }
};

/**
 * Retrieves the currently active script's metadata (not the raw content).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
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

/**
 * Sets a specific script as the single active script for all clients.
 * @param {object} req - Express request object, expecting { scriptId } in the body.
 * @param {object} res - Express response object.
 */
exports.executeScript = async (req, res) => {
  const { scriptId } = req.body;

  try {
    const script = await JavaScriptSnippet.findByPk(scriptId);
    if (!script) {
      return res.status(404).json({ message: "Script not found." });
    }

    // Deactivate all scripts
    await JavaScriptSnippet.update({ isActive: false }, { where: {} });

    // Activate the chosen script
    script.isActive = true;
    await script.save();

    // Emit to all clients so they can fetch the new "active" script
    const io = req.app.get("socketio");
    io.emit("executeScript", {
      snippetCode: script.script,
      snippetId: script.id,
    });

    res.json({ message: "Script set to execute." });
  } catch (error) {
    console.error("Error executing script:", error);
    res.status(500).json({ message: "Failed to execute script." });
  }
};

/**
 * Creates a new JavaScript snippet.
 * @param {object} req - Express request object, expecting { name, script } in the body.
 * @param {object} res - Express response object.
 */
exports.createScript = async (req, res) => {
  const { name, script } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Script name is required." });
  }
  if (!script || script.trim() === "") {
    return res.status(400).json({ message: "Script content is required." });
  }

  try {
    // Optionally set all scripts inactive, then create a new one as active
    await JavaScriptSnippet.update({ isActive: false }, { where: {} });

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

/**
 * Updates the name and content of an existing script.
 * @param {object} req - Express request object, with script ID in params and { name, script } in body.
 * @param {object} res - Express response object.
 */
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

/**
 * Serves the raw content of the currently active JavaScript snippet.
 * This is the public endpoint that client websites will include in their <script> tags.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
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
      res.type("application/javascript");
      res.status(404).send("No script available.");
    }
  } catch (error) {
    console.error("Error fetching latest script content:", error);
    res
      .status(500)
      .type("application/javascript")
      .send("Failed to fetch latest script content");
  }
};

/**
 * Deletes a script from the database by its ID.
 * @param {object} req - Express request object, with script ID in params.
 * @param {object} res - Express response object.
 */
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
