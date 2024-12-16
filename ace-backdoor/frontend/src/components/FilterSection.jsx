// src/components/FilterSection.jsx
import React from "react";
import searchIcon from "../public/assets/icons/searchIcon.svg";

const FilterSection = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  visitorRange,
  setVisitorRange,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div
      id="filter__section"
      className="flex flex-wrap gap-10 p-5 bg-primaryColor rounded-lg items-center justify-between"
    >
      {/* Date From */}
      <div className="flex flex-col">
        <label className="text-[.8em] font-GilroysemiBold text-textColor mb-2">
          Date From
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-primaryColor text-secondaryText py-4 px-6 rounded focus:outline-none border-[1px] border-[#142860]  font-GilroysemiBold"
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col">
        <label className="text-[.8em]  font-GilroysemiBold text-textColor mb-2">
          Date To
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-primaryColor text-secondaryText py-4 px-6 rounded focus:outline-none border-[1px] border-[#142860]  font-GilroysemiBold"
        />
      </div>

      {/* Visitors Dropdown */}
      <div className="flex flex-col">
        <label className="text-[.8em]  font-GilroysemiBold text-textColor mb-2">
          Visitors
        </label>
        <select
          value={visitorRange}
          onChange={(e) => setVisitorRange(e.target.value)}
          className="bg-primaryColor text-secondaryText py-4 px-6 rounded focus:outline-none border-[1px] border-[#142860]  font-GilroysemiBold"
        >
          <option value="">Select Range</option>
          <option value="0-100">0-100</option>
          <option value="100-200">100-200</option>
          <option value="200-300">200-300</option>
          <option value="300-400">300-400</option>
          <option value="400+">400+</option>
        </select>
      </div>

      {/* Search Box */}
      <div className="flex mt-5 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search.."
          className="bg-primaryColor py-4 px-6 rounded focus:outline-none border-[1px] border-[#142860] placeholder:text-textColor placeholder: font-GilroysemiBold text-white "
        />
        <img
          src={searchIcon}
          alt="Search Icon"
          className="absolute right-4 top-4 w-5 cursor-pointer "
        />
      </div>
    </div>
  );
};

export default FilterSection;
