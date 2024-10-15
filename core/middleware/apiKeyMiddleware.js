const { getApiKey } = require("../services/runtimeConfig");

// I could have used passport(https://www.npmjs.com/package/passport)
// or something more advanced to create a secure app but this will have to do for now
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["authorization"];
  if (apiKey && apiKey === getApiKey()) {
    // log info who called this endpoint
    next();
  } else {
    // log error
    res.status(401).json({ message: "Unauthorized: Invalid Token" });
  }
};

module.exports = apiKeyMiddleware;
