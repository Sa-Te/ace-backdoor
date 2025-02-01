// src/components/RulesTable.jsx
import React from "react";

// If you have a separate file for flagMap, import it, e.g.:
// import { flagMap } from "../utils/flagMap";

// Otherwise, define it here again (ensure it matches the one in ConditionFilter):
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

const RulesTable = ({ rules, onDeleteRule, onRuleToggled }) => {
  // We expect a function `onRuleToggled(ruleId, newActiveValue)` from parent,
  // which calls the API to update isActive.

  return (
    <div className="overflow-x-auto bg-primaryColor p-5 rounded-lg mt-5">
      <h3 className="text-textColor font-GilroyBold text-xl mb-3">
        Existing Rules
      </h3>
      <table className="table-auto w-full text-center border-[1px] border-[#142860]">
        <thead>
          <tr className="text-textColor bg-primaryColor border-[1px] border-[#142860]">
            <th className="p-3 font-GilroysemiBold">Countries</th>
            <th className="p-3 font-GilroysemiBold">Percentage</th>
            <th className="p-3 font-GilroysemiBold">Script</th>
            <th className="p-3 font-GilroysemiBold">Status</th>
            <th className="p-3 font-GilroysemiBold">Action</th>
          </tr>
        </thead>
        <tbody className="text-textColor">
          {rules.length > 0 ? (
            rules.map((rule) => {
              const { id, countries, percentage, script, isActive } = rule;
              const rowClass = isActive ? "bg-green-700" : "";

              const countriesDisplay = Array.isArray(countries)
                ? countries.map((code, i) => {
                    const countryObj = flagMap[code];
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 mr-2"
                      >
                        {countryObj && (
                          <img
                            src={countryObj.icon}
                            alt={countryObj.name}
                            className="w-6 h-6 inline-block"
                          />
                        )}
                      </span>
                    );
                  })
                : null;

              return (
                <tr
                  key={id}
                  className={`border-[1px] border-[#142860] ${rowClass}`}
                >
                  <td className="p-3">{countriesDisplay}</td>
                  <td className="p-3 font-GilroysemiBold text-secondaryText">
                    {percentage}%
                  </td>
                  <td className="p-3 font-GilroysemiBold text-secondaryText">
                    {script ? script.name : "No Script Selected"}
                  </td>
                  <td className="p-3 font-GilroysemiBold">
                    {isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => onRuleToggled(id, !isActive)}
                      className={`font-GilroysemiBold p-3 rounded ${
                        isActive
                          ? "text-red-500 bg-gray-700"
                          : "text-green-500 bg-[#0F2051]"
                      }`}
                    >
                      {isActive ? "Deselect" : "Select"}
                    </button>
                    <button
                      onClick={() => onDeleteRule(id)}
                      className="text-[#F54A4A] font-GilroysemiBold p-3 rounded bg-[#0F2051]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="p-3">
                No rules applied.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RulesTable;
