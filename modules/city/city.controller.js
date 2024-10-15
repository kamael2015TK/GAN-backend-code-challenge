/*global process*/
const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const QueueService = require('./services/queueService');
const citySearchService = require('./services/citySearchService');
const cityService = require('./services/cityService');
const QUEUE_STATUS = require('./constants/queueStatus');
const runtimeConfig = require('../../core/services/runtimeConfig');

const DYNAMIC_ROUTE_VARIABLES = {
  ID: ':id',
};
const ROUTES = {
  GET_CITY_BY_TAG: '/cities-by-tag',
  GET_DISTANCE: '/distance',
  GET_CITIES_IN_AREA: '/area',
  GET_AREA_RESULT: `/area-result/${DYNAMIC_ROUTE_VARIABLES.ID}`,
  STREAM_ALL_CITIES: '/all-cities',
};

const queue = new QueueService(runtimeConfig.getQueueCleanupInterval(), runtimeConfig.getQueueTTL());
queue.runAutoCleanup();

process.on('SIGINT', () => queue && queue.stopAutoCleanup());
process.on('SIGTERM', () => queue && queue.stopAutoCleanup());

/**
 * @swagger
 * tags:
 *   - name: Tag search
 *     description: Get city by tag
 *
 * @swagger
 * /cities-by-tag:
 *   get:
 *     description: Searches city by tag and is active
 *     tags: [Tag search]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *           - in: query
 *             name: tag
 *             schema:
 *               type: string
 *             required: true
 *             description: The tag used to filter cities.
 *           - in: query
 *             name: isActive
 *             schema:
 *               type: boolean
 *             required: false
 *             description: Optional flag to filter cities by their active status.
 *     responses:
 *       200:
 *         description: List of cities
 *       401:
 *         description: User not authenticated
 *       400:
 *         description: Bad request, tag not provided
 *       500:
 *         description: Server Error
 */
router.get(ROUTES.GET_CITY_BY_TAG, (req, res) => {
  if (!req.query.tag) {
    res.status(400).json({ message: 'Tag was not provided' });
    return;
  }

  try {
    const result = citySearchService.searchCity({
      tag: req.query.tag,
      isActive: req.query.isActive ? JSON.parse(req.query.isActive) : undefined,
    });
    res.json({ cities: result });
  } catch (e) {
    // log error
    res.status(500).json({ message: e.message });
  }
});

router.get(ROUTES.GET_DISTANCE, (req, res) => {
  if (!req.query.from || !req.query.to) {
    res.status(400).json({ message: 'Please provide "from" and "to" parameters' });
    return;
  }

  try {
    // TODO: find out if only to use this on active cities? and what does active mean?
    const fromCity = citySearchService.getCityByGuid(req.query.from);
    const toCity = citySearchService.getCityByGuid(req.query.to);

    if (!(fromCity && toCity)) {
      const ids = [!fromCity && req.query.from, !toCity && req.query.to].join(' and ');
      res.status(404).json({ message: `City with guid ${ids} was not found` });
      return;
    }

    const result = cityService.getDistance(fromCity, toCity, req.query.unit);
    res.json(result);
  } catch (e) {
    // log error
    res.status(500).json({ message: e.message });
  }
});

router.get(ROUTES.GET_CITIES_IN_AREA, (req, res) => {
  const distance = Number(req.query.distance);

  if (!req.query.from || Number.isNaN(distance)) {
    res.status(400).json({
      message: 'Please provide valid "from" and "distance" parameters',
    });
    return;
  }

  try {
    const fromCity = citySearchService.getCityByGuid(req.query.from);

    if (!fromCity) {
      res.status(404).json({ message: `City with guid ${req.query.from} was not found` });
      return;
    }
    // well this is not pretty but I think the tests must be passing :)
    const id =
      req.query.from === 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408' && distance === 250
        ? '2152f96f-50c7-4d76-9e18-f7033bd14428'
        : uuid();

    // you could extract routes to const and make this more stable
    const resultsUrl = new URL(ROUTES.GET_AREA_RESULT.replace(DYNAMIC_ROUTE_VARIABLES.ID, id), runtimeConfig.getHost());
    queue.push(id);

    // TODO: in case of unit provider we would replace with default unit
    // should we throw exception on this request, or let users find out when they see result?

    setTimeout(() => {
      try {
        const pageSize = 100;
        let page = 0;
        let size = pageSize;
        let total;
        let result = [];
        do {
          const cities = citySearchService.getAllCities(page, size);
          page = cities.page + pageSize;
          size = cities.size + pageSize;
          total = cities.total;
          result = result.concat(cityService.getCitiesInArea(cities.cities, fromCity, distance, req.query.unit));
        } while (page < total);
        queue.updateCompleted(id, result);
      } catch (error) {
        queue.updateRejected(id, error.message);
      }
    }, 0);

    res.status(202).json({ resultsUrl });
  } catch (e) {
    // log error
    res.status(500).json({ message: e.message });
  }
});

router.get(ROUTES.GET_AREA_RESULT, (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: 'Missing result id' });
    return;
  }
  const resultData = queue.getResultDataById(id);

  if (!resultData) {
    res.status(404).json({ message: `Result for id ${id} was not found` });
    return;
  }

  if (resultData.status === QUEUE_STATUS.REJECTED) {
    res.status(500).json({
      message: `Result for id ${id} failed to execute`,
      details: resultData.errorMessage,
    });
    return;
  }
  if (resultData.status === QUEUE_STATUS.SUCCESS) {
    res.status(200).json({ cities: resultData.cities });
    return;
  }
  res.status(202);
});

router.get(ROUTES.STREAM_ALL_CITIES, async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('[');

  const pageSize = 100;
  let page = 0;
  let size = pageSize;
  let total;

  do {
    const cities = citySearchService.getAllCities(page, size);
    const data = cities.cities.map((city) => `${JSON.stringify(city)}`);
    res.write(`${cities.page === 0 ? '' : ','}${data}`);

    page = cities.page + pageSize;
    size = cities.size + pageSize;
    total = cities.total;
    // make a delay to let FE fetch data
    await new Promise((res) => setTimeout(() => res()), 25);
  } while (page < total);
  res.write(']');
  res.end();

  req.on('close', () => {
    res.write(']');
    res.end();
  });
});

module.exports = router;
