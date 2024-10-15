const cities = require("../../../addresses.json");
const builder = require("../../../core/services/searchQueryBuilder");
const search = require("../../../core/services/searchService");

/**
 * Disclaimer: this could have been done with a simple filter,
 * but I have selected this option as I think transition to an actual database would be smoother
 * and filter for multiple queries could be hard to read.
 */
const searchCity = (query) => {
  const searchQuery = builder.and([
    builder.includes("tags", query.tag),
    builder.equal("isActive", query.isActive),
    builder.equal("guid", query.guid),
  ]);

  if (searchQuery) {
    return search(cities, searchQuery);
  } else {
    throw new Error("Search query is null");
  }
};

const getCityByGuid = (guid) => {
  return cities.find((city) => city.guid === guid);
};

const getAllCities = (page, size) => ({
  cities: cities.slice(page, size),
  page,
  size,
  total: cities.length,
});

module.exports = {
  searchCity,
  getCityByGuid,
  getAllCities,
};
