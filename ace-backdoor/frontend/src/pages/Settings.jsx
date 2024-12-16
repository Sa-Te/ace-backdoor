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
  const decodedUrl = decodeURIComponent(url);

  const [rules, setRules] = useState([]);
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [percentage, setPercentage] = useState(100); // Default percentage
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [activeRuleId, setActiveRuleId] = useState(null);

  const filteredUsers = filteredActivities.map((activity) => activity.ip);

  const domain = (() => {
    try {
      return new URL(decodedUrl).hostname;
    } catch {
      return null;
    }
  })();

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rules", {
        headers: { Authorization: `Bearer ${token}` },
        params: { url: decodedUrl },
      });
      const fetchedRules = response.data;
      setRules(fetchedRules);

      if (fetchedRules.length === 0) {
        setSelectedFlags([]);
        setPercentage(100);
        setActiveRuleId(null);
      } else if (activeRuleId) {
        const activeRule = fetchedRules.find((r) => r.id === activeRuleId);
        if (activeRule) {
          loadRuleIntoConditionFilter(activeRule);
        }
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const fetchScripts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/js-snippets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const scripts = response.data;
      const active = scripts.find((s) => s.isActive);
      setActiveScriptId(active ? active.id : null);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  useEffect(() => {
    console.log("Settings page URL changed to:", decodedUrl);
    fetchRules();
    fetchScripts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedUrl]);

  const handleDeleteRule = async (ruleId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const handleSelectRule = (ruleId) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    setActiveRuleId(ruleId);
    loadRuleIntoConditionFilter(rule);
  };

  const loadRuleIntoConditionFilter = (rule) => {
    setSelectedFlags(rule.countries.map((code) => ({ id: code, name: code })));
    setPercentage(rule.percentage);
  };

  const noRulesActive = rules.length === 0;

  return (
    <Layout>
      <div
        id="main__settings__container"
        className="flex flex-wrap flex-col overflow-x-scroll"
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

        {noRulesActive && (
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
          activeScriptId={activeScriptId}
          activeRuleId={activeRuleId}
          onSelectRule={handleSelectRule}
        />

        <JavaScriptSnippet filteredUsers={filteredUsers} />

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
