import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/AIMentor.css';
import axios from 'axios';

const COMPANY_COLORS = {
  Google:    '#4285f4',
  Amazon:    '#f59e0b',
  Microsoft: '#7c3aed',
  Flipkart:  '#22c55e',
};

const COMPANY_ICONS = {
  Google:    '🔍',
  Amazon:    '📦',
  Microsoft: '🪟',
  Flipkart:  '🛒',
};

function AIMentor() {
  const { theme } = useTheme();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [data, setData]         = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const token = localStorage.getItem('devnest_token');
      const res = await axios.post(
        '/api/ai/roadmap',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI service error. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Ready 🔥';
    if (score >= 40) return 'Improving 📈';
    return 'Needs Work 💪';
  };

  return (
    <div className="ai-page">

      {/* Header */}
      <div className="ai-header">
        <h1 className="ai-title" style={{ color: theme.text }}>AI Coding Mentor</h1>
        <p className="ai-subtitle" style={{ color: theme.textDim }}>
          Get personalized roadmap and interview readiness score — powered by Claude AI
        </p>
      </div>

      {/* Generate Button */}
      {!loading && (
        <button className="ai-generate-btn" onClick={handleGenerate}>
          <span className="ai-btn-icon">🤖</span>
          {data ? 'Regenerate My Roadmap' : 'Generate My Roadmap'}
        </button>
      )}

      {/* Error */}
      {error && <div className="ai-error">⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-icon">🤖</div>
          <div className="ai-loading-text">Claude is analyzing your progress...</div>
          <div className="ai-loading-sub" style={{ color: theme.textMuted }}>
            This may take 10-15 seconds
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <div className="ai-empty">
          <div className="ai-empty-icon">🧠</div>
          <div className="ai-empty-title" style={{ color: theme.text }}>
            Your Personal AI Mentor
          </div>
          <div className="ai-empty-sub" style={{ color: theme.textMuted }}>
            Click the button above to get your personalized study roadmap,
            weak topic analysis, and company-wise interview readiness score.
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="ai-results">

          {/* Motivational Tip */}
          {data.tip && (
            <div className="ai-tip">
              <div className="ai-tip-icon">💡</div>
              <div>
                <div className="ai-tip-label">AI MENTOR SAYS</div>
                <div className="ai-tip-text" style={{ color: theme.text }}>{data.tip}</div>
              </div>
            </div>
          )}

          {/* Stats */}
          {data.stats && (
            <div className="ai-stats-row">
              {[
                { icon:'📊', label:'Problems Solved',  value: data.stats.totalSolved,  color:'#22c55e' },
                { icon:'🎯', label:'Completion',        value: `${data.stats.percentage}%`, color:'#3b82f6' },
                { icon:'⚠️', label:'Weak Topics',       value: data.stats.weakTopics?.length || 0, color:'#f59e0b' },
              ].map(s => (
                <div key={s.label} className="ai-stat-card" style={{
                  background: theme.bgSecond, borderColor: theme.border,
                }}>
                  <div className="ai-stat-icon">{s.icon}</div>
                  <div className="ai-stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="ai-stat-label" style={{ color: theme.textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Readiness Scores */}
          {data.readinessScores && (
            <div className="ai-readiness-card" style={{
              background: theme.bgSecond, borderColor: theme.border,
            }}>
              <h3 className="ai-card-title" style={{ color: theme.text }}>
                🎯 Interview Readiness Score
              </h3>
              <div className="ai-company-grid">
                {Object.entries(data.readinessScores).map(([company, score]) => {
                  const color = getScoreColor(score);
                  return (
                    <div key={company} className="ai-company-item" style={{
                      background: theme.bgThird, borderColor: theme.border,
                    }}>
                      <div className="ai-company-header">
                        <div className="ai-company-name" style={{ color: theme.text }}>
                          {COMPANY_ICONS[company]} {company}
                        </div>
                        <div className="ai-company-score" style={{ color }}>
                          {score}%
                        </div>
                      </div>
                      <div className="ai-company-bar-bg" style={{ background: theme.border }}>
                        <div className="ai-company-bar-fill" style={{
                          width: `${score}%`,
                          background: color,
                          boxShadow: `0 0 8px ${color}50`,
                        }}/>
                      </div>
                      <div className="ai-company-label" style={{ color: theme.textMuted }}>
                        {getScoreLabel(score)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Topics */}
          {data.topTopics && data.topTopics.length > 0 && (
            <div className="ai-topics-card" style={{
              background: theme.bgSecond, borderColor: theme.border,
            }}>
              <h3 className="ai-card-title" style={{ color: theme.text }}>
                🔥 Focus on These Topics NOW
              </h3>
              <div className="ai-topics-list">
                {data.topTopics.map((topic, i) => (
                  <div key={topic} className="ai-topic-item" style={{
                    background: theme.bgThird, borderColor: theme.border,
                  }}>
                    <div className="ai-topic-rank">{i + 1}</div>
                    <div className="ai-topic-name" style={{ color: theme.text }}>{topic}</div>
                    <div className="ai-topic-badge">Priority</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {data.roadmap && data.roadmap.length > 0 && (
            <div className="ai-roadmap-card" style={{
              background: theme.bgSecond, borderColor: theme.border,
            }}>
              <h3 className="ai-card-title" style={{ color: theme.text }}>
                🗺️ Your 4-Week Study Roadmap
              </h3>
              <div className="ai-weeks">
                {data.roadmap.map((week, i) => (
                  <div key={i} className="ai-week-item" style={{
                    background: theme.bgThird, borderColor: theme.border,
                  }}>
                    <div className="ai-week-header">
                      <span className="ai-week-num">WEEK {week.week}</span>
                      <span className="ai-week-focus" style={{ color: theme.text }}>
                        {week.focus}
                      </span>
                    </div>
                    <div className="ai-week-tasks">
                      {week.tasks?.map((task, j) => (
                        <div key={j} className="ai-week-task" style={{ color: theme.textMuted }}>
                          <div className="ai-task-dot"/>
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default AIMentor;