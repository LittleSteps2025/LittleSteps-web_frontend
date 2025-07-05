const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password, role = 'parent' }) {
    try {
      console.log('Creating user:', email);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { rows } = await db.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, role]
      );
      
      if (!rows || rows.length === 0) {
        throw new Error('User creation failed - no rows returned');
      }
      
      return rows[0];
    } catch (err) {
      console.error('Error in User.create:', err);
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const { rows } = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return rows[0];
    } catch (err) {
      console.error('Error in User.findByEmail:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const { rows } = await db.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [id]
      );
      return rows[0];
    } catch (err) {
      console.error('Error in User.findById:', err);
      throw err;
    }
  }

  static async findAll() {
    try {
      const { rows } = await db.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (err) {
      console.error('Error in User.findAll:', err);
      throw err;
    }
  }
}

module.exports = User;