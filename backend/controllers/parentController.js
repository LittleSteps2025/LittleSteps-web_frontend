const Parent = require('../models/Parent');
const { validationResult } = require('express-validator');

module.exports = {
  // Get all parents
  async getAllParents(req, res) {
    try {
      console.log('Fetching all parents...');
      const parents = await Parent.findAll();
      console.log('Parents fetched successfully:', parents.length);
      res.json(parents);
    } catch (error) {
      console.error('Error fetching parents:', error);
      res.status(500).json({ message: 'Failed to fetch parents', error: error.message });
    }
  },

  // Create a new parent
  async createParent(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id, name, email, phone, children } = req.body;
      console.log('Creating parent with data:', { id, name, email, phone, children });
      
      const existingParent = await Parent.findById(id);
      if (existingParent) {
        console.log('Parent already exists with ID:', id);
        return res.status(400).json({ message: 'Parent with this ID already exists' });
      }

      const newParent = await Parent.create({ id, name, email, phone, children });
      console.log('Parent created successfully:', newParent);
      res.status(201).json(newParent);
    } catch (error) {
      console.error('Error creating parent:', error);
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Email already in use' });
      }
      res.status(500).json({ message: 'Failed to create parent', error: error.message });
    }
  },

  // Update parent
  async updateParent(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, email, phone, children } = req.body;
      console.log(`Updating parent ${id} with:`, { name, email, phone, children });
      
      const parent = await Parent.findById(id);
      if (!parent) {
        console.log('Parent not found with ID:', id);
        return res.status(404).json({ message: 'Parent not found' });
      }

      const updatedParent = await Parent.update(id, { name, email, phone, children });
      console.log('Parent updated successfully:', updatedParent);
      res.json(updatedParent);
    } catch (error) {
      console.error('Error updating parent:', error);
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Email already in use' });
      }
      res.status(500).json({ message: 'Failed to update parent', error: error.message });
    }
  },

  // Delete parent
  async deleteParent(req, res) {
    try {
      const { id } = req.params;
      console.log('Deleting parent with ID:', id);
      
      const parent = await Parent.findById(id);
      if (!parent) {
        console.log('Parent not found with ID:', id);
        return res.status(404).json({ message: 'Parent not found' });
      }

      await Parent.delete(id);
      console.log('Parent deleted successfully:', id);
      res.json({ message: 'Parent deleted successfully' });
    } catch (error) {
      console.error('Error deleting parent:', error);
      res.status(500).json({ message: 'Failed to delete parent', error: error.message });
    }
  },

  // Search parents
  async searchParents(req, res) {
    try {
      const { term } = req.query;
      console.log('Searching parents with term:', term);
      if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      const parents = await Parent.search(term);
      console.log('Search results:', parents.length);
      res.json(parents);
    } catch (error) {
      console.error('Error searching parents:', error);
      res.status(500).json({ message: 'Failed to search parents', error: error.message });
    }
  }
};