import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/news?limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data);
      } else {
        setError('Failed to load articles');
      }
    } catch (err) {
      setError('Failed to connect to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchArticles();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/news/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data);
      }
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📰 NewsFlow</h1>
        <p>Multi-platform News Aggregation Demo</p>
      </header>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          <button type="button" onClick={() => { setSearchQuery(''); fetchArticles(); }}>
            Clear
          </button>
        </form>
      </div>

      <main className="content">
        {loading && <div className="loading">Loading articles...</div>}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchArticles}>Retry</button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="empty">No articles found</div>
        )}

        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              {article.image_url && (
                <img src={article.image_url} alt={article.title} />
              )}
              <div className="article-content">
                <div className="article-meta">
                  <span className="source">{article.source}</span>
                  <span className="category">{article.category}</span>
                </div>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <div className="article-footer">
                  <span className="region">{article.region}</span>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read more →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>Built with React + Vite + Express + PostgreSQL</p>
        <p>Running in Docker 🐳</p>
      </footer>
    </div>
  );
}

export default App;
