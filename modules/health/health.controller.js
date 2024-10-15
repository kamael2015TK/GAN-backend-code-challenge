const express = require('express');
const router = express.Router();

const ROUTES = {
  LIVE: '/live',
  HEALTH: '/health',
};

// props for k9s
router.get(ROUTES.LIVE, (_, res) => {
  res.status(204).send();
});

// props for k9s
router.get(ROUTES.HEALTH, (_, res) => {
  res.status(200).json({ message: 'All subsystems are healthy' });
});

module.exports = router;
