import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FlagIcon from "./FlagIcon";

// Configure axios locally to avoid import errors
const api = axios.create({
  baseURL: "http://apijquery.com",
});

const ConditionFilter = ({
  url,
  fetchRules,
  selectedFlags = [], // Default to empty array to prevent crash
  setSelectedFlags,
  percentage,
  setPercentage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [scripts, setScripts] = useState([]);
  const [selectedScriptId, setSelectedScriptId] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/js-snippets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        // Robust handling for different API response structures
        if (Array.isArray(data)) {
          setScripts(data);
        } else if (data && Array.isArray(data.data)) {
          setScripts(data.data);
        } else {
          setScripts([]);
        }
      } catch (error) {
        console.error("Error fetching scripts:", error);
      }
    };
    fetchScripts();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      const codes = value.split(",");
      codes.forEach((code) => {
        const trimmedCode = code.trim().toUpperCase();
        if (trimmedCode) addCountryByCode(trimmedCode);
      });
      setInputValue("");
    } else {
      setInputValue(value);
    }
  };

  const addCountryByCode = (code) => {
    // Avoid duplicates
    if (selectedFlags.find((flag) => flag.id === code)) return;

    setSelectedFlags([...selectedFlags, { id: code }]);
  };

  const handleRemoveFlag = (flagId) => {
    setSelectedFlags(selectedFlags.filter((flag) => flag.id !== flagId));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = inputValue.trim().toUpperCase();
      if (code) {
        addCountryByCode(code);
        setInputValue("");
      }
    }
  };

  const handleSaveRule = async () => {
    if (!url) return toast.warn("No URL is selected.");
    if (selectedFlags.length === 0)
      return toast.warn("Select at least one country.");
    if (!selectedScriptId) return toast.warn("Select a script.");

    const countries = selectedFlags.map((f) => f.id);

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/api/rules",
        {
          url,
          countries,
          percentage,
          scriptId: parseInt(selectedScriptId, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rule saved successfully!");
      if (fetchRules) fetchRules();
      // Reset fields
      setSelectedFlags([]);
      setPercentage(100);
      setSelectedScriptId("");
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule.");
    }
  };

  return (
    <div
      id="settings__filter__section"
      className="p-5 flex flex-wrap justify-start items-center gap-6 bg-primaryColor rounded-lg border border-[#142860]"
    >
      {/* Country Input */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor font-semibold text-sm">
          Countries Input
        </label>
        <div
          className="flex items-center flex-wrap gap-2 p-2 bg-[#0a1229] text-textColor rounded border border-[#142860] min-h-[3rem] w-full md:w-96 cursor-text"
          onClick={() => inputRef.current.focus()}
        >
          {selectedFlags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center gap-1 bg-[#142860] px-2 py-1 rounded shadow-sm"
            >
              <FlagIcon countryCode={flag.id} />
              <span className="text-sm font-medium">{flag.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFlag(flag.id);
                }}
                className="text-gray-400 hover:text-white font-bold px-1 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="bg-transparent text-white outline-none flex-grow min-w-[60px] text-sm"
            placeholder={
              selectedFlags.length === 0
                ? "Type country code (e.g. US, ??)..."
                : ""
            }
          />
        </div>
      </div>

      {/* Percentage Filter */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor font-semibold text-sm">
          Percentage
        </label>
        <div className="flex items-center gap-3 border border-[#142860] p-2 rounded bg-[#0a1229] h-[3rem]">
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
            className="w-32 cursor-pointer"
          />
          <span className="text-white font-mono text-sm w-10 text-right">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Script Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor font-semibold text-sm">
          Select Script
        </label>
        <select
          className="p-2 bg-[#0a1229] text-white border border-[#142860] rounded h-[3rem] outline-none cursor-pointer min-w-[200px]"
          value={selectedScriptId}
          onChange={(e) => setSelectedScriptId(e.target.value)}
        >
          <option value="" disabled>
            -- Choose a script --
          </option>
          {Array.isArray(scripts) &&
            scripts.map((scr) => (
              <option key={scr.id} value={scr.id}>
                {scr.name}
              </option>
            ))}
        </select>
      </div>

      {/* Save Rule Button */}
      <div className="mt-8">
        <button
          onClick={handleSaveRule}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded transition-colors h-[3rem]"
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

export default ConditionFilter;
