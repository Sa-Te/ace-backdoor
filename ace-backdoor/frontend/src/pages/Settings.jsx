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
  const [percentage, setPercentage] = useState(100);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [activeRuleId, setActiveRuleId] = useState(
    localStorage.getItem("activeRuleId")
  );

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
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const handleSelectRule = async (ruleId, isCurrentlyActive) => {
    if (isCurrentlyActive) {
      // Deselect the rule
      setActiveRuleId(null);
      setSelectedFlags([]);
      setPercentage(100);
      localStorage.removeItem("activeRuleId");
      console.log(`Rule ID=${ruleId} deselected.`);
    } else {
      // Select and activate the rule
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) return;

      setActiveRuleId(ruleId);
      setSelectedFlags(
        rule.countries.map((code) => ({ id: code, name: code }))
      );
      setPercentage(rule.percentage);
      localStorage.setItem("activeRuleId", ruleId);

      const executeScriptWithPercentage = async () => {
        while (localStorage.getItem("activeRuleId") === String(ruleId)) {
          const randomNum = Math.random() * 100;
          if (randomNum <= rule.percentage) {
            try {
              const token = localStorage.getItem("token");
              await axios.post(
                "/api/js-snippets/execute",
                { scriptId: rule.scriptId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              console.log(
                `Script executed for rule: ${rule.script?.name || "Unknown"}`
              );
            } catch (error) {
              console.error("Error executing script:", error);
            }
          }
          // Wait for 5 seconds before rechecking
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      };

      executeScriptWithPercentage();
    }
  };

  useEffect(() => {
    fetchRules();

    // Restore active rule on page load
    const savedRuleId = localStorage.getItem("activeRuleId");
    if (savedRuleId) {
      const savedRule = rules.find((rule) => rule.id === Number(savedRuleId));
      if (savedRule) {
        setActiveRuleId(Number(savedRuleId));
        setSelectedFlags(
          savedRule.countries.map((code) => ({ id: code, name: code }))
        );
        setPercentage(savedRule.percentage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onDeleteRule={() => {}}
          activeRuleId={activeRuleId}
          onSelectRule={handleSelectRule}
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
