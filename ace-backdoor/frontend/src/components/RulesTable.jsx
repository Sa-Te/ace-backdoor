import React from "react";
import FlagIcon from "./FlagIcon";

const RulesTable = ({ rules, onDeleteRule, onRuleToggled }) => {
  return (
    <div className="overflow-x-auto bg-primaryColor p-5 rounded-lg mt-5">
      <h3 className="text-textColor font-bold text-xl mb-4">Existing Rules</h3>
      <table className="table-auto w-full text-center border border-[#142860]">
        <thead>
          <tr className="text-gray-300 bg-[#0a1229] border-b border-[#142860]">
            <th className="p-4 font-semibold">Countries</th>
            <th className="p-4 font-semibold">Percentage</th>
            <th className="p-4 font-semibold">Script</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="text-textColor">
          {rules.length > 0 ? (
            rules.map((rule) => {
              const { id, countries, percentage, script, isActive } = rule;
              const rowClass = isActive ? "bg-[#142860]/30" : "";

              // Safe check for countries array
              let countryList = [];
              if (Array.isArray(countries)) {
                countryList = countries;
              } else if (typeof countries === "string") {
                // Fallback if DB returns string
                try {
                  countryList = JSON.parse(countries);
                } catch (e) {
                  countryList = [countries];
                }
              }

              return (
                <tr
                  key={id}
                  className={`border-b border-[#142860] hover:bg-[#142860]/50 transition-colors ${rowClass}`}
                >
                  <td className="p-3 flex flex-wrap justify-center gap-1">
                    {countryList.length > 0 ? (
                      countryList.map((code, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1 bg-[#0a1229] px-2 py-1 rounded border border-[#142860]"
                          title={code}
                        >
                          <FlagIcon countryCode={code} />
                          <span className="font-mono text-xs font-bold">
                            {code}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">Global</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-300 font-mono">{percentage}%</td>
                  <td className="p-3 text-blue-300">
                    {script ? script.name : "Unknown Script"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        isActive
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onRuleToggled(id, !isActive)}
                        className={`text-xs font-bold px-3 py-2 rounded transition-colors ${
                          isActive
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-blue-600 text-white hover:bg-blue-500"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => onDeleteRule(id)}
                        className="bg-red-900/50 text-red-300 hover:bg-red-900 text-xs font-bold px-3 py-2 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="p-6 text-gray-500 italic">
                No rules applied yet. Create one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RulesTable;
