const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { check } = require('express-validator');

// Validation rules
const parentValidation = [
  check('id').notEmpty().withMessage('ID is required'),
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('phone').notEmpty().withMessage('Phone is required'),
  check('children').isInt({ min: 1 }).withMessage('Must have at least 1 child')
];

// Get all parents
router.get('/', auth, role(['admin', 'supervisor']), parentController.getAllParents);

// Search parents
router.get('/search', auth, role(['admin', 'supervisor']), parentController.searchParents);

// Create a new parent
router.post('/', auth, role(['admin', 'supervisor']), parentValidation, parentController.createParent);

// Update parent
router.put('/:id', auth, role(['admin', 'supervisor']), parentValidation, parentController.updateParent);

// Delete parent
router.delete('/:id', auth, role(['admin', 'supervisor']), parentController.deleteParent);

module.exports = router;