const get = require('lodash.get');
const SEARCH_OPERATIONS = require('../constants/searchOperations');

const match = (object, option) => {
    switch(option.match) {
        case SEARCH_OPERATIONS.EQUAL:
            return option.value === get(object, option.param);
        case SEARCH_OPERATIONS.CONTAINS:
            return (get(object, option.param) || '').contains(option.value);
        case SEARCH_OPERATIONS.INCLUDES:    
            return (get(object, option.param) || '').includes(option.value);
        case SEARCH_OPERATIONS.AND:    
            return allMatch(object, option.value);

        case SEARCH_OPERATIONS.OR:    
            return someMatch(object, option.value);   
        default: 
            throw new Error(`Unknown operation ${option.match} encountered`);
    }
};

const someMatch = (object, options) => {
    return options.some( option => match(object, option));
};

const allMatch = (object, options) => {
    return options.every( option => match(object, option));
};

const search = (objects, searchOption) => {
    return (objects || []).filter( object => object && match(object, searchOption));
}

module.exports = search;
