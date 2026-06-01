const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
router.use(auth);
router.use(tenantMiddleware);

module.exports = router;
