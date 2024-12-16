// services/geoIPService.js
const geoip = require("geoip-lite");

const getCountry = (ip) => {
  const geo = geoip.lookup(ip);
  const country = geo?.country || "Unknown";
  return country.length <= 50 ? country : "Unknown"; // Ensure length fits in the database
};

const getFullGeoData = (ip) => {
  const geo = geoip.lookup(ip);
  return {
    country: geo?.country || "Unknown",
    region: geo?.region || "Unknown",
    city: geo?.city || "Unknown",
  };
};

module.exports = { getCountry, getFullGeoData };
