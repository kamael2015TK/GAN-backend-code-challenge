const express = require('express');
const { specs, swaggerUi } = require('./core/swagger/swagger');
const healthController = require('./modules/health/health.controller');
const cityController = require('./modules/city/city.controller');
const apiKeyMiddleware = require('./core/middleware/apiKeyMiddleware');

const { getPort } = require('./core/services/runtimeConfig');

const app = express();
const port = getPort();

// public routes
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', healthController);
// protected routes
app.use(apiKeyMiddleware);
app.use('/', cityController);

app.listen(port, () => {
  // do an actual log
  console.log(`App listening on port ${port}`);
});
