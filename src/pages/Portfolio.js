import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getGithubStats, getDSAProblems } from '../services/api';
import '../styles/Portfolio.css';

const HEATMAP = Array.from({ length: 105 }, () => {
  const r = Math.random();
  return r > 0.6 ? `rgba(34,197,94,${r.toFixed(2)})` : r > 0.3 ? 'rgba(34,197,94,0.15)' : '#1f1f1f';
});

function Portfolio() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();

  const [githubStats, setGithubStats] = useState(null);
  const [dsaProgress, setDsaProgress] = useState({});
  const [showShare, setShowShare]     = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [copied, setCopied]           = useState(false);
  const [loading, setLoading]         = useState(true);

  const [profile, setProfile] = useState({
    bio:      'Aspiring Software Engineer | CS Student | DSA Enthusiast',
    college:  'Your College Name',
    location: 'India',
    skills:   ['C++', 'Python', 'JavaScript', 'React', 'Node.js', 'DSA'],
    github:   '',
    leetcode: '',
    gfg:      '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // DSA Progress
      const sheets = ['Striver A2Z', 'Blind 75', 'NeetCode 150'];
      const progressMap = {};
      for (const sheet of sheets) {
        const res = await getDSAProblems({ sheet });
        const problems = res.data.problems;
        const solved   = problems.filter(p => p.isSolved).length;
        progressMap[sheet] = { solved, total: problems.length };
      }
      setDsaProgress(progressMap);

      // GitHub — if username saved
      if (profile.github) {
        const res = await getGithubStats(profile.github);
        setGithubStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `https://devnest.app/${currentUser?.name?.toLowerCase().replace(' ', '')}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSolved = Object.values(dsaProgress).reduce((sum, s) => sum + s.solved, 0);

  return (
    <div className="portfolio-page">

      {/* Header */}
      <div className="portfolio-header">
        <h1 className="portfolio-title" style={{ color: theme.text }}>My Portfolio</h1>
        <p className="portfolio-subtitle" style={{ color: theme.textDim }}>
          Your public coding profile — share with recruiters!
        </p>
      </div>

      {/* Edit Form */}
      {showEdit && (
        <div className="port-edit-form" style={{ background: theme.bgSecond, borderColor: theme.border }}>
          <div className="port-edit-title" style={{ color: theme.text }}>✏️ Edit Profile</div>
          <div className="port-form-row">
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>BIO</label>
              <input className="port-form-input"
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>COLLEGE</label>
              <input className="port-form-input"
                value={profile.college}
                onChange={e => setProfile({ ...profile, college: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
          </div>
          <div className="port-form-row">
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>GITHUB USERNAME</label>
              <input className="port-form-input"
                placeholder="e.g. shreyadreams"
                value={profile.github}
                onChange={e => setProfile({ ...profile, github: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>LEETCODE USERNAME</label>
              <input className="port-form-input"
                placeholder="e.g. shreyjain"
                value={profile.leetcode}
                onChange={e => setProfile({ ...profile, leetcode: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
          </div>
          <div className="port-form-row">
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>LOCATION</label>
              <input className="port-form-input"
                value={profile.location}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
            <div className="port-form-group">
              <label className="port-form-label" style={{ color: theme.textMuted }}>GFG USERNAME</label>
              <input className="port-form-input"
                placeholder="e.g. shreyjain"
                value={profile.gfg}
                onChange={e => setProfile({ ...profile, gfg: e.target.value })}
                style={{ color: theme.text, borderColor: theme.border, background: theme.bgThird }}
              />
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="port-save-btn" onClick={() => { setShowEdit(false); fetchData(); }}>
              Save Changes
            </button>
            <button className="port-edit-btn"
              style={{ borderColor: theme.border, color: theme.textMuted }}
              onClick={() => setShowEdit(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="port-profile-card" style={{ background: theme.bgSecond, borderColor: theme.border }}>
        <div className="port-avatar-wrap">
          <div className="port-avatar">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="port-online-dot"/>
        </div>

        <div className="port-info">
          <div className="port-name-row">
            <span className="port-name" style={{ color: theme.text }}>{currentUser?.name}</span>
            <span className="port-verified">✅ Verified</span>
          </div>
          <div className="port-handle">
            @{currentUser?.name?.toLowerCase().replace(' ', '')}
          </div>
          <div className="port-bio" style={{ color: theme.textMuted }}>{profile.bio}</div>
          <div className="port-meta">
            <span className="port-meta-item" style={{ color: theme.textDim }}>
              🎓 {profile.college}
            </span>
            <span className="port-meta-item" style={{ color: theme.textDim }}>
              📍 {profile.location}
            </span>
            <span className="port-meta-item" style={{ color: theme.textDim }}>
              📧 {currentUser?.email}
            </span>
          </div>
        </div>

        <div className="port-actions">
          <button className="port-share-btn" onClick={() => setShowShare(true)}>
            🔗 Share Profile
          </button>
          <button className="port-edit-btn"
            style={{ borderColor: theme.border, color: theme.textMuted }}
            onClick={() => setShowEdit(!showEdit)}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="port-stats-grid">
        {[
          { icon:'📊', label:'DSA Solved',    value: totalSolved,                          color:'#22c55e' },
          { icon:'🐙', label:'GitHub Repos',  value: githubStats?.totalRepos || '--',      color:'#3b82f6' },
          { icon:'⭐', label:'GitHub Stars',  value: githubStats?.totalStars || '--',      color:'#f59e0b' },
          { icon:'🔥', label:'Recent Commits',value: githubStats?.recentCommits || '--',   color:'#ef4444' },
        ].map(s => (
          <div key={s.label} className="port-stat-card"
            style={{ background: theme.bgSecond, borderColor: theme.border }}>
            <div className="port-stat-icon">{s.icon}</div>
            <div className="port-stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="port-stat-label" style={{ color: theme.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column */}
      <div className="port-two-col">

        {/* DSA Progress */}
        <div className="port-card" style={{ background: theme.bgSecond, borderColor: theme.border }}>
          <div className="port-card-title" style={{ color: theme.text }}>
            📊 DSA Sheet Progress
          </div>
          {[
            { name:'Striver A2Z',  total: 200 },
            { name:'Blind 75',     total: 75  },
            { name:'NeetCode 150', total: 150 },
          ].map(sheet => {
            const progress = dsaProgress[sheet.name];
            const solved   = progress?.solved || 0;
            const total    = progress?.total  || sheet.total;
            const pct      = total > 0 ? Math.round((solved / total) * 100) : 0;
            return (
              <div key={sheet.name} className="dsa-sheet-item">
                <div className="dsa-sheet-top">
                  <span className="dsa-sheet-name" style={{ color: theme.text }}>{sheet.name}</span>
                  <span className="dsa-sheet-count">{solved}/{total}</span>
                </div>
                <div className="dsa-sheet-bar-bg" style={{ background: theme.border }}>
                  <div className="dsa-sheet-bar-fill" style={{ width:`${pct}%` }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skills */}
        <div className="port-card" style={{ background: theme.bgSecond, borderColor: theme.border }}>
          <div className="port-card-title" style={{ color: theme.text }}>
            💡 Skills & Technologies
          </div>
          <div className="skills-wrap">
            {profile.skills.map(skill => (
              <span key={skill} className="skill-tag" style={{
                color:'#22c55e',
                background:'rgba(34,197,94,0.08)',
                borderColor:'rgba(34,197,94,0.2)',
              }}>
                {skill}
              </span>
            ))}
          </div>

          {/* GitHub Stats if connected */}
          {githubStats && (
            <div style={{ marginTop:'20px' }}>
              <div className="port-card-title" style={{ color: theme.text, marginBottom:'12px' }}>
                🐙 GitHub Languages
              </div>
              {githubStats.topLanguages?.slice(0,4).map(lang => (
                <div key={lang.language} style={{ marginBottom:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'12px', color: theme.text }}>{lang.language}</span>
                    <span style={{ fontSize:'11px', color: theme.textMuted }}>{lang.count} repos</span>
                  </div>
                  <div style={{ height:'4px', background: theme.border, borderRadius:'999px', overflow:'hidden' }}>
                    <div style={{
                      height:'100%',
                      width:`${Math.round((lang.count / githubStats.topLanguages[0].count) * 100)}%`,
                      background:'#22c55e', borderRadius:'999px',
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="port-card" style={{
        background: theme.bgSecond, borderColor: theme.border, marginBottom:'20px'
      }}>
        <div className="port-card-title" style={{ color: theme.text }}>
          🌐 Coding Platforms
        </div>
        <div className="port-platforms-grid">
          {[
            { icon:'🟡', name:'LeetCode',   stat: profile.leetcode ? 'Connected' : 'Not connected', color:'#ffa116', connected: !!profile.leetcode },
            { icon:'🟢', name:'GFG',        stat: profile.gfg      ? 'Connected' : 'Not connected', color:'#2f8d46', connected: !!profile.gfg      },
            { icon:'🔵', name:'Codeforces', stat:'Not connected', color:'#1890ff', connected: false },
            { icon:'🟠', name:'HackerRank', stat:'Not connected', color:'#2ec866', connected: false },
          ].map(p => (
            <div key={p.name} className="port-platform-item"
              style={{
                background: theme.bgThird,
                borderColor: p.connected ? `${p.color}40` : theme.border
              }}>
              <span className="port-platform-icon">{p.icon}</span>
              <div style={{ flex:1 }}>
                <div className="port-platform-name" style={{ color: theme.text }}>{p.name}</div>
                <div className="port-platform-stat" style={{ color: p.connected ? '#22c55e' : theme.textDim }}>
                  {p.connected ? '✅ ' : ''}{p.stat}
                </div>
              </div>
              {!p.connected && (
                <span className="port-platform-connect"
                  onClick={() => setShowEdit(true)}>
                  Connect
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="port-card" style={{
        background: theme.bgSecond, borderColor: theme.border, marginBottom:'20px'
      }}>
        <div className="port-card-title" style={{ color: theme.text }}>
          🔥 Activity Heatmap
        </div>
        <div className="port-heatmap-grid">
          {HEATMAP.map((color, i) => (
            <div key={i} className="port-hcell" style={{ background: color }}/>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="share-modal-overlay" onClick={() => setShowShare(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="share-modal-title" style={{ color:'#fff' }}>
              🔗 Share Your Profile
            </div>
            <div className="share-modal-sub" style={{ color:'#9ca3af' }}>
              Share your DevNest profile with recruiters and peers!
            </div>
            <div className="share-link-box">
              <input
                className="share-link-input"
                readOnly
                value={`https://devnest.app/${currentUser?.name?.toLowerCase().replace(' ', '')}`}
              />
              <button className="share-copy-btn" onClick={copyLink}>
                {copied ? '✅ Copied!' : 'Copy'}
              </button>
            </div>
            <div className="share-platforms">
              <button className="share-platform-btn" style={{
                background:'#1877f220', borderColor:'#1877f240', color:'#1877f2'
              }}>
                LinkedIn
              </button>
              <button className="share-platform-btn" style={{
                background:'#1da1f220', borderColor:'#1da1f240', color:'#1da1f2'
              }}>
                Twitter
              </button>
              <button className="share-platform-btn" style={{
                background:'rgba(34,197,94,0.1)', borderColor:'rgba(34,197,94,0.3)', color:'#22c55e'
              }}>
                WhatsApp
              </button>
            </div>
            <button className="share-close-btn" onClick={() => setShowShare(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Portfolio;