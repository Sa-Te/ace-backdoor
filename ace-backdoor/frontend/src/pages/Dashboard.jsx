import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FilterSection from "../components/FilterSection";
import DomainTable from "../components/DomainTable";
import Footer from "../components/Footer";
import axios from "../utils/axios";
import { toast } from "react-toastify";

/**
 * @file Dashboard.jsx
 * @description The main dashboard page of the application. It displays an overview of all
 * tracked domains and provides filtering capabilities.
 */
const Dashboard = () => {
  const [data, setData] = useState([]); // Aggregated data by domain
  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visitorRange, setVisitorRange] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    /**
     * Fetches the aggregated dashboard statistics from the server when the component mounts.
     * It also handles authentication by checking for a token and redirecting if not found.
     */
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You must be logged in to view this page.");
          window.location.href = "/login";
          return;
        }

        const response = await axios.get("/api/visitors/dashboard-stats");

        setData(response.data);
        setFilteredData(response.data);
        // console.log("Dashboard Stats:", response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to fetch stats. Please log in again.");
        window.location.href = "/login";
      }
    };

    fetchDashboardStats();
  }, []);

  /**
   * @deprecated This function is no longer used for data processing as all aggregation
   * and normalization is now handled by the backend API. It can be safely removed.
   */
  function canonicalizeUrl(rawUrl) {
    try {
      const u = new URL(rawUrl);

      // 1) Force protocol to https if you want everything consistent:
      // (Optional; comment out if you don't want to override)
      u.protocol = "https:";

      // 2) Remove a trailing slash if present (so /index.html/ becomes /index.html)
      if (u.pathname.endsWith("/")) {
        u.pathname = u.pathname.slice(0, -1);
      }

      // 3) Example: also remove “www.” if you don’t want that distinct
      if (u.hostname.startsWith("www.")) {
        u.hostname = u.hostname.replace("www.", "");
      }

      return u.href;
    } catch (e) {
      // If it's not a valid URL, fallback
      return `https://${rawUrl.replace(/\/+$/, "")}`; // remove trailing slash
    }
  }

  /**
   * Applies client-side filtering to the dashboard data based on user selections
   * in the FilterSection component.
   */
  const handleFilter = () => {
    let filtered = [...data];

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(
        (item) => new Date(item.lastVisit) >= fromDate
      );
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter((item) => new Date(item.lastVisit) <= toDate);
    }

    // Visitor range filtering
    if (visitorRange) {
      if (visitorRange === "400+") {
        filtered = filtered.filter((item) => item.visitors >= 400);
      } else {
        const [min, max] = visitorRange.split("-").map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          filtered = filtered.filter(
            (item) => item.visitors >= min && item.visitors <= max
          );
        } else {
          console.warn(`Invalid visitorRange: ${visitorRange}`);
        }
      }
    }

    // Search functionality
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    //console.log("Filtered Data:", filtered); // For debugging
    setFilteredData(filtered);
  };

  useEffect(() => {
    /**
     * Re-runs the filtering logic whenever any of the filter state variables change.
     */
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, visitorRange, searchTerm]);

  return (
    <Layout>
      <h2 className="text-4xl font-GilroyBold p-4 text-white">Dashboard</h2>
      <FilterSection
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        visitorRange={visitorRange}
        setVisitorRange={setVisitorRange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <DomainTable data={filteredData} />
      <div className="mt-20">
        <Footer />
      </div>
    </Layout>
  );
};

export default Dashboard;
