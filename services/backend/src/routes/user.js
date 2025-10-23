import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// POST /api/user/activity - Track user activity
router.post('/activity', async (req, res) => {
  try {
    const { userId, articleId, action, metadata } = req.body;

    if (!userId || !articleId || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, articleId, and action are required' 
      });
    }

    // Insert activity
    await db.query(
      `INSERT INTO user_activity (user_id, article_id, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [userId, articleId, action, JSON.stringify(metadata || {})]
    );

    // Mark as seen if viewed or liked
    if (action === 'viewed' || action === 'liked') {
      await db.query(
        `INSERT INTO seen_articles (user_id, article_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, article_id) DO NOTHING`,
        [userId, articleId]
      );
    }

    // Update preferences if liked
    if (action === 'liked' && metadata) {
      await updateUserPreferences(userId, metadata);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track activity' 
    });
  }
});

// GET /api/user/:userId/preferences - Get user preferences
router.get('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          preferred_categories: {},
          preferred_sources: {},
          preferred_regions: {}
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch preferences' 
    });
  }
});

// Helper function to update preferences
async function updateUserPreferences(userId, metadata) {
  const { category, source, region } = metadata;

  // Get current preferences
  const result = await db.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );

  let preferences = result.rows[0] || {
    preferred_categories: {},
    preferred_sources: {},
    preferred_regions: {}
  };

  // Increment counters
  if (category) {
    preferences.preferred_categories[category] = 
      (preferences.preferred_categories[category] || 0) + 1;
  }
  if (source) {
    preferences.preferred_sources[source] = 
      (preferences.preferred_sources[source] || 0) + 1;
  }
  if (region) {
    preferences.preferred_regions[region] = 
      (preferences.preferred_regions[region] || 0) + 1;
  }

  // Upsert preferences
  await db.query(
    `INSERT INTO user_preferences (user_id, preferred_categories, preferred_sources, preferred_regions)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       preferred_categories = $2,
       preferred_sources = $3,
       preferred_regions = $4,
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      JSON.stringify(preferences.preferred_categories),
      JSON.stringify(preferences.preferred_sources),
      JSON.stringify(preferences.preferred_regions)
    ]
  );
}

export default router;
