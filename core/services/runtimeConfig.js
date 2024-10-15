const dotenv = require('dotenv');
dotenv.config();

const getPort = () => process.env.PORT || 8080;

// normally don't commit this fallback value
const getApiKey = () => process.env.API_KEY || 'bearer dGhlc2VjcmV0dG9rZW4=';

const getQueueCleanupInterval = () => process.env.CLEANUP_INTERVAL_IN_MS || (60 * 60 * 1000);

const getQueueTTL = () => process.env.QUEUE_TTL_IN_MS || (24* 60 * 60 * 1000);

const getHost = () => process.env.HOST || 'http://127.0.0.1:8080';

module.exports = {
    getPort,
    getApiKey,
    getQueueCleanupInterval,
    getQueueTTL,
    getHost
}