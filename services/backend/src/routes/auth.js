import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// POST /api/auth/register - Simple registration (demo only)
router.post('/register', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Check if user exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        data: existing.rows[0]
      });
    }

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, username, provider)
       VALUES ($1, $2, 'demo')
       RETURNING id, email, username, created_at`,
      [email, username || email.split('@')[0]]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// GET /api/auth/user/:email - Get user by email (demo only)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await db.query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user' 
    });
  }
});

export default router;
