const getUnitData = (unit) => {
    const lowercaseUnit = (unit || '').toLowerCase();
    switch(lowercaseUnit) {
        case 'mi': 
            return { unit: 'mi', earthRadius: 3958.8 }
        default:
            return { unit: 'km', earthRadius: 6371 }
    }
}

const getDistance = (fromCity, toCity, unit) => {
    const conversion = getUnitData(unit);
    // Haversine Formula:
    const deg2rad = deg => deg * (Math.PI / 180);
    const dLat = deg2rad(toCity.latitude - fromCity.latitude);  // Convert latitude difference to radians
    const dLon = deg2rad(toCity.longitude - fromCity.longitude);  // Convert longitude difference to radians
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(fromCity.latitude)) * Math.cos(deg2rad(toCity.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distance = conversion.earthRadius * c; 
    return { 
        distance: Number(distance.toFixed(2)),
        unit: conversion.unit,
        from: fromCity,
        to: toCity,
    }
}

const getCitiesInArea = (cites, origin, distance, unit) => {
        // you could also do a presort beforehand to eliminate most of the data beforehand to improve the performance 
        // TODO: find out if active=false cities should be excluded
        return cites
        .filter( city => city.guid !== origin.guid && getDistance(origin, city, unit).distance <= distance)
        .sort( (cityA, cityB) => cityB.distance - cityA.distance)
}

module.exports = {
    getDistance,
    getCitiesInArea,
    getUnitData,
};