const express = require('express');
const router = express.Router();

const { getAuditLogs } = require('../controllers/auditController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get(
  '/',
  auth,
  role('ADMIN'),
  getAuditLogs
);

module.exports = router;