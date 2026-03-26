const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

router.get('/', settingController.getProfile);
router.put('/', settingController.updateProfile);

module.exports = router;
