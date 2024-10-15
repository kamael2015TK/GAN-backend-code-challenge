const express = require('express');
const router = express.Router();

const ROUTES = {
  LIVE: '/live',
  HEALTH: '/health',
};

/**
 * @swagger
 * tags:
 *   - name: Live
 *     description: Live
 *
 * @swagger
 * /live:
 *   get:
 *     description: Returns empty body to indicate that app is live
 *     tags: [Live]
 *     responses:
 *       204:
 *         description: A successful response
 */
router.get(ROUTES.LIVE, (_, res) => {
  res.status(204).send();
});

router.get(ROUTES.HEALTH, (_, res) => {
  res.status(200).json({ message: 'All subsystems are healthy' });
});

module.exports = router;
