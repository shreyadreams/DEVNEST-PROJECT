import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Stars generate karne ka function — component ke bahar hai
// Taaki har render pe naye stars na banein
const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top:      Math.random() * 100,
    left:     Math.random() * 100,
    size:     Math.random() * 2.5 + 0.5,
    duration: Math.random() * 4 + 2,
    delay:    Math.random() * 5,
  }));
};

const STARS = generateStars(120);

const SHOOTING_STARS = [
  { top: 10, left: 5,  delay: 0  },
  { top: 25, left: 40, delay: 4  },
  { top: 60, left: 15, delay: 8  },
  { top: 80, left: 60, delay: 12 },
];

const NEBULAS = [
  { top: 10, left: 5,  color: 'rgba(34,197,94,0.06)',  size: 500, dur: 25 },
  { top: 60, left: 60, color: 'rgba(59,130,246,0.05)', size: 400, dur: 30 },
  { top: 30, left: 80, color: 'rgba(168,85,247,0.04)', size: 350, dur: 20 },
  { top: 80, left: 20, color: 'rgba(249,115,22,0.04)', size: 300, dur: 35 },
];

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── Universe Background ── */}
      <div style={s.universe}>

        {/* Nebula blobs */}
        {NEBULAS.map((n, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${n.top}%`,
            left: `${n.left}%`,
            width: `${n.size}px`,
            height: `${n.size}px`,
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `nebula ${n.dur}s ease-in-out infinite`,
            animationDelay: `${i * 3}s`,
          }} />
        ))}

        {/* Twinkling stars */}
        {STARS.map(star => (
          <div key={star.id} style={{
            position: 'absolute',
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#ffffff',
            borderRadius: '50%',
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }} />
        ))}

        {/* Shooting stars */}
        {SHOOTING_STARS.map((ss, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${ss.top}%`,
            left: `${ss.left}%`,
            height: '1px',
            width: '3px',
            background: 'linear-gradient(90deg, #ffffff, transparent)',
            borderRadius: '999px',
            animation: `shootingStar 3s linear infinite`,
            animationDelay: `${ss.delay}s`,
            opacity: 0,
          }} />
        ))}
      </div>

      {/* ── Glow effects ── */}
      <div style={s.glowTop}></div>
      <div style={s.glowBottom}></div>

      {/* Left Panel */}
<div style={s.left}>
  <div style={s.logo}>
    <span style={s.owl}>🦉</span>
    <span style={s.logoText}>DevNest</span>
    <span style={s.betaBadge}>BETA</span>
  </div>

  <div style={s.heroText}>
    <h1 style={s.headline}>
      Your career.<br />
      <span style={s.highlight}>Engineered.</span>
    </h1>
    <p style={s.subtext}>
      Stop grinding blindly. DevNest gives you a clear path — 
      track every problem you solve, analyze your code footprint, 
      and know exactly how ready you are before walking into any interview.
    </p>
  </div>

  <div style={s.statsRow}>
    {[
      { num: '25+',  label: 'DSA Problems'     },
      { num: 'AI',   label: 'Powered Mentor'   },
      { num: '100%', label: 'Free to Use'      },
    ].map(stat => (
      <div key={stat.label} style={s.statBox}>
        <div style={s.statNum}>{stat.num}</div>
        <div style={s.statLabel}>{stat.label}</div>
      </div>
    ))}
  </div>

  <div style={s.featureList}>
    {[
      { icon: '📊', text: 'Track DSA problems across Striver, Blind 75 & more' },
      { icon: '🐙', text: 'Visualize your GitHub activity & top languages'      },
      { icon: '🤖', text: 'Get an AI mentor that knows your weak spots'         },
      { icon: '🎯', text: 'See your interview readiness score per company'      },
    ].map(f => (
      <div key={f.text} style={s.featureItem}>
        <span style={s.featureIcon}>{f.icon}</span>
        <span style={s.featureText}>{f.text}</span>
      </div>
    ))}
  </div>
</div>

      {/* ── Right Panel ── */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardGlow}></div>

          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Welcome back 👋</h2>
            <p style={s.cardSub}>Login to continue your journey</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <div style={{
                ...s.inputWrap,
                borderColor: focused === 'email' ? '#22c55e' : '#2a2a2a'
              }}>
                <span style={s.inputIcon}>✉️</span>
                <input
                  style={s.input}
                  type="email"
                  placeholder="shreya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{
                ...s.inputWrap,
                borderColor: focused === 'password' ? '#22c55e' : '#2a2a2a'
              }}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  style={s.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={loading ? { ...s.btn, opacity: 0.75 } : s.btn}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue to DevNest →'}
            </button>
          </form>

          <div style={s.divider}>
            <div style={s.dividerLine}></div>
            <span style={s.dividerText}>or</span>
            <div style={s.dividerLine}></div>
          </div>

          <p style={s.bottomText}>
            New account?{' '}
            <a href="/register" style={s.link}>Register your acoount  — It's free!</a>
          </p>
        </div>
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 1; transform: scale(1);   }
        }
        @keyframes shootingStar {
          0%   { opacity: 1; width: 3px;  transform: translateX(0)    translateY(0)    rotate(-45deg); }
          100% { opacity: 0; width: 80px; transform: translateX(300px) translateY(300px) rotate(-45deg); }
        }
        @keyframes nebula {
          0%   { transform: translate(-50%,-50%) scale(1)   rotate(0deg);   opacity: 0.4; }
          50%  { transform: translate(-50%,-50%) scale(1.1) rotate(180deg); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(1)   rotate(360deg); opacity: 0.4; }
        }
      `}</style>

    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#080808',
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  universe: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowTop: {
    position: 'fixed',
    top: '-200px', left: '-100px',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowBottom: {
    position: 'fixed',
    bottom: '-200px', right: '-100px',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  left: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 70px',
    position: 'relative',
    zIndex: 1,
    borderRight: '1px solid #111',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '56px',
  },
  owl: { fontSize: '36px' },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  betaBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '4px',
    padding: '2px 7px',
    letterSpacing: '1px',
  },
  heroText: { marginBottom: '48px' },
  headline: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.15',
    letterSpacing: '-1px',
    marginBottom: '16px',
  },
  highlight: {
    background: 'linear-gradient(90deg, #22c55e, #4ade80)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtext: {
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: '1.7',
    maxWidth: '380px',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '40px',
  },
  statBox: {
    background: '#111',
    border: '1px solid #1f1f1f',
    borderRadius: '12px',
    padding: '16px 20px',
    minWidth: '90px',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#6b7280',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  featureIcon: { fontSize: '16px' },
  featureText: { color: '#9ca3af', fontSize: '14px' },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#0f0f0f',
    border: '1px solid #1a1a1a',
    borderRadius: '24px',
    padding: '48px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: '-80px', right: '-80px',
    width: '250px', height: '250px',
    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  cardHeader: { marginBottom: '32px' },
  cardTitle: {
    color: '#ffffff',
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  cardSub: { color: '#6b7280', fontSize: '14px' },
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '8px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: '#080808',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '0 16px',
    transition: 'border-color 0.2s',
  },
  inputIcon: { fontSize: '14px', marginRight: '10px' },
  input: {
    flex: 1,
    padding: '14px 0',
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#1f1f1f',
  },
  dividerText: {
    color: '#4b5563',
    fontSize: '12px',
  },
  bottomText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '13px',
  },
  link: {
    color: '#22c55e',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;