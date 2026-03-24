import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DSATracker from './DSATracker';
import AIMentor from './AIMentor';
import GitHub from './GitHub';
import '../styles/Dashboard.css';

function Dashboard() {
  const { currentUser, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab]     = useState('overview');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      window.location.href = '/login';
    }
  }, [currentUser, loading]);

  if (loading) return (
    <div className="dashboard-loading" style={{ background: theme.bg }}>
      <img src="/penguin.png" alt="logo" className="loading-owl" style={{ width:'60px', objectFit:'contain' }}/>
      <div className="loading-text">Loading your nest...</div>
    </div>
  );

  if (!currentUser) return null;

  const navItems = [
    { id:'overview',  icon:'🏠', label:'Overview'    },
    { id:'dsa',       icon:'📊', label:'DSA Tracker' },
    { id:'github',    icon:'🐱', label:'GitHub'      },
    { id:'ai',        icon:'🤖', label:'AI Mentor'   },
    { id:'portfolio', icon:'🌐', label:'Portfolio'   },
  ];

  const stats = [
    { icon:'📊', label:'Problems Solved', value:'0',  sub:'of 25 total',      color:'#22c55e', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.15)',  progress:0   },
    { icon:'🐱', label:'GitHub Repos',    value:'--', sub:'Connect GitHub',   color:'#3b82f6', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.15)', progress:0   },
    { icon:'🔥', label:'Day Streak',      value:'1',  sub:'Keep it up!',      color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.15)', progress:10  },
    { icon:'🎯', label:'Readiness Score', value:'--', sub:'Complete profile', color:'#a855f7', bg:'rgba(168,85,247,0.08)', border:'rgba(168,85,247,0.15)', progress:0   },
  ];

  const actions = [
    { icon:'📊', title:'Start DSA Practice', desc:'Pick up from where you left off', tab:'dsa',       color:'#22c55e', tag:'Most Popular' },
    { icon:'🐱', title:'Connect GitHub',      desc:'Sync your repos and activity',   tab:'github',    color:'#3b82f6', tag:'Recommended'  },
    { icon:'🤖', title:'Get AI Roadmap',      desc:'Personalized prep plan for you', tab:'ai',        color:'#a855f7', tag:'AI Powered'   },
    { icon:'🌐', title:'View Portfolio',      desc:'See your public profile link',   tab:'portfolio', color:'#f59e0b', tag:'Share Ready'  },
  ];

  return (
    <div className="dashboard-page" style={{ background: theme.bg, color: theme.text }}>

      {/* ── Sidebar ── */}
      <div className="sidebar" style={{ background: theme.sidebar, borderColor: theme.sidebarBorder }}>

        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/penguin.png" alt="logo" style={{ width:'32px', height:'32px', objectFit:'contain' }}/>
          <span className="sidebar-logo-text" style={{ color: theme.text }}>DevNest</span>
          <span className="sidebar-beta">BETA</span>
        </div>

        {/* Nav */}
        <div className="nav-section">
          <div className="nav-label">MAIN MENU</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                color: activeTab === item.id ? theme.text : theme.textMuted,
                background: activeTab === item.id ? theme.bgThird : 'transparent',
                borderColor: activeTab === item.id ? theme.border : 'transparent',
              }}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-icon-wrap" style={{
                background: activeTab === item.id ? 'rgba(34,197,94,0.1)' : 'transparent'
              }}>
                {item.icon}
              </div>
              <span className="nav-item-label">{item.label}</span>
              {activeTab === item.id && <div className="nav-dot"/>}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom" style={{ borderColor: theme.sidebarBorder }}>
          <div className="profile-card" style={{ background: theme.bgSecond, borderColor: theme.border }}>
            <div className="profile-avatar">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="profile-name" style={{ color: theme.text }}>{currentUser.name}</div>
              <div className="profile-email" style={{ color: theme.textDim }}>{currentUser.email}</div>
            </div>
          </div>

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{ borderColor: theme.border, color: theme.textMuted }}
          >
            {theme.isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <button
            className="logout-btn"
            onClick={logout}
            style={{ borderColor: theme.border, color: theme.textMuted }}
          >
            → Sign out
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="main-content" style={{ background: theme.bg }}>

        {/* Top Bar */}
        <div className="top-bar">
          <div>
            <h1 className="page-title" style={{ color: theme.text }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="page-date" style={{ color: theme.textDim }}>
              {new Date().toLocaleDateString('en-US', {
                weekday:'long', month:'long', day:'numeric', year:'numeric'
              })}
            </p>
          </div>
          <div className="welcome-pill" style={{
            background: theme.bgSecond,
            borderColor: theme.border,
            color: theme.textMuted,
          }}>
            <div className="welcome-dot"/>
            Welcome back, {currentUser.name?.split(' ')[0]} 👋
          </div>
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div>

            {/* Stats */}
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="stat-card"
                  style={{
                    background: hoveredCard === `s${i}` ? theme.bgThird : theme.bgSecond,
                    borderColor: hoveredCard === `s${i}` ? stat.border : theme.border,
                  }}
                  onMouseEnter={() => setHoveredCard(`s${i}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="stat-top-row">
                    <div className="stat-icon-box" style={{ background: stat.bg, border:`1px solid ${stat.border}` }}>
                      {stat.icon}
                    </div>
                    <span className="stat-label-text" style={{ color: theme.textMuted }}>{stat.label}</span>
                  </div>
                  <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="stat-sub-text" style={{ color: theme.textDim }}>{stat.sub}</div>
                  <div className="stat-progress-bg" style={{ background: theme.border }}>
                    <div className="stat-progress-fill" style={{
                      width:`${stat.progress}%`,
                      background: stat.color,
                      boxShadow:`0 0 8px ${stat.color}50`,
                    }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="section-header">
              <h2 className="section-title" style={{ color: theme.text }}>Quick Actions</h2>
              <span className="section-sub" style={{ color: theme.textDim }}>Get started with these features</span>
            </div>

            <div className="actions-grid">
              {actions.map((action, i) => (
                <div
                  key={action.title}
                  className="action-card"
                  style={{
                    background: hoveredCard === `a${i}` ? theme.bgThird : theme.bgSecond,
                    borderColor: hoveredCard === `a${i}` ? action.color+'40' : theme.border,
                    transform: hoveredCard === `a${i}` ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                  onClick={() => setActiveTab(action.tab)}
                  onMouseEnter={() => setHoveredCard(`a${i}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="action-tag" style={{
                    color: action.color,
                    background: action.color+'15',
                    border:`1px solid ${action.color}30`,
                  }}>
                    {action.tag}
                  </div>
                  <div className="action-icon-box" style={{
                    background: action.color+'12',
                    border:`1px solid ${action.color}25`,
                  }}>
                    {action.icon}
                  </div>
                  <div className="action-title" style={{ color: theme.text }}>{action.title}</div>
                  <div className="action-desc" style={{ color: theme.textMuted }}>{action.desc}</div>
                  <div className="action-arrow" style={{ color: action.color }}>Explore →</div>
                </div>
              ))}
            </div>

            {/* Banner */}
            <div className="profile-banner">
              <div>
                <div className="banner-title" style={{ color: theme.text }}>
                  🚀 Complete your profile to unlock all features
                </div>
                <div className="banner-sub" style={{ color: theme.textMuted }}>
                  Add your GitHub username and LeetCode handle to get started
                </div>
              </div>
              <button className="banner-btn" onClick={() => setActiveTab('github')}>
                Complete Profile →
              </button>
            </div>
          </div>
        )}

        {/* ── DSA Tab ── */}
        {activeTab === 'dsa' && <DSATracker theme={theme}/>}

        {/* ── GitHub Tab ── */}
        {activeTab === 'github' && <GitHub />}

        {/* ── Coming Soon ── */}
        {activeTab === 'ai' && <AIMentor />}
        {activeTab !== 'overview' && activeTab !== 'dsa' && activeTab !== 'github' && activeTab !== 'ai' && (
          <div className="coming-soon">
            <div className="coming-soon-glow"/>
            <div className="coming-soon-icon">
              {navItems.find(n => n.id === activeTab)?.icon}
            </div>
            <h2 className="coming-soon-title" style={{ color: theme.text }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="coming-soon-text" style={{ color: theme.textMuted }}>
              This section is under construction. Coming soon!
            </p>
            <button
              className="back-btn"
              style={{ borderColor: theme.border, color: theme.textMuted }}
              onClick={() => setActiveTab('overview')}
            >
              ← Back to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;