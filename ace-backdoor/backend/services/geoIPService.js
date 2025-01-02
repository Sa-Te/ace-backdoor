const maxmind = require("maxmind");
const path = require("path");

let lookup;

const loadDatabase = async () => {
  const dbPath = path.resolve(__dirname, "../data/GeoLite2-City.mmdb");
  lookup = await maxmind.open(dbPath);
};

const getCountry = (ip) => {
  if (!lookup) return "Unknown";
  const geo = lookup.get(ip);
  return geo?.country?.iso_code || "Unknown";
};

const getFullGeoData = (ip) => {
  if (!lookup)
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  const geo = lookup.get(ip);
  return {
    country: geo?.country?.iso_code || "Unknown",
    region: geo?.subdivisions?.[0]?.names?.en || "Unknown",
    city: geo?.city?.names?.en || "Unknown",
  };
};

module.exports = { loadDatabase, getCountry, getFullGeoData };
