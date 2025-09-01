/**
 * @file Manages the MaxMind GeoLite2 database for IP-to-country lookups.
 * @description This service is responsible for loading the .mmdb database file from memory
 * and providing simple functions to retrieve geographical data from an IP address.
 */

const maxmind = require("maxmind");
const path = require("path");

// Holds the in-memory database instance once loaded.
let lookup;

/**
 * Asynchronously loads the GeoLite2-City.mmdb database into memory.
 * This should be called once when the application starts.
 * @throws {Error} If the database file cannot be found or opened.
 */
const loadDatabase = async () => {
  // IMPORTANT: This file must exist at this path for the service to work.
  const dbPath = path.resolve(__dirname, "../data/GeoLite2-City.mmdb");
  lookup = await maxmind.open(dbPath);
};

/**
 * Looks up an IP address and returns its two-letter country ISO code.
 * @param {string} ip - The IP address to look up.
 * @returns {string} The ISO country code (e.g., "US", "GB") or "Unknown" if not found.
 */
const getCountry = (ip) => {
  if (!lookup) return "Unknown";
  const geo = lookup.get(ip);
  return geo?.country?.iso_code || "Unknown";
};

/**
 * Looks up an IP address and returns a full set of geographical data.
 * @param {string} ip - The IP address to look up.
 * @returns {object} An object containing country, region, and city.
 */
const getFullGeoData = (ip) => {
  if (!lookup) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }
  const geo = lookup.get(ip);
  return {
    country: geo?.country?.iso_code || "Unknown",
    region: geo?.subdivisions?.[0]?.names?.en || "Unknown",
    city: geo?.city?.names?.en || "Unknown",
  };
};

module.exports = { loadDatabase, getCountry, getFullGeoData };
