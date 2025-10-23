import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/news - Fetch news articles with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      category, 
      source,
      search 
    } = req.query;

    let query = `
      SELECT 
        id, article_id, title, description, url, image_url,
        source, category, region, published_at, created_at
      FROM articles
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (source) {
      query += ` AND source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    if (search) {
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
      paramCount++;
    }

    query += ` ORDER BY published_at DESC NULLS LAST, created_at DESC`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch news articles' 
    });
  }
});

// GET /api/news/:id - Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM articles WHERE id = $1 OR article_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Article not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch article' 
    });
  }
});

// POST /api/news/search - Full-text search
router.post('/search', async (req, res) => {
  try {
    const { query: searchQuery, limit = 20 } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    const result = await db.query(
      `SELECT 
        id, article_id, title, description, url, image_url,
        source, category, region, published_at,
        ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank
      FROM articles
      WHERE search_vector @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC, published_at DESC
      LIMIT $2`,
      [searchQuery, parseInt(limit)]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Search failed' 
    });
  }
});

export default router;
