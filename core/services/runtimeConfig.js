/*global process*/
const dotenv = require('dotenv');
dotenv.config();

const hourInMS = 60 * 60 * 1000;
const dayInMs = 24 * hourInMS;

const getPort = () => process.env.PORT || 8080;

// normally don't commit this fallback value
const getApiKey = () => process.env.API_KEY || 'bearer dGhlc2VjcmV0dG9rZW4=';

const getQueueCleanupInterval = () => process.env.CLEANUP_INTERVAL_IN_MS || hourInMS;

const getQueueTTL = () => process.env.QUEUE_TTL_IN_MS || dayInMs;

const getHost = () => process.env.HOST || 'http://127.0.0.1:8080';

const getAppData = () => ({
  title: process.env.npm_package_name,
  version: process.env.npm_package_version,
  description: 'GAN Integrity backend code challenge',
});

module.exports = {
  getPort,
  getApiKey,
  getQueueCleanupInterval,
  getQueueTTL,
  getHost,
  getAppData,
};
