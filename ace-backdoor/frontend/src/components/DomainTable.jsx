// src/components/DomainTable.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import domainIcon from "../public/assets/icons/domain.svg";
import lastVisitIcon from "../public/assets/icons/lastVisit.svg";
import visitorIcon from "../public/assets/icons/visitorIcon.svg";
import modifyIcon from "../public/assets/icons/modifyIcon.svg";
import folderIcon from "../public/assets/icons/folderIcon.svg";

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
 * Generates a URL to fetch a website's favicon using a public Google service.
 * @param {string} domain - The domain of the website.
 * @returns {string} The URL for the favicon image.
 */
function getFavicon(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

/**
 * @file DomainTable.jsx
 * @description A React component that displays aggregated visitor statistics grouped by domain.
 * It features sorting, pagination, and expandable rows to show detailed stats for individual URLs.
 */
const DomainTable = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // 1) Sort data by lastVisit DESC
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.lastVisit);
    const dateB = new Date(b.lastVisit);
    return dateB - dateA; // newest first
  });

  // 2) Now paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRow = (domain, hasUrls) => {
    if (hasUrls) {
      setExpandedRow(expandedRow === domain ? null : domain);
    }
  };

  const handleOpen = (url) => {
    navigate(`/settings/${encodeURIComponent(url)}`);
  };

  return (
    <div className="overflow-x-auto bg-primaryColor p-5 rounded-lg mt-5">
      <table className="table-auto w-full text-center border-collapse border border-[#142860]">
        <thead>
          <tr className="text-textColor bg-primaryColor">
            <th className="p-3 border border-[#142860] bg-primaryColor">
              <div className="flex items-center justify-center gap-2">
                <img src={domainIcon} alt="Domain Icon" className="w-5 h-5" />
                <span className="font-GilroysemiBold text-lg">Domain</span>
              </div>
            </th>
            <th className="p-3 border border-[#142860] bg-primaryColor">
              <div className="flex items-center justify-center gap-2">
                <img
                  src={lastVisitIcon}
                  alt="Last Visit Icon"
                  className="w-5 h-5"
                />
                <span className="font-GilroysemiBold text-lg">Last Visit</span>
              </div>
            </th>
            <th className="p-3 border border-[#142860] bg-primaryColor">
              <div className="flex items-center justify-center gap-2">
                <img
                  src={visitorIcon}
                  alt="Visitors Icon"
                  className="w-5 h-5"
                />
                <span className="font-GilroysemiBold text-lg">Visitors</span>
              </div>
            </th>
            <th className="p-3 border border-[#142860] bg-primaryColor">
              <div className="flex items-center justify-center gap-2">
                <img src={modifyIcon} alt="Modified Icon" className="w-5 h-5" />
                <span className="font-GilroysemiBold text-lg">
                  Unique Visitors
                </span>
              </div>
            </th>
            <th className="p-3 border border-[#142860] bg-primaryColor">
              <div className="flex items-center justify-center gap-2">
                <img
                  src={visitorIcon}
                  alt="Recent Visitors Icon"
                  className="w-5 h-5"
                />
                <span className="font-GilroysemiBold text-lg">
                  Visitors (Today)
                </span>
              </div>
            </th>
            <th className="p-3 border border-[#142860] bg-primaryColor"></th>
          </tr>
        </thead>
        <tbody className="text-textColor">
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => {
              const mainUrl =
                row.urls.length > 0 ? row.urls[0].url : `http://${row.domain}`;
              const isExpanded = expandedRow === row.domain;

              return (
                <React.Fragment key={row.domain}>
                  <tr
                    onClick={() =>
                      toggleRow(row.domain, row.urls && row.urls.length > 0)
                    }
                    className={`${
                      row.urls.length > 0
                        ? "hover:bg-gray-800 cursor-pointer"
                        : ""
                    }`}
                  >
                    <td
                      className={`p-3 border border-[#142860] flex flex-wrap items-center font-GilroysemiBold justify-center gap-2 ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      <img
                        src={getFavicon(row.domain)}
                        alt="Favicon"
                        className="w-4 h-4"
                      />
                      <span className="font-GilroysemiBold text-lg text-[#98B3FF]">
                        {row.domain}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(row.domain);
                        }}
                        className="flex items-center gap-1 underline text-accentColor font-GilroysemiBold text-sm"
                      >
                        Open
                      </button>
                    </td>
                    <td
                      className={`p-3 border font-GilroysemiBold text-[#98B3FF] border-[#142860] ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      {row.lastVisit
                        ? formatRelativeTime(row.lastVisit)
                        : "N/A"}
                    </td>
                    <td
                      className={`p-3 text-[#98B3FF] font-GilroysemiBold border border-[#142860] ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      {row.visitors || 0}
                    </td>
                    <td
                      className={`p-3 text-[#98B3FF] border font-GilroysemiBold border-[#142860] ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      {row.uniqueVisitors || 0}
                    </td>
                    <td
                      className={`p-3 text-[#98B3FF] border font-GilroysemiBold border-[#142860] ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      {row.recentUniqueVisitors || 0}
                    </td>
                    <td
                      className={`p-3 border font-GilroysemiBold border-[#142860] ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      {row.urls.length > 0 && isExpanded
                        ? "▲"
                        : row.urls.length > 0
                        ? "▼"
                        : ""}
                    </td>
                  </tr>
                  {isExpanded &&
                    row.urls.length > 0 &&
                    row.urls.map((subRow, idx) => {
                      // Safely determine if the URL is a web URL or a local file
                      let isWebUrl = false;
                      let displayPath = subRow.url;
                      let subDomainForIcon = null;

                      try {
                        const urlObject = new URL(subRow.url);
                        if (
                          urlObject.protocol === "http:" ||
                          urlObject.protocol === "https:"
                        ) {
                          isWebUrl = true;
                          subDomainForIcon = urlObject.hostname;
                          displayPath = urlObject.pathname; // Show only the path for web URLs
                        } else if (urlObject.protocol === "file:") {
                          // For file URLs, show the filename
                          displayPath = urlObject.pathname.split("/").pop();
                        }
                      } catch (e) {
                        // If URL parsing fails, just display the raw string
                        displayPath = subRow.url;
                      }

                      const subRowClasses =
                        idx === 0
                          ? "border-t-[2px] border-dashed border-[#142860]"
                          : "";

                      return (
                        <tr
                          key={idx}
                          className={`${subRowClasses} hover:bg-gray-700`}
                        >
                          <td className="p-3 text-[#98B3FF] font-GilroysemiBold flex items-center justify-center gap-2">
                            {/* Conditionally render the favicon */}
                            {isWebUrl && subDomainForIcon && (
                              <img
                                src={getFavicon(subDomainForIcon)}
                                alt="Favicon"
                                className="w-4 h-4"
                              />
                            )}
                            {displayPath}
                          </td>
                          <td className="p-3 border-l border-r border-[#142860] font-GilroysemiBold text-[#98B3FF]">
                            {subRow.lastVisit
                              ? formatRelativeTime(subRow.lastVisit)
                              : "N/A"}
                          </td>
                          <td className="p-3 text-[#98B3FF] font-GilroysemiBold border-l border-r border-[#142860]">
                            {subRow.visitors || 0}
                          </td>
                          <td className="p-3 text-[#98B3FF] font-GilroysemiBold border-l border-r border-[#142860]">
                            {subRow.uniqueVisitors || 0}
                          </td>
                          <td className="p-3 text-[#98B3FF] font-GilroysemiBold border-l border-r border-[#142860]">
                            {subRow.recentUniqueVisitors || 0}
                          </td>
                          <td className="pl-10 border-l border-r border-[#142860] ">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpen(subRow.url);
                              }}
                              className="flex items-center justify-center gap-2 text- font-GilroysemiBold underline "
                            >
                              <img
                                src={folderIcon}
                                alt="Folder Icon"
                                className="w-5 h-5"
                              />
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="p-3 border border-[#142860]">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-start items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "text-textColor cursor-not-allowed font-semibold"
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
                  ? "text-textColor font-semibold"
                  : "text-gray-200 font-semibold"
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
                ? "text-textColor cursor-not-allowed font-semibold"
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

export default DomainTable;
