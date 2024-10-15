const express = require('express');
const cityController = require('./modules/city/city.controller');

const { getPort } = require('./core/services/runtimeConfig');

const app = express();
const port = getPort();

app.use('/', cityController);

app.listen(port, () => {
  // do an actual log
  console.log(`App listening on port ${port}`)
});
