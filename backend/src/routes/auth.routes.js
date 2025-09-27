// src/routes/auth.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerValidation, loginValidation, adminRegisterValidation } from '../validations/auth.validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Regular user registration
router.post('/register', async (req, res) => {
  try {
    await registerValidation.validate(req.body);
    
    const { name, email, password, adminSecret } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If adminSecret is provided, validate it
    let role = 'user';
    if (adminSecret) {
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: 'Invalid admin secret key' });
      }
      role = 'admin';
    }

    // Create user
    const user = await User.create({ name, email, password, role });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin-only registration endpoint (requires existing admin auth)
router.post('/register/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    await adminRegisterValidation.validate(req.body);
    
    const { name, email, password, adminSecret } = req.body;

    // Verify admin secret key
    if (adminSecret !== process.env.ADMIN_SECRET_KEY || 'LMAO') {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create admin user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: 'admin' 
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Quick admin setup endpoint (for initial setup without existing admin)
router.post('/setup-admin', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(403).json({ 
        message: 'Admin user already exists. Use the admin registration endpoint with authentication.' 
      });
    }

    await adminRegisterValidation.validate(req.body);
    
    const { name, email, password, adminSecret } = req.body;

    // Verify admin secret key
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    // Create first admin user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: 'admin' 
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login (unchanged)
router.post('/login', async (req, res) => {
  try {
    await loginValidation.validate(req.body);
    
    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact administrator.' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Add this temporary debug route at the top of your auth routes
router.get('/debug-secret', (req, res) => {
  res.json({
    adminSecretSet: !!process.env.ADMIN_SECRET_KEY,
    adminSecretValue: process.env.ADMIN_SECRET_KEY,
    adminSecretLength: process.env.ADMIN_SECRET_KEY?.length,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('ADMIN') || key.includes('SECRET') || key.includes('MONGO') || key.includes('JWT')
    )
  });
});

export default router;