const SEARCH_OPERATIONS = require("../constants/searchOperations");

const validateSearch = (search) => (search.value === undefined ? null : search);

const validateSearchList = (search) => {
  search.value = (search.value || []).filter(Boolean);
  return search.value.length === 0 ? null : search;
};

const equal = (param, value) =>
  validateSearch({
    param: param,
    match: SEARCH_OPERATIONS.EQUAL,
    value: value,
  });

const includes = (param, value) =>
  validateSearch({
    param: param,
    match: SEARCH_OPERATIONS.INCLUDES,
    value: value,
  });

const contains = (param, value) =>
  validateSearch({
    param: param,
    match: SEARCH_OPERATIONS.CONTAINS,
    value: value,
  });

const and = (params) =>
  validateSearchList({
    match: SEARCH_OPERATIONS.AND,
    value: params,
  });

const or = (params) =>
  validateSearchList({
    match: SEARCH_OPERATIONS.OR,
    value: params,
  });

module.exports = {
  equal,
  and,
  or,
  contains,
  includes,
};
