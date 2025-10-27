import 'dotenv/config';
import db from '../src/config/database.js';

const sampleArticles = [
  {
    article_id: 'demo-1',
    title: 'Breaking: AI Revolutionizes News Aggregation',
    description: 'New AI-powered platform changes how people consume news with personalized feeds and smart recommendations.',
    url: 'https://example.com/ai-news-1',
    image_url: 'https://picsum.photos/seed/news1/800/600',
    source: 'Tech Daily',
    category: 'Technology',
    region: 'Global',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    article_id: 'demo-2',
    title: 'Climate Summit Reaches Historic Agreement',
    description: 'World leaders commit to ambitious carbon reduction targets in landmark climate deal.',
    url: 'https://example.com/climate-1',
    image_url: 'https://picsum.photos/seed/news2/800/600',
    source: 'Global News',
    category: 'Environment',
    region: 'Global',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    article_id: 'demo-3',
    title: 'Stock Markets Rally on Economic Data',
    description: 'Major indices surge as positive employment figures boost investor confidence.',
    url: 'https://example.com/finance-1',
    image_url: 'https://picsum.photos/seed/news3/800/600',
    source: 'Financial Times',
    category: 'Business',
    region: 'US',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    article_id: 'demo-4',
    title: 'New Study Reveals Benefits of Mediterranean Diet',
    description: 'Research shows significant health improvements from traditional Mediterranean eating patterns.',
    url: 'https://example.com/health-1',
    image_url: 'https://picsum.photos/seed/news4/800/600',
    source: 'Health Today',
    category: 'Health',
    region: 'Europe',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    article_id: 'demo-5',
    title: 'Championship Game Ends in Dramatic Fashion',
    description: 'Last-second goal secures victory in thrilling championship finale.',
    url: 'https://example.com/sports-1',
    image_url: 'https://picsum.photos/seed/news5/800/600',
    source: 'Sports Network',
    category: 'Sports',
    region: 'US',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
  },
  {
    article_id: 'demo-6',
    title: 'Breakthrough in Quantum Computing Announced',
    description: 'Scientists achieve major milestone in quantum processor development.',
    url: 'https://example.com/tech-2',
    image_url: 'https://picsum.photos/seed/news6/800/600',
    source: 'Science Weekly',
    category: 'Technology',
    region: 'Asia',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    article_id: 'demo-7',
    title: 'Electric Vehicle Sales Surge Globally',
    description: 'EV adoption accelerates as prices drop and charging infrastructure expands.',
    url: 'https://example.com/auto-1',
    image_url: 'https://picsum.photos/seed/news7/800/600',
    source: 'Auto News',
    category: 'Technology',
    region: 'Global',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
  },
  {
    article_id: 'demo-8',
    title: 'New Archaeological Discovery Rewrites History',
    description: 'Ancient artifacts found in remote location challenge existing historical narratives.',
    url: 'https://example.com/history-1',
    image_url: 'https://picsum.photos/seed/news8/800/600',
    source: 'History Channel',
    category: 'Culture',
    region: 'Middle East',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
  },
  {
    article_id: 'demo-9',
    title: 'Space Agency Plans Mars Mission',
    description: 'Ambitious new program aims to send humans to Mars within the decade.',
    url: 'https://example.com/space-1',
    image_url: 'https://picsum.photos/seed/news9/800/600',
    source: 'Space News',
    category: 'Science',
    region: 'US',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    article_id: 'demo-10',
    title: 'Innovative Startup Disrupts Food Industry',
    description: 'Plant-based protein company raises record funding round.',
    url: 'https://example.com/startup-1',
    image_url: 'https://picsum.photos/seed/news10/800/600',
    source: 'Startup Weekly',
    category: 'Business',
    region: 'Europe',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 60), // 2.5 days ago
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Insert sample articles
    for (const article of sampleArticles) {
      await db.query(
        `INSERT INTO articles (article_id, title, description, url, image_url, source, category, region, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (article_id) DO NOTHING`,
        [
          article.article_id,
          article.title,
          article.description,
          article.url,
          article.image_url,
          article.source,
          article.category,
          article.region,
          article.published_at,
        ],
      );
    }

    console.log(`✅ Inserted ${sampleArticles.length} sample articles`);

    // Create demo user
    const demoUser = await db.query(
      `INSERT INTO users (email, username, provider)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['demo@newsflow.com', 'Demo User', 'demo'],
    );

    if (demoUser.rows.length > 0) {
      console.log('✅ Created demo user: demo@newsflow.com');
    }

    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
