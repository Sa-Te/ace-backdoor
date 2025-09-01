import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import ConditionFilter from "../components/ConditionFilter";
import JavaScriptSnippet from "../components/JavaScriptSnippet";
import UserActivityTable from "../components/UserActivityTable";
import RulesTable from "../components/RulesTable";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

/**
 * Generates a URL to fetch a website's favicon using a public Google service.
 * @param {string} domain - The domain of the website.
 * @returns {string} The URL for the favicon image.
 */
function getFavicon(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

/**
 * @file Settings.jsx
 * @description A detailed configuration page for a single URL. It allows a user to create,
 * view, and manage targeting rules, manage JS snippets, and view live user activity.
 */
const Settings = () => {
  const { url } = useParams();
  const decodedUrl = decodeURIComponent(url).replace("/settings/", "");

  const [rules, setRules] = useState([]);
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [percentage, setPercentage] = useState(100);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const domain = (() => {
    try {
      return new URL(decodedUrl).hostname;
    } catch {
      return null;
    }
  })();

  const pageTitle = useMemo(() => {
    try {
      // This will successfully parse http, https, and file URLs
      const urlObject = new URL(decodedUrl);

      if (urlObject.protocol === "file:") {
        // For local files, show just the filename
        return urlObject.pathname.split("/").pop();
      }

      // For standard web URLs, show the full URL
      return decodedUrl;
    } catch (e) {
      // If the new URL() constructor fails, it means decodedUrl is not a full URL.
      // This happens when we pass just a domain name (e.g., "Local Files" or "example.com").
      // In this case, the string is already the title we want to display.
      return decodedUrl;
    }
  }, [decodedUrl]);

  /**
   * Fetches all targeting rules associated with the current URL from the backend.
   */
  const fetchRules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rules", {
        headers: { Authorization: `Bearer ${token}` },
        params: { url: decodedUrl },
      });
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  /**
   * Deletes a specific rule by its ID and refreshes the rules list.
   * @param {number} ruleId - The ID of the rule to delete.
   */
  const handleDeleteRule = async (ruleId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  /**
   * Toggles the 'isActive' status of a rule.
   * @param {number} ruleId - The ID of the rule to update.
   * @param {boolean} newActiveValue - The new boolean value for the isActive status.
   */
  const handleRuleToggled = async (ruleId, newActiveValue) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/rules/${ruleId}`,
        { isActive: newActiveValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Rule updated:", response.data);

      // Re-fetch rules to update local state
      fetchRules();

      // Force a re-check of the user’s country + active rules => triggers "executeScript"
      const trackRes = await axios.post("/api/visitors/track", {
        url: decodedUrl,
        timestamp: new Date().toISOString(),
      });
      // Log the response data
      console.log("trackVisitor response =>", trackRes.data);
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  /**
   * Fetches the initial set of rules for the current URL when the page loads.
   */
  useEffect(() => {
    fetchRules();
  }, [decodedUrl]);

  return (
    <Layout>
      <div
        id="main__settings__container"
        className="flex flex-col overflow-x-scroll"
      >
        <h2 className="p-5 text-2xl font-bold text-textColor font-GilroyBold flex items-center gap-5">
          {domain && (
            <img
              src={getFavicon(domain)}
              alt="Favicon"
              className="w-6 h-6 inline-block"
            />
          )}
          Settings for {pageTitle}
        </h2>

        {rules.length === 0 && (
          <div className="p-3 mb-3 bg-[#142860] text-secondaryText font-GilroysemiBold rounded">
            No active rules currently applied for this URL. You can create a new
            rule below.
          </div>
        )}

        <ConditionFilter
          url={decodedUrl}
          selectedFlags={selectedFlags}
          setSelectedFlags={setSelectedFlags}
          percentage={percentage}
          setPercentage={setPercentage}
          fetchRules={fetchRules}
        />

        <RulesTable
          rules={rules}
          onDeleteRule={handleDeleteRule}
          onRuleToggled={handleRuleToggled}
        />

        <JavaScriptSnippet />

        <UserActivityTable
          selectedFlags={selectedFlags}
          percentage={percentage}
          url={decodedUrl}
          onFilteredActivitiesChange={setFilteredActivities}
        />

        <Footer />
      </div>
    </Layout>
  );
};

export default Settings;
