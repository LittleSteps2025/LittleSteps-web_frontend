const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, role } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;