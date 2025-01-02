import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const JavaScriptSnippet = ({ filteredUsers }) => {
  const [scripts, setScripts] = useState([]);
  const [currentName, setCurrentName] = useState("");
  const [currentScript, setCurrentScript] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/js-snippets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScripts(response.data);
      } catch (error) {
        console.error("Error fetching scripts:", error);
        toast.error("Failed to fetch scripts.");
      }
    };

    fetchScripts();
  }, []);

  const handleSaveScript = async () => {
    if (currentName.trim() === "") {
      toast.warn("Script name cannot be empty.");
      return;
    }

    if (currentScript.trim() === "") {
      toast.warn("Script cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      let savedScript;
      if (editingScriptId) {
        // Updating existing
        const response = await axios.put(
          `/api/js-snippets/${editingScriptId}`,
          { name: currentName, script: currentScript },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        savedScript = response.data;
        setScripts(
          scripts.map((s) => (s.id === editingScriptId ? savedScript : s))
        );
      } else {
        // Creating new
        const response = await axios.post(
          "/api/js-snippets",
          { name: currentName, script: currentScript },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        savedScript = response.data;
        setScripts([...scripts, savedScript]);
      }

      toast.success(editingScriptId ? "Script updated!" : "Script saved!");

      // Optionally auto-execute the script right after saving:
      // handleExecuteScript(savedScript.id);

      setEditingScriptId(null);
      setCurrentName("");
      setCurrentScript("");
      setIsFullscreen(false);
    } catch (error) {
      console.error("Error saving script:", error);
      toast.error("Failed to save script.");
    }
  };

  const handleDeleteScript = async (id) => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/js-snippets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setScripts(scripts.filter((script) => script.id !== id));
      toast.success("Script deleted successfully!");
    } catch (error) {
      console.error("Error deleting script:", error);
      toast.error("Failed to delete script.");
    }
  };

  const handleEditScript = (script) => {
    setEditingScriptId(script.id);
    setCurrentName(script.name);
    setCurrentScript(script.script);
    setIsFullscreen(true);
  };

  const handleExecuteScript = async (id, scriptsArray = scripts) => {
    try {
      const token = localStorage.getItem("token");

      const scriptToExecute = scriptsArray.find((script) => script.id === id);
      if (!scriptToExecute) {
        toast.warn("Script not found.");
        return;
      }

      if (!filteredUsers || filteredUsers.length === 0) {
        toast.warn("No users selected to execute the script.");
        return;
      }

      await axios.post(
        `/api/js-snippets/execute`,
        { scriptId: id, users: filteredUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Script executed successfully!");
    } catch (error) {
      console.error("Error executing script:", error);
      toast.error("Failed to execute script.");
    }
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setEditingScriptId(null);
    setCurrentName("");
    setCurrentScript("");
  };

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center p-5"
          style={{ padding: "2rem" }}
        >
          <div className="w-full max-w-4xl h-full bg-primaryColor rounded-lg overflow-hidden relative">
            <div className="p-3">
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="Script Name"
                className="w-full mb-3 p-2 bg-transparent text-textColor border-b border-gray-600 focus:outline-none text-lg"
              />
            </div>
            <textarea
              value={currentScript}
              onChange={(e) => setCurrentScript(e.target.value)}
              className="w-full h-full p-3 bg-transparent text-textColor font-mono resize-none focus:outline-none text-lg"
              placeholder="Write your JS code here..."
            />
            <button
              onClick={handleCloseFullscreen}
              className="absolute top-3 right-3 bg-accentColor text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
      )}

      <div id="js__textBox" className="p-5 mt-10">
        <label className="text-textColor font-GilroysemiBold block mb-4 text-sm">
          JavaScript Snippet
        </label>
        <div
          className={`relative border-[1px] border-[#142860] rounded bg-primaryColor w-full h-72`}
        >
          <div className="p-3">
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder="Script Name"
              className="w-full mb-3 p-2 bg-transparent text-textColor border-b border-gray-600 font-GilroysemiBold focus:outline-none text-sm"
            />
          </div>
          <textarea
            value={currentScript}
            onChange={(e) => setCurrentScript(e.target.value)}
            className="w-full h-40 p-3 bg-transparent text-textColor font-GilroysemiBold resize-none focus:outline-none text-sm"
            placeholder="Write your JS code here..."
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 bg-accentColor text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            [ ]
          </button>
        </div>
        <div className="flex gap-5 mt-5">
          <button
            onClick={handleSaveScript}
            className="bg-accentColor text-[#CFDBFF] font-GilroysemiBold py-3 px-7 rounded hover:bg-opacity-90"
          >
            {editingScriptId ? "Update" : "Save"}
          </button>
          {editingScriptId && (
            <button
              onClick={() => {
                setEditingScriptId(null);
                setCurrentName("");
                setCurrentScript("");
                setIsFullscreen(false);
              }}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>

        {/* List of Saved Scripts */}
        <div className="mt-20">
          <h3 className="text-textColor font-GilroysemiBold mb-3">
            Saved Scripts
          </h3>
          <table className="table-auto w-full bg-primaryColor border-collapse border border-[#142860]">
            <thead className="text-textColor">
              <tr>
                <th className="p-3 border border-[#142860] font-GilroysemiBold">
                  ID
                </th>
                <th className="p-3 border border-[#142860] font-GilroysemiBold">
                  Name
                </th>
                <th className="p-3 border border-[#142860] font-GilroysemiBold">
                  Script
                </th>
                <th className="p-3 border border-[#142860] font-GilroysemiBold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-textColor text-center font-GilroysemiBold">
              {scripts.length > 0 ? (
                scripts.map((script) => (
                  <tr key={script.id}>
                    <td className="p-3 font-GilroysemiBold text-secondaryText border border-[#142860]">
                      {script.id}
                    </td>
                    <td className="p-3 font-GilroysemiBold  text-secondaryText border border-[#142860]">
                      {script.name}
                    </td>
                    <td className="p-3 border border-[#142860] truncate text-secondaryText">
                      {script.script.length > 50
                        ? script.script.substring(0, 50) + "..."
                        : script.script}
                    </td>
                    <td className="p-3 border border-[#142860] flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => handleEditScript(script)}
                        className="text-[#28B7B7] font-GilroysemiBold p-3 rounded bg-[#0F2051]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteScript(script.id)}
                        className="text-[#F54A4A] font-GilroysemiBold p-3 rounded bg-[#0F2051]"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleExecuteScript(script.id)}
                        className="text-[#28B7B7] font-GilroysemiBold p-3 rounded bg-[#0F2051] hover:animate-pulse"
                      >
                        Execute
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-3">
                    No scripts available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default JavaScriptSnippet;
