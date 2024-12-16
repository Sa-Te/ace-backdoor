// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FilterSection from "../components/FilterSection";
import DomainTable from "../components/DomainTable";
import Footer from "../components/Footer";
import axios from "../utils/axios";

const Dashboard = () => {
  const [data, setData] = useState([]); // Aggregated data by domain
  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visitorRange, setVisitorRange] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You must be logged in to view this page.");
          window.location.href = "/login";
          return;
        }

        const response = await axios.get("/api/visitors", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const preparedData = prepareData(response.data);
        setData(preparedData);
        setFilteredData(preparedData);
        console.log("Prepared Data:", preparedData); // For debugging
      } catch (error) {
        console.error("Error fetching visitors:", error);
        toast.error("Failed to fetch visitors. Please log in again.");
        window.location.href = "/login";
      }
    };

    fetchVisitors();
  }, []);

  const prepareData = (rawData) => {
    const normalizeUrl = (url) => {
      try {
        return new URL(url).href; // Valid URL
      } catch {
        return `http://${url}`; // Add http:// if missing
      }
    };

    return rawData.reduce((acc, visitor) => {
      const normalizedUrl = normalizeUrl(visitor.url);
      let domain;
      try {
        domain = new URL(normalizedUrl).hostname;
      } catch (error) {
        console.error(`Invalid URL: ${normalizedUrl}`);
        return acc; // Skip invalid URLs
      }

      let existingDomain = acc.find((item) => item.domain === domain);

      if (existingDomain) {
        existingDomain.visitors += 1;
        existingDomain.uniqueVisitors += visitor.uniqueVisit ? 1 : 0;
        existingDomain.lastVisit =
          new Date(visitor.timestamp) > new Date(existingDomain.lastVisit)
            ? visitor.timestamp
            : existingDomain.lastVisit;

        let existingUrl = existingDomain.urls.find(
          (item) => item.url === normalizedUrl
        );

        if (existingUrl) {
          existingUrl.visitors += 1;
          existingUrl.uniqueVisitors += visitor.uniqueVisit ? 1 : 0;
          existingUrl.lastVisit =
            new Date(visitor.timestamp) > new Date(existingUrl.lastVisit)
              ? visitor.timestamp
              : existingUrl.lastVisit;
        } else {
          existingDomain.urls.push({
            url: normalizedUrl,
            lastVisit: visitor.timestamp,
            visitors: 1,
            uniqueVisitors: visitor.uniqueVisit ? 1 : 0,
          });
        }
      } else {
        acc.push({
          domain,
          lastVisit: visitor.timestamp,
          visitors: 1,
          uniqueVisitors: visitor.uniqueVisit ? 1 : 0,
          urls: [
            {
              url: normalizedUrl,
              lastVisit: visitor.timestamp,
              visitors: 1,
              uniqueVisitors: visitor.uniqueVisit ? 1 : 0,
            },
          ],
        });
      }

      return acc;
    }, []);
  };

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

    console.log("Filtered Data:", filtered); // For debugging
    setFilteredData(filtered);
  };

  useEffect(() => {
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
