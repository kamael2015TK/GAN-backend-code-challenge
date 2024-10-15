const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const runtimeConfig = require('../services/runtimeConfig');

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      ...runtimeConfig.getAppData(),
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'authorization',
        },
      },
    },
  },
  apis: ['./modules/**/*.controller.js'],
  paths: {},
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};
