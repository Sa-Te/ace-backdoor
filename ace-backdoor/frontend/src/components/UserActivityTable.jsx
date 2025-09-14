// src/components/UserActivityTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "../utils/axios";

// Flag icons imported as before...
import AndorraFlag from "../public/assets/AndorraFlag.svg";
import ArubaFlag from "../public/assets/ArubaFlag.svg";
import AustraliaFlag from "../public/assets/AustraliaFlag.svg";
import AustriaFlag from "../public/assets/AustriaFlag.svg";
import BahamasFlag from "../public/assets/BahamasFlag.svg";
import BahrainFlag from "../public/assets/BahrainFlag.svg";
import BelgiumFlag from "../public/assets/BelgiumFlag.svg";
import BruneiFlag from "../public/assets/BruneiFlag.svg";
import CanadaFlag from "../public/assets/CanadaFlag.svg";
import CroatiaFlag from "../public/assets/CroatiaFlag.svg";
import CyprusFlag from "../public/assets/CyprusFlag.svg";
import CzechFlag from "../public/assets/CzechFlag.svg";
import DenmarkFlag from "../public/assets/DenmarkFlag.svg";
import EstoniaFlag from "../public/assets/EstoniaFlag.svg";
import FinlandFlag from "../public/assets/FinlandFlag.svg";
import FranceFlag from "../public/assets/FranceFlag.svg";
import GermanyFlag from "../public/assets/GermanyFlag.svg";
import GuyanaFlag from "../public/assets/GuyanaFlag.svg";
import HongKongFlag from "../public/assets/HongKongFlag.svg";
import HungaryFlag from "../public/assets/HungaryFlag.svg";
import IcelandFlag from "../public/assets/IcelandFlag.svg";
import IndiaFlag from "../public/assets/IndiaFlag.svg";
import IrelandFlag from "../public/assets/IrelandFlag.svg";
import IsraelFlag from "../public/assets/IsraelFlag.svg";
import ItalyFlag from "../public/assets/ItalyFlag.svg";
import JapanFlag from "../public/assets/JapanFlag.svg";
import KuwaitFlag from "../public/assets/KuwaitFlag.svg";
import LithuaniaFlag from "../public/assets/LithuaniaFlag.svg";
import LuxembourgFlag from "../public/assets/LuxembourgFlag.svg";
import MacauFlag from "../public/assets/MacauFlag.svg";
import MaltaFlag from "../public/assets/MaltaFlag.svg";
import NetherlandsFlag from "../public/assets/NetherlandsFlag.svg";
import NewZealandFlag from "../public/assets/NewZealandFlag.svg";
import NorwayFlag from "../public/assets/NorwayFlag.svg";
import PanamaFlag from "../public/assets/PanamaFlag.svg";
import PolandFlag from "../public/assets/PolandFlag.svg";
import PortugalFlag from "../public/assets/PortugalFlag.svg";
import QatarFlag from "../public/assets/QatarFlag.svg";
import SanMarinoFlag from "../public/assets/SanMarinoFlag.svg";
import SaudiFlag from "../public/assets/SaudiFlag.svg";
import SingaporeFlag from "../public/assets/SingaporeFlag.svg";
import SloveniaFlag from "../public/assets/SloveniaFlag.svg";
import SouthKoreaFlag from "../public/assets/SouthKoreaFlag.svg";
import SpainFlag from "../public/assets/SpainFlag.svg";
import SwedenFlag from "../public/assets/SwedenFlag.svg";
import SwitzerlandFlag from "../public/assets/SwitzerlandFlag.svg";
import TaiwanFlag from "../public/assets/TaiwanFlag.svg";
import UAEFlag from "../public/assets/UAEFlag.svg";
import UKFlag from "../public/assets/UKFlag.svg";
import USFlag from "../public/assets/USFlag.svg";

const flagMap = {
  AD: { icon: AndorraFlag, name: "Andorra" },
  AW: { icon: ArubaFlag, name: "Aruba" },
  AU: { icon: AustraliaFlag, name: "Australia" },
  AT: { icon: AustriaFlag, name: "Austria" },
  BS: { icon: BahamasFlag, name: "Bahamas" },
  BH: { icon: BahrainFlag, name: "Bahrain" },
  BE: { icon: BelgiumFlag, name: "Belgium" },
  BN: { icon: BruneiFlag, name: "Brunei" },
  CA: { icon: CanadaFlag, name: "Canada" },
  HR: { icon: CroatiaFlag, name: "Croatia" },
  CY: { icon: CyprusFlag, name: "Cyprus" },
  CZ: { icon: CzechFlag, name: "Czechia" },
  DK: { icon: DenmarkFlag, name: "Denmark" },
  EE: { icon: EstoniaFlag, name: "Estonia" },
  FI: { icon: FinlandFlag, name: "Finland" },
  FR: { icon: FranceFlag, name: "France" },
  DE: { icon: GermanyFlag, name: "Germany" },
  GY: { icon: GuyanaFlag, name: "Guyana" },
  HK: { icon: HongKongFlag, name: "Hong Kong" },
  HU: { icon: HungaryFlag, name: "Hungary" },
  IS: { icon: IcelandFlag, name: "Iceland" },
  IN: { icon: IndiaFlag, name: "India" },
  IE: { icon: IrelandFlag, name: "Ireland" },
  IL: { icon: IsraelFlag, name: "Israel" },
  IT: { icon: ItalyFlag, name: "Italy" },
  JP: { icon: JapanFlag, name: "Japan" },
  KW: { icon: KuwaitFlag, name: "Kuwait" },
  LT: { icon: LithuaniaFlag, name: "Lithuania" },
  LU: { icon: LuxembourgFlag, name: "Luxembourg" },
  MO: { icon: MacauFlag, name: "Macau" },
  MT: { icon: MaltaFlag, name: "Malta" },
  NL: { icon: NetherlandsFlag, name: "Netherlands" },
  NZ: { icon: NewZealandFlag, name: "New Zealand" },
  NO: { icon: NorwayFlag, name: "Norway" },
  PA: { icon: PanamaFlag, name: "Panama" },
  PL: { icon: PolandFlag, name: "Poland" },
  PT: { icon: PortugalFlag, name: "Portugal" },
  QA: { icon: QatarFlag, name: "Qatar" },
  SM: { icon: SanMarinoFlag, name: "San Marino" },
  SA: { icon: SaudiFlag, name: "Saudi Arabia" },
  SG: { icon: SingaporeFlag, name: "Singapore" },
  SI: { icon: SloveniaFlag, name: "Slovenia" },
  KR: { icon: SouthKoreaFlag, name: "South Korea" },
  ES: { icon: SpainFlag, name: "Spain" },
  SE: { icon: SwedenFlag, name: "Sweden" },
  CH: { icon: SwitzerlandFlag, name: "Switzerland" },
  TW: { icon: TaiwanFlag, name: "Taiwan" },
  AE: { icon: UAEFlag, name: "UAE" },
  GB: { icon: UKFlag, name: "UK" },
  US: { icon: USFlag, name: "US" },
};

/**
 * Formats a timestamp into a human-readable "time ago" string.
 * @param {string} timestamp - The ISO 8601 timestamp string.
 * @returns {string} A relative time string (e.g., "5 minutes ago").
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

/**
 * @file UserActivityTable.jsx
 * @description This component fetches and displays a live-updating table of recent visitor
 * activity for a specific URL. It polls the server for new data every 5 seconds.
 */
const UserActivityTable = ({
  selectedFlags,
  percentage,
  url,
  onFilteredActivitiesChange,
}) => {
  const [userActivities, setUserActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        const response = await axios.get(
          `/api/visitors/user-activities?url=${encodeURIComponent(url)}`
        );
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
    const interval = setInterval(fetchUserActivities, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [url]);

  const filteredActivities = useMemo(() => {
    const filteredByCountry = userActivities.filter((activity) => {
      return (
        selectedFlags.length === 0 ||
        selectedFlags.some((flag) => flag.id === activity.country)
      );
    });

    const numberOfActivities = Math.ceil(
      (filteredByCountry.length * percentage) / 100
    );

    return filteredByCountry.slice(0, numberOfActivities);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                      src={flagMap[row.country].icon}
                      alt={flagMap[row.country].name}
                      className="w-8 h-8 mx-auto "
                    />
                  ) : (
                    <span className="font-GilroysemiBold text-secondaryText">
                      {row.country}
                    </span>
                  )}
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
