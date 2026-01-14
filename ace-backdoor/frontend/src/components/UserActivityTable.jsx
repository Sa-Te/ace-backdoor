import React, { useState, useEffect, useMemo } from "react";
import axios from "../utils/axios";

// Using simple string paths to match your ConditionFilter component
// This expects images to be in public/assets/
const flagMap = {
  AD: "AndorraFlag.svg",
  AW: "ArubaFlag.svg",
  AU: "AustraliaFlag.svg",
  AT: "AustriaFlag.svg",
  BS: "BahamasFlag.svg",
  BH: "BahrainFlag.svg",
  BE: "BelgiumFlag.svg",
  BN: "BruneiFlag.svg",
  CA: "CanadaFlag.svg",
  HR: "CroatiaFlag.svg",
  CY: "CyprusFlag.svg",
  CZ: "CzechFlag.svg",
  DK: "DenmarkFlag.svg",
  EE: "EstoniaFlag.svg",
  FI: "FinlandFlag.svg",
  FR: "FranceFlag.svg",
  DE: "GermanyFlag.svg",
  GY: "GuyanaFlag.svg",
  HK: "HongKongFlag.svg",
  HU: "HungaryFlag.svg",
  IS: "IcelandFlag.svg",
  IN: "IndiaFlag.svg",
  IE: "IrelandFlag.svg",
  IL: "IsraelFlag.svg",
  IT: "ItalyFlag.svg",
  JP: "JapanFlag.svg",
  KW: "KuwaitFlag.svg",
  LT: "LithuaniaFlag.svg",
  LU: "LuxembourgFlag.svg",
  MO: "MacauFlag.svg",
  MT: "MaltaFlag.svg",
  NL: "NetherlandsFlag.svg",
  NZ: "NewZealandFlag.svg",
  NO: "NorwayFlag.svg",
  PA: "PanamaFlag.svg",
  PL: "PolandFlag.svg",
  PT: "PortugalFlag.svg",
  QA: "QatarFlag.svg",
  SM: "SanMarinoFlag.svg",
  SA: "SaudiFlag.svg",
  SG: "SingaporeFlag.svg",
  SI: "SloveniaFlag.svg",
  KR: "SouthKoreaFlag.svg",
  ES: "SpainFlag.svg",
  SE: "SwedenFlag.svg",
  CH: "SwitzerlandFlag.svg",
  TW: "TaiwanFlag.svg",
  AE: "UAEFlag.svg",
  GB: "UKFlag.svg",
  US: "USFlag.svg",
};

/**
 * Formats a timestamp into a human-readable "time ago" string.
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  else if (minutes < 60) return `${minutes} minutes ago`;
  else if (hours < 24) return `${hours} hours ago`;
  else return `${days} days ago`;
}

const UserActivityTable = ({
  selectedFlags,
  percentage,
  url,
  onFilteredActivitiesChange,
}) => {
  const [userActivities, setUserActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        // If 'url' is provided (e.g. "127.0.0.1"), backend will now fuzzy match it
        const endpoint = url
          ? `/api/visitors/user-activities?url=${encodeURIComponent(url)}`
          : `/api/visitors/user-activities`;

        const response = await axios.get(endpoint);

        const formattedData = response.data.map((activity) => ({
          ip: activity.ip,
          country: activity.country,
          timestamp: activity.timestamp,
          type: activity.uniqueVisit ? "New" : "Returning",
          status: activity.active ? "Active" : "Offline",
        }));
        setUserActivities(formattedData);
      } catch (error) {
        console.error("Error fetching user activities:", error);
      }
    };

    fetchUserActivities();
    const interval = setInterval(fetchUserActivities, 5000);
    return () => clearInterval(interval);
  }, [url]);

  const filteredActivities = useMemo(() => {
    // Filter by Country (if flags selected)
    const filteredByCountry = userActivities.filter((activity) => {
      return (
        !selectedFlags ||
        selectedFlags.length === 0 ||
        selectedFlags.some((flag) => flag.id === activity.country)
      );
    });

    // Apply Percentage Cutoff
    const limit = Math.ceil((filteredByCountry.length * percentage) / 100);
    return filteredByCountry.slice(0, limit);
  }, [userActivities, selectedFlags, percentage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedData = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (onFilteredActivitiesChange) {
      onFilteredActivitiesChange(filteredActivities);
    }
  }, [filteredActivities]);

  return (
    <div id="ip__table" className="p-5 mt-10 overflow-x-scroll">
      <h3 className="text-textColor font-GilroysemiBold text-lg mb-5">
        User Activity
      </h3>
      <table className="table-auto w-full bg-primaryColor border-collapse border border-[#142860]">
        <thead className="text-textColor">
          <tr>
            <th className="p-3 border border-[#142860] font-GilroysemiBold text-lg">
              IP Address
            </th>
            <th className="p-3 border border-[#142860] font-GilroysemiBold text-lg">
              Country
            </th>
            <th className="p-3 border border-[#142860] font-GilroysemiBold text-lg">
              Timestamp
            </th>
            <th className="p-3 border border-[#142860] font-GilroysemiBold text-lg">
              Type
            </th>
            <th className="p-3 border border-[#142860] font-GilroysemiBold text-lg">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="text-textColor text-center">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <tr key={index}>
                <td className="p-4 font-GilroysemiBold border border-[#142860] text-secondaryText ">
                  {row.ip}
                </td>
                <td className="p-3 border border-[#142860]">
                  {flagMap[row.country] ? (
                    <img
                      src={`/assets/${flagMap[row.country]}`}
                      alt={row.country}
                      className="w-8 h-8 mx-auto"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : (
                    <span className="font-GilroysemiBold text-secondaryText">
                      {row.country}
                    </span>
                  )}
                  {/* Fallback span if image fails to load */}
                  <span className="font-GilroysemiBold text-secondaryText hidden">
                    {row.country}
                  </span>
                </td>
                <td className="p-3 font-GilroysemiBold text-secondaryText border border-[#142860]">
                  {formatRelativeTime(row.timestamp)}
                </td>
                <td className="p-3 font-GilroysemiBold text-secondaryText border border-[#142860]">
                  {row.type}
                </td>
                <td className="p-3 border border-[#142860]">
                  {row.status === "Active" ? (
                    <span className="text-green-500 font-GilroysemiBold animate-pulse p-2 rounded bg-[#0F2051]">
                      {row.status}
                    </span>
                  ) : (
                    <span className="text-gray-500 p-2 rounded bg-[#0F2051] font-GilroysemiBold ">
                      {row.status}
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-3">
                No user activities available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-start items-center mt-10 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "text-textColor cursor-not-allowed font-GilroysemiBold "
                : "bg-accentColor text-white hover:bg-opacity-90 font-semibold"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-accentColor text-white font-semibold"
                  : "text-gray-200 font-GilroysemiBold "
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "text-textColor cursor-not-allowed font-GilroysemiBold "
                : "bg-accentColor text-white hover:bg-opacity-90 font-semibold"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserActivityTable;
