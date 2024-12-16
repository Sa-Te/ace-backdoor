// src/components/ConditionFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

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
  AD: { name: "Andorra", icon: AndorraFlag },
  AW: { name: "Aruba", icon: ArubaFlag },
  AU: { name: "Australia", icon: AustraliaFlag },
  AT: { name: "Austria", icon: AustriaFlag },
  BS: { name: "Bahamas", icon: BahamasFlag },
  BH: { name: "Bahrain", icon: BahrainFlag },
  BE: { name: "Belgium", icon: BelgiumFlag },
  BN: { name: "Brunei", icon: BruneiFlag },
  CA: { name: "Canada", icon: CanadaFlag },
  HR: { name: "Croatia", icon: CroatiaFlag },
  CY: { name: "Cyprus", icon: CyprusFlag },
  CZ: { name: "Czechia", icon: CzechFlag },
  DK: { name: "Denmark", icon: DenmarkFlag },
  EE: { name: "Estonia", icon: EstoniaFlag },
  FI: { name: "Finland", icon: FinlandFlag },
  FR: { name: "France", icon: FranceFlag },
  DE: { name: "Germany", icon: GermanyFlag },
  GY: { name: "Guyana", icon: GuyanaFlag },
  HK: { name: "Hong Kong", icon: HongKongFlag },
  HU: { name: "Hungary", icon: HungaryFlag },
  IS: { name: "Iceland", icon: IcelandFlag },
  IN: { name: "India", icon: IndiaFlag },
  IE: { name: "Ireland", icon: IrelandFlag },
  IL: { name: "Israel", icon: IsraelFlag },
  IT: { name: "Italy", icon: ItalyFlag },
  JP: { name: "Japan", icon: JapanFlag },
  KW: { name: "Kuwait", icon: KuwaitFlag },
  LT: { name: "Lithuania", icon: LithuaniaFlag },
  LU: { name: "Luxembourg", icon: LuxembourgFlag },
  MO: { name: "Macau", icon: MacauFlag },
  MT: { name: "Malta", icon: MaltaFlag },
  NL: { name: "Netherlands", icon: NetherlandsFlag },
  NZ: { name: "New Zealand", icon: NewZealandFlag },
  NO: { name: "Norway", icon: NorwayFlag },
  PA: { name: "Panama", icon: PanamaFlag },
  PL: { name: "Poland", icon: PolandFlag },
  PT: { name: "Portugal", icon: PortugalFlag },
  QA: { name: "Qatar", icon: QatarFlag },
  SM: { name: "San Marino", icon: SanMarinoFlag },
  SA: { name: "Saudi Arabia", icon: SaudiFlag },
  SG: { name: "Singapore", icon: SingaporeFlag },
  SI: { name: "Slovenia", icon: SloveniaFlag },
  KR: { name: "South Korea", icon: SouthKoreaFlag },
  ES: { name: "Spain", icon: SpainFlag },
  SE: { name: "Sweden", icon: SwedenFlag },
  CH: { name: "Switzerland", icon: SwitzerlandFlag },
  TW: { name: "Taiwan", icon: TaiwanFlag },
  AE: { name: "United Arab Emirates", icon: UAEFlag },
  GB: { name: "United Kingdom", icon: UKFlag },
  US: { name: "United States", icon: USFlag },
};

const ConditionFilter = ({
  url,
  fetchRules,
  selectedFlags,
  setSelectedFlags,
  percentage,
  setPercentage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [scripts, setScripts] = useState([]);
  const [selectedScriptId, setSelectedScriptId] = useState(null);
  const inputRef = useRef(null);

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
        toast.error("Failed to load scripts.");
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
    const countryObj = flagMap[code];
    if (!selectedFlags.find((flag) => flag.id === code)) {
      if (countryObj) {
        setSelectedFlags([
          ...selectedFlags,
          { id: code, name: countryObj.name, icon: countryObj.icon },
        ]);
      } else {
        setSelectedFlags([...selectedFlags, { id: code, name: code }]);
      }
    }
  };

  const handleRemoveFlag = (flagId) => {
    setSelectedFlags(selectedFlags.filter((flag) => flag.id !== flagId));
  };

  const handlePercentageChange = (e) => {
    setPercentage(parseInt(e.target.value, 10));
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
    if (!url) {
      toast.warn("No URL is selected.");
      return;
    }
    const countries = selectedFlags.map((f) => f.id);
    if (!selectedScriptId) {
      toast.warn("Please select a script for this rule.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
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
    } catch (error) {
      console.error("Error saving rule:", error);
      toast.error("Failed to save rule.");
    }
  };

  return (
    <div
      id="settings__filter__section"
      className="p-5 flex flex-wrap justify-start items-center gap-6 bg-primaryColor rounded-lg"
    >
      {/* Country Input */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor font-GilroysemiBold text-sm">
          Countries Input
        </label>
        <div
          className="flex items-center flex-wrap gap-2 p-2 bg-primaryColor text-textColor  rounded border-[1px] border-[#142860] min-h-[3rem]"
          onClick={() => inputRef.current.focus()}
        >
          {selectedFlags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center gap-1 bg-[#142860] p-1 rounded shadow"
            >
              {flag.icon && (
                <img src={flag.icon} alt={flag.name} className="w-6 h-6" />
              )}
              <span>{flag.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFlag(flag.id);
                }}
                className="text-[#FFFFFF] font-bold px-1"
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
            className="bg-primaryColor text-secondaryText font-GilroysemiBold outline-none flex-grow min-w-[5rem]"
            placeholder="Type country codes..."
          />
        </div>
      </div>

      {/* Percentage Filter */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor font-GilroysemiBold">
          Percentage Filter
        </label>
        <div className="flex items-center gap-4 border-[1px] border-[#142860] p-3 rounded bg-primaryColor mt-1">
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={handlePercentageChange}
            className="w-full"
          />
          <span className="text-secondaryText  font-GilroysemiBold text-sm">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Script Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-textColor  font-GilroysemiBold text-sm">
          Select Script
        </label>
        <select
          className="p-3 bg-primaryColor text-secondaryText border-[1px] border-[#142860]  font-GilroysemiBold rounded"
          value={selectedScriptId || ""}
          onChange={(e) => setSelectedScriptId(e.target.value)}
        >
          <option value="" className=" font-GilroysemiBold text-secondaryText">
            -- Select a script --
          </option>
          {scripts.map((scr) => (
            <option
              key={scr.id}
              value={scr.id}
              className=" font-GilroysemiBold text-secondaryText"
            >
              {scr.name}
            </option>
          ))}
        </select>
      </div>

      {/* Save Rule Button */}
      <div className="mt-6">
        <button
          onClick={handleSaveRule}
          className="bg-accentColor text-white font-GilroysemiBold p-4 rounded hover:bg-opacity-90"
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

export default ConditionFilter;
