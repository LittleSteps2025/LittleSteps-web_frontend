const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const bcrypt = require('bcryptjs');

const authController = {
  async signup(req, res) {
    try {
      console.log('Signup request received:', req.body);
      
      const { name, email, password, role = 'parent', adminKey } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Name, email and password are required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email format' 
        });
      }

      // Validate role
      const validRoles = ['parent', 'teacher', 'supervisor', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid role specified' 
        });
      }

      // Check for privileged role creation
      if (['admin', 'supervisor'].includes(role)) {
        if (adminKey !== process.env.ADMIN_KEY) {
          return res.status(403).json({ 
            success: false,
            message: 'Invalid admin key for privileged role creation' 
          });
        }
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists' 
        });
      }

      // Create new user
      const user = await User.create({ name, email, password, role });
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          email: user.email
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      console.log('User created successfully:', user.email);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        },
        token
      });

    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific database errors
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role,
          email: user.email
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = authController;