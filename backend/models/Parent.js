const db = require('../config/db');

module.exports = {
  // Create a new parent
  async create(parent) {
    try {
      const { id, name, email, phone, children } = parent;
      const result = await db.query(
        `INSERT INTO parents (id, name, email, phone, children) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [id, name, email, phone, children]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in Parent.create:', error);
      throw error;
    }
  },

  // Get all parents
  async findAll() {
    try {
      const result = await db.query('SELECT * FROM parents ORDER BY name ASC');
      return result.rows;
    } catch (error) {
      console.error('Error in Parent.findAll:', error);
      throw error;
    }
  },

  // Find parent by ID
  async findById(id) {
    try {
      const result = await db.query('SELECT * FROM parents WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Parent.findById:', error);
      throw error;
    }
  },

  // Update parent
  async update(id, parent) {
    try {
      const { name, email, phone, children } = parent;
      const result = await db.query(
        `UPDATE parents 
         SET name = $1, email = $2, phone = $3, children = $4, updated_at = NOW()
         WHERE id = $5 
         RETURNING *`,
        [name, email, phone, children, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in Parent.update:', error);
      throw error;
    }
  },

  // Delete parent
  async delete(id) {
    try {
      await db.query('DELETE FROM parents WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('Error in Parent.delete:', error);
      throw error;
    }
  },

  // Search parents
  async search(term) {
    try {
      const result = await db.query(
        `SELECT * FROM parents 
         WHERE name ILIKE $1 OR id ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
         ORDER BY name ASC`,
        [`%${term}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Parent.search:', error);
      throw error;
    }
  }
};