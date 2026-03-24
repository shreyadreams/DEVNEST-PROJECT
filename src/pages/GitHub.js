import React, { useState } from 'react';
import { getGithubStats, getGithubRepos } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import '../styles/GitHub.css';

const LANG_COLORS = {
  JavaScript:'#f1e05a', TypeScript:'#2b7489', Python:'#3572A5',
  Java:'#b07219', 'C++':'#f34b7d', C:'#555555', Go:'#00ADD8',
  Rust:'#dea584', HTML:'#e34c26', CSS:'#563d7c', Ruby:'#701516',
};

function GitHub() {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [stats, setStats]       = useState(null);
  const [repos, setRepos]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
  e.preventDefault();
  if (!username.trim()) return;

  // URL se sirf username extract karo
  let cleanUsername = username.trim();
  if (cleanUsername.includes('github.com/')) {
    cleanUsername = cleanUsername.split('github.com/')[1].replace('/', '');
  }

  setLoading(true);
  setError('');
  setStats(null);
  setRepos([]);

  try {
    const [statsRes, reposRes] = await Promise.all([
      getGithubStats(cleanUsername),
      getGithubRepos(cleanUsername),
    ]);
    setStats(statsRes.data.data);
    setRepos(reposRes.data.repos);
    setSearched(true);
  } catch (err) {
    setError(err.response?.status === 404
      ? 'GitHub user not found!'
      : 'Something went wrong. Try again!');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="github-page">

      {/* Header */}
      <div className="github-header">
        <h1 className="github-title" style={{ color: theme.text }}>GitHub Analytics</h1>
        <p className="github-subtitle" style={{ color: theme.textDim }}>
          Enter any GitHub username to see their stats
        </p>
      </div>

      {/* Search */}
      <form className="github-search-form" onSubmit={handleSearch}>
        <div className="github-input-wrap" style={{
          background: theme.bgSecond,
          borderColor: theme.border,
        }}>
          <span className="github-input-icon">🐙</span>
          <input
            className="github-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter GitHub username..."
            style={{ color: theme.text }}
          />
        </div>
        <button
          className="github-search-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Analyze →'}
        </button>
      </form>

      {/* Error */}
      {error && <div className="github-error">⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="github-loading">
          <div className="github-loading-icon">🐙</div>
          <div className="github-loading-text">
            Fetching data for <strong>{username}</strong>...
          </div>
        </div>
      )}

      {/* Results */}
      {stats && !loading && (
        <div>

          {/* Profile */}
          <div className="github-profile-card" style={{
            background: theme.bgSecond, borderColor: theme.border,
          }}>
            <img className="github-avatar" src={stats.avatar} alt={stats.username}/>
            <div className="github-profile-info">
              <div className="github-profile-name-row">
                <span className="github-name" style={{ color: theme.text }}>{stats.name}</span>
                <span className="github-username-badge">@{stats.username}</span>
              </div>
              {stats.bio && (
                <p className="github-bio" style={{ color: theme.textMuted }}>{stats.bio}</p>
              )}
              <div className="github-meta">
                {stats.location && (
                  <span className="github-location" style={{ color: theme.textMuted }}>
                    📍 {stats.location}
                  </span>
                )}
                <a className="github-profile-link" href={stats.profileUrl}
                  target="_blank" rel="noreferrer">
                  View on GitHub →
                </a>
              </div>
            </div>
            <div className="github-follow-stats">
              {[
                { label:'Followers', value: stats.followers },
                { label:'Following', value: stats.following },
              ].map(s => (
                <div key={s.label} className="github-follow-item">
                  <div className="github-follow-num" style={{ color: theme.text }}>{s.value}</div>
                  <div className="github-follow-label" style={{ color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="github-stats-grid">
            {[
              { icon:'📁', label:'Public Repos',   value: stats.totalRepos,    color:'#3b82f6' },
              { icon:'⭐', label:'Total Stars',    value: stats.totalStars,    color:'#f59e0b' },
              { icon:'🔥', label:'Recent Commits', value: stats.recentCommits, color:'#22c55e' },
              { icon:'📅', label:'Member Since',   value: new Date(stats.joinedAt).getFullYear(), color:'#a855f7' },
            ].map(s => (
              <div key={s.label} className="github-stat-card" style={{
                background: theme.bgSecond, borderColor: theme.border,
              }}>
                <div className="github-stat-top">
                  <span className="github-stat-icon">{s.icon}</span>
                  <span className="github-stat-label" style={{ color: theme.textMuted }}>{s.label}</span>
                </div>
                <div className="github-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Languages */}
          {stats.topLanguages?.length > 0 && (
            <div className="github-languages-card" style={{
              background: theme.bgSecond, borderColor: theme.border,
            }}>
              <h3 className="github-section-title" style={{ color: theme.text }}>
                🔤 Top Languages
              </h3>
              {stats.topLanguages.map(lang => {
                const pct = Math.round((lang.count / stats.topLanguages[0].count) * 100);
                const color = LANG_COLORS[lang.language] || '#6b7280';
                return (
                  <div key={lang.language} className="github-lang-item">
                    <div className="github-lang-row">
                      <div className="github-lang-name-wrap">
                        <div className="github-lang-dot" style={{ background: color }}/>
                        <span className="github-lang-name" style={{ color: theme.text }}>
                          {lang.language}
                        </span>
                      </div>
                      <span className="github-lang-count" style={{ color: theme.textMuted }}>
                        {lang.count} repos
                      </span>
                    </div>
                    <div className="github-lang-bar-bg" style={{ background: theme.border }}>
                      <div className="github-lang-bar-fill"
                        style={{ width:`${pct}%`, background: color }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Repos */}
          {repos.length > 0 && (
            <div className="github-repos-card" style={{
              background: theme.bgSecond, borderColor: theme.border,
            }}>
              <h3 className="github-section-title" style={{ color: theme.text }}>
                📁 Recent Repositories
              </h3>
              <div className="github-repos-grid">
                {repos.slice(0, 6).map(repo => (
                  <a key={repo.id} href={repo.url} target="_blank"
                    rel="noreferrer" className="github-repo-link">
                    <div className="github-repo-item" style={{
                      background: theme.bgThird, borderColor: theme.border,
                    }}>
                      <div className="github-repo-top">
                        <span className="github-repo-name">📁 {repo.name}</span>
                        <span className="github-repo-stars" style={{ color: theme.textMuted }}>
                          ⭐ {repo.stars}
                        </span>
                      </div>
                      {repo.description && (
                        <p className="github-repo-desc" style={{ color: theme.textMuted }}>
                          {repo.description}
                        </p>
                      )}
                      {repo.language && (
                        <div className="github-repo-lang">
                          <div className="github-repo-lang-dot"
                            style={{ background: LANG_COLORS[repo.language] || '#6b7280' }}/>
                          <span className="github-repo-lang-name" style={{ color: theme.textMuted }}>
                            {repo.language}
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searched && !loading && (
        <div className="github-empty">
          <div className="github-empty-icon">🐙</div>
          <p className="github-empty-text" style={{ color: theme.textMuted }}>
            Enter a GitHub username to analyze their profile
          </p>
        </div>
      )}
    </div>
  );
}

export default GitHub;