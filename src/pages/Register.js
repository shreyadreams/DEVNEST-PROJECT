import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
const NEBULAS = [
  { top: 10, left: 5,  color: 'rgba(34,197,94,0.06)',  size: 500, dur: 25 },
  { top: 60, left: 60, color: 'rgba(59,130,246,0.05)', size: 400, dur: 30 },
  { top: 30, left: 80, color: 'rgba(168,85,247,0.04)', size: 350, dur: 20 },
];

function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords match nahi kar rahe!');
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      login(res.data.token, res.data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',     label: 'Full Name',       type: 'text',     icon: '👤', placeholder: 'Shrey Jain' },
    { name: 'email',    label: 'Email Address',   type: 'email',    icon: '✉️', placeholder: 'shrey@gmail.com' },
    { name: 'password', label: 'Password',        type: 'password', icon: '🔒', placeholder: '••••••••' },
    { name: 'confirm',  label: 'Confirm Password',type: 'password', icon: '🔒', placeholder: '••••••••' },
  ];

  return (
    <div style={s.page}>

      {/* Universe Background */}
      <div style={s.universe}>
        {NEBULAS.map((n, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${n.top}%`, left: `${n.left}%`,
            width: `${n.size}px`, height: `${n.size}px`,
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `nebula ${n.dur}s ease-in-out infinite`,
            animationDelay: `${i * 3}s`,
          }} />
        ))}
        {STARS.map(star => (
          <div key={star.id} style={{
            position: 'absolute',
            top: `${star.top}%`, left: `${star.left}%`,
            width: `${star.size}px`, height: `${star.size}px`,
            background: '#ffffff', borderRadius: '50%',
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }} />
        ))}
      </div>

      <div style={s.glowTop}></div>
      <div style={s.glowBottom}></div>

     {/* Left Panel */}
<div style={s.left}>
  <div style={s.logo}>
    <span style={s.owl}>🦉</span>
    <span style={s.logoText}>DevNest</span>
    <span style={s.betaBadge}>BETA</span>
  </div>

  <h1 style={s.headline}>
    Built for developers<br />
    <span style={s.highlight}>who mean business.</span>
  </h1>
  <p style={s.subtext}>
    Most developers prepare in circles — random problems, 
    scattered resources, no direction. DevNest changes that. 
    One platform. Clear progress. Real results.
  </p>

  <div style={s.steps}>
    {[
      { step: '01', title: 'Create your free account',   desc: 'No credit card. No catch. Just sign up.'         },
      { step: '02', title: 'Connect your GitHub',        desc: 'Sync repos, commits and contribution heatmap.'   },
      { step: '03', title: 'Pick your DSA sheet',        desc: 'Striver, Blind 75, or company-specific lists.'   },
      { step: '04', title: 'Let AI guide your prep',     desc: 'Get a personalized roadmap based on your gaps.'  },
    ].map(item => (
      <div key={item.step} style={s.stepItem}>
        <div style={s.stepNum}>{item.step}</div>
        <div>
          <div style={s.stepTitle}>{item.title}</div>
          <div style={s.stepDesc}>{item.desc}</div>
        </div>
      </div>
    ))}
  </div>
</div>
      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardGlow}></div>

          <div style={s.cardHeader}>
           <h2 style={s.cardTitle}>Create your account 🚀</h2>
<p style={s.cardSub}>Free forever — get started in 30 seconds</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.name} style={s.field}>
                <label style={s.label}>{f.label}</label>
                <div style={{
                  ...s.inputWrap,
                  borderColor: focused === f.name ? '#22c55e' : '#2a2a2a'
                }}>
                  <span style={s.inputIcon}>{f.icon}</span>
                  <input
                    style={s.input}
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    onFocus={() => setFocused(f.name)}
                    onBlur={() => setFocused('')}
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              style={loading ? { ...s.btn, opacity: 0.75 } : s.btn}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Join DevNest — Free →'}
            </button>
          </form>

          <p style={s.bottomText}>
            Already having account?{' '}
            <a href="/login" style={s.link}>Login</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 1; transform: scale(1);   }
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
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowTop: {
    position: 'fixed',
    top: '-200px', left: '-100px',
    width: '600px', height: '600px',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  glowBottom: {
    position: 'fixed',
    bottom: '-200px', right: '-100px',
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
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
    marginBottom: '48px',
  },
  owl: { fontSize: '36px' },
  logoText: {
    fontSize: '24px', fontWeight: '700',
    color: '#ffffff', letterSpacing: '-0.5px',
  },
  betaBadge: {
    fontSize: '10px', fontWeight: '600',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '4px', padding: '2px 7px', letterSpacing: '1px',
  },
  headline: {
    fontSize: '42px', fontWeight: '700',
    color: '#ffffff', lineHeight: '1.2',
    letterSpacing: '-1px', marginBottom: '16px',
  },
  highlight: {
    background: 'linear-gradient(90deg, #22c55e, #4ade80)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtext: {
    color: '#6b7280', fontSize: '15px',
    lineHeight: '1.7', maxWidth: '380px',
    marginBottom: '40px',
  },
  steps: {
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  stepItem: {
    display: 'flex', alignItems: 'flex-start', gap: '16px',
  },
  stepNum: {
    fontSize: '11px', fontWeight: '700',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: '6px', padding: '4px 8px',
    letterSpacing: '1px', minWidth: '32px',
    textAlign: 'center',
  },
  stepTitle: {
    color: '#ffffff', fontSize: '14px',
    fontWeight: '500', marginBottom: '2px',
  },
  stepDesc: { color: '#6b7280', fontSize: '12px' },
  right: {
    flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px', position: 'relative', zIndex: 1,
  },
  card: {
    width: '100%', maxWidth: '440px',
    background: '#0f0f0f',
    border: '1px solid #1a1a1a',
    borderRadius: '24px', padding: '40px',
    position: 'relative', overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: '-80px', right: '-80px',
    width: '250px', height: '250px',
    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  cardHeader: { marginBottom: '28px' },
  cardTitle: {
    color: '#ffffff', fontSize: '24px',
    fontWeight: '600', marginBottom: '6px',
  },
  cardSub: { color: '#6b7280', fontSize: '13px' },
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#ef4444', fontSize: '13px',
    marginBottom: '20px',
    display: 'flex', gap: '8px', alignItems: 'center',
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block', color: '#9ca3af',
    fontSize: '11px', fontWeight: '500',
    marginBottom: '7px', letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center',
    background: '#080808',
    border: '1px solid #2a2a2a',
    borderRadius: '12px', padding: '0 16px',
    transition: 'border-color 0.2s',
  },
  inputIcon: { fontSize: '14px', marginRight: '10px' },
  input: {
    flex: 1, padding: '13px 0',
    background: 'transparent', border: 'none',
    color: '#ffffff', fontSize: '14px', outline: 'none',
  },
  btn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: 'none', borderRadius: '12px',
    color: '#000', fontSize: '15px', fontWeight: '700',
    cursor: 'pointer', marginTop: '8px',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
  },
  bottomText: {
    textAlign: 'center', color: '#6b7280',
    fontSize: '13px', marginTop: '20px',
  },
  link: {
    color: '#22c55e', textDecoration: 'none', fontWeight: '500',
  },
};

export default Register;