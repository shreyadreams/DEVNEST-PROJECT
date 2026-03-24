import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getDSAProblems, markProblemSolved, markUnsolved } from '../services/api';
import '../styles/DSATracker.css';

const SHEETS = ['Striver A2Z', 'Blind 75', 'NeetCode 150'];

function DSATracker() {
  const { theme } = useTheme();
  const [activeSheet, setActiveSheet] = useState('Striver A2Z');
  const [problems, setProblems]       = useState([]);
  const [solved, setSolved]           = useState({});
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [diffFilter, setDiffFilter]   = useState('All');
  const [openSteps, setOpenSteps]     = useState({});

  useEffect(() => {
    fetchProblems();
  }, [activeSheet]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await getDSAProblems({ sheet: activeSheet });
      const probs = res.data.problems;
      setProblems(probs);

      // Solved state init
      const solvedMap = {};
      probs.forEach(p => {
        if (p.isSolved) solvedMap[p._id] = true;
      });
      setSolved(solvedMap);

      // Open first step by default
      const steps = [...new Set(probs.map(p => p.step))];
      const firstOpen = {};
      if (steps[0]) firstOpen[steps[0]] = true;
      setOpenSteps(firstOpen);

    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolved = async (problemId) => {
    const isSolved = solved[problemId];
    // Optimistic update
    setSolved(prev => ({ ...prev, [problemId]: !isSolved }));
    try {
      if (isSolved) {
        await markUnsolved(problemId);
      } else {
        await markProblemSolved(problemId);
      }
    } catch (err) {
      // Revert on error
      setSolved(prev => ({ ...prev, [problemId]: isSolved }));
    }
  };

  const toggleStep = (step) => {
    setOpenSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  // Filter problems
  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  // Group by step
  const steps = [...new Set(problems.map(p => p.step))];
  const groupedByStep = {};
  steps.forEach(step => {
    groupedByStep[step] = filtered.filter(p => p.step === step);
  });

  const totalSolved  = Object.values(solved).filter(Boolean).length;
  const totalProbs   = problems.length;
  const progressPct  = totalProbs > 0 ? Math.round((totalSolved / totalProbs) * 100) : 0;

  return (
    <div className="dsa-page">

      {/* Header */}
      <div className="dsa-header">
        <h1 className="dsa-title" style={{ color: theme.text }}>DSA Tracker</h1>
        <p className="dsa-subtitle" style={{ color: theme.textDim }}>
          Track your progress across top DSA sheets
        </p>
      </div>

      {/* Sheet Tabs */}
      <div className="sheet-tabs">
        {SHEETS.map(sheet => (
          <button
            key={sheet}
            className="sheet-tab"
            onClick={() => setActiveSheet(sheet)}
            style={{
              background: activeSheet === sheet ? '#22c55e' : theme.bgSecond,
              borderColor: activeSheet === sheet ? '#22c55e' : theme.border,
              color: activeSheet === sheet ? '#000' : theme.textMuted,
              fontWeight: activeSheet === sheet ? '700' : '500',
            }}
          >
            {sheet === 'Striver A2Z'  && '📘 '}
            {sheet === 'Blind 75'     && '🎯 '}
            {sheet === 'NeetCode 150' && '⚡ '}
            {sheet}
          </button>
        ))}
      </div>

      {/* Progress */}
      {!loading && (
        <div className="dsa-progress-bar-wrap"
          style={{ background: theme.bgSecond, borderColor: theme.border }}>
          <div className="dsa-progress-top">
            <span className="dsa-progress-label" style={{ color: theme.text }}>
              Progress — {activeSheet}
            </span>
            <span className="dsa-progress-count">
              {totalSolved} / {totalProbs} solved ({progressPct}%)
            </span>
          </div>
          <div className="dsa-progress-bg" style={{ background: theme.border }}>
            <div className="dsa-progress-fill" style={{ width: `${progressPct}%` }}/>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="dsa-filters">
        <div className="dsa-search-wrap"
          style={{ background: theme.bgSecond, borderColor: theme.border }}>
          <span style={{ marginRight:'8px', fontSize:'14px' }}>🔍</span>
          <input
            className="dsa-search-input"
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ color: theme.text }}
          />
        </div>
        {['All','Easy','Medium','Hard'].map(d => (
          <button
            key={d}
            className={`dsa-filter-btn ${diffFilter === d ? 'active' : ''}`}
            onClick={() => setDiffFilter(d)}
            style={{
              background: diffFilter === d ? '#22c55e' : theme.bgSecond,
              borderColor: diffFilter === d ? '#22c55e' : theme.border,
              color: diffFilter === d ? '#000' : theme.textMuted,
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="dsa-loading">
          <div className="dsa-loading-icon">📊</div>
          <div style={{ color:'#22c55e', fontSize:'14px' }}>Loading problems...</div>
        </div>
      )}

      {/* Problems */}
      {!loading && (
        <div>
          {steps.map(step => {
            const stepProblems = groupedByStep[step];
            if (!stepProblems || stepProblems.length === 0) return null;

            const stepSolved = stepProblems.filter(p => solved[p._id]).length;
            const isOpen = openSteps[step];

            return (
              <div key={step} className="step-group">
                {/* Step Header */}
                <div
                  className="step-header"
                  style={{
                    background: theme.bgSecond,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  onClick={() => toggleStep(step)}
                >
                  <span className={`step-arrow ${isOpen ? 'open' : ''}`}>▶</span>
                  <span className="step-title">{step}</span>
                  <span className="step-count">
                    {stepSolved}/{stepProblems.length}
                  </span>
                </div>

                {/* Problems List */}
                {isOpen && (
                  <div style={{
                    background: theme.bgSecond,
                    borderRadius: '0 0 10px 10px',
                    border: `1px solid ${theme.border}`,
                    borderTop: 'none',
                    overflow: 'hidden',
                  }}>
                    {stepProblems.map((problem, idx) => (
                      <div
                        key={problem._id}
                        className="problem-row"
                        style={{
                          borderBottom: idx < stepProblems.length - 1
                            ? `1px solid ${theme.border}`
                            : 'none',
                          background: solved[problem._id]
                            ? 'rgba(34,197,94,0.03)'
                            : 'transparent',
                        }}
                        onClick={() => toggleSolved(problem._id)}
                      >
                        {/* Checkbox */}
                        <div className={`problem-checkbox ${solved[problem._id] ? 'checked' : ''}`}
                          style={{ borderColor: solved[problem._id] ? '#22c55e' : theme.textDim }}
                        />

                        {/* Title */}
                        <span
                          className={`problem-title ${solved[problem._id] ? 'solved' : ''}`}
                          style={{ color: theme.text }}
                        >
                          {problem.title}
                        </span>

                        {/* Difficulty Badge */}
                        <span className={`problem-badge badge-${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>

                      {problem.leetcodeUrl && (
    <a
    href={problem.leetcodeUrl}
    target="_blank"
    rel="noreferrer"
    className="problem-lc-link"
    onClick={e => e.stopPropagation()}
  >
    LC →
  </a>
)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DSATracker;