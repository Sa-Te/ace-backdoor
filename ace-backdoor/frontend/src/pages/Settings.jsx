// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Footer from "../components/Footer";
import ConditionFilter from "../components/ConditionFilter";
import JavaScriptSnippet from "../components/JavaScriptSnippet";
import UserActivityTable from "../components/UserActivityTable";
import RulesTable from "../components/RulesTable";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";

function getFavicon(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

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

  // Fetch rules
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

  // Delete rule
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

  // Toggle rule isActive
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
          Settings for {decodedUrl}
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
