import React, { useState, useEffect } from 'react';
import '../styles/Landing.css';

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  top:      Math.random() * 100,
  left:     Math.random() * 100,
  size:     Math.random() * 2 + 0.5,
  duration: Math.random() * 3 + 2,
  delay:    Math.random() * 4,
}));

const HEATMAP = Array.from({ length: 105 }, () => {
  const r = Math.random();
  return r > 0.6
    ? `rgba(34,197,94,${r.toFixed(2)})`
    : r > 0.3
    ? 'rgba(34,197,94,0.15)'
    : '#1f1f1f';
});

function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="landing-page">

      {/* Stars */}
      <div className="stars-container">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            top:`${s.top}%`, left:`${s.left}%`,
            width:`${s.size}px`, height:`${s.size}px`,
            animationDuration:`${s.duration}s`,
            animationDelay:`${s.delay}s`,
          }}/>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-logo">
          <img src="/penguin.png" alt="logo"
            style={{ width:'34px', height:'34px', objectFit:'contain' }}/>
          <span className="navbar-logo-text">Dev<span>Nest</span></span>
          <span className="navbar-beta">BETA</span>
        </div>
        <div className="navbar-links">
          {['DSA Tracker','GitHub Analytics','AI Mentor','Portfolio'].map(l => (
            <span key={l} className="navbar-link">{l}</span>
          ))}
        </div>
        <a href="/login" className="navbar-cta">Login / Signup →</a>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">

        {/* Headline — TOP CENTER */}
        <div className="hero-text-block">
          <h1 className="hero-headline">Track, analyze & share</h1>
          <p className="hero-sub">
            <strong>Dev<span>Nest</span></strong> helps you navigate and
            track your coding journey to success
          </p>
          <div className="hero-btns">
            <a href="/login"    className="btn-outline">Profile Tracker</a>
            <a href="/register" className="btn-green">Get Started →</a>
          </div>
        </div>

        {/* Visual */}
        <div className="hero-visual-wrap">

          {/* Penguin — LEFT overlapping */}
          <div className="mascot">
            <img
              src="/penguin.png"
              alt="DevNest Mascot"
              style={{ width:'260px', height:'auto' }}
            />
          </div>

          {/* Dashboard */}
          <div className="dash-card">
            <div className="browser-bar">
              <div className="bdot" style={{ background:'#ef4444' }}/>
              <div className="bdot" style={{ background:'#f59e0b' }}/>
              <div className="bdot" style={{ background:'#22c55e' }}/>
              <div className="bbar"/>
            </div>

            <div className="dash-profile">
              <img src="/shrey.jpg" alt="Profile" style={{
                width:'48px', height:'48px', borderRadius:'50%',
                objectFit:'cover', objectPosition:'center top',
                border:'2px solid #22c55e', flexShrink:0,
              }}/>
              <div>
                <div className="dash-name">Shrey Jain ✅</div>
                <div className="dash-handle">@shreyjain</div>
              </div>
              <div className="dash-updated">Last updated today</div>
            </div>

            <div className="dash-stats">
              {[
                { label:'Total Questions', value:'25',  green:false },
                { label:'Active Days',     value:'12',  green:false },
                { label:'AI Readiness',    value:'78%', green:true  },
              ].map(s => (
                <div key={s.label} className="dash-stat">
                  <div className={`dash-stat-num ${s.green?'green':''}`}>{s.value}</div>
                  <div className="dash-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="dash-rings-card">
              <div className="dash-rings-title">Problems Solved</div>
              <div className="dash-rings">
                {[
                  { label:'Easy',   val:80, color:'#22c55e' },
                  { label:'Medium', val:45, color:'#f59e0b' },
                  { label:'Hard',   val:20, color:'#ef4444'  },
                ].map(ring => (
                  <div key={ring.label} className="dash-ring-item">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#2a2a2a" strokeWidth="6"/>
                      <circle cx="36" cy="36" r="28" fill="none" stroke={ring.color} strokeWidth="6"
                        strokeDasharray={`${ring.val * 1.759} 175.9`}
                        strokeLinecap="round" transform="rotate(-90 36 36)"
                      />
                      <text x="36" y="41" textAnchor="middle"
                        fill={ring.color} fontSize="12" fontWeight="700" fontFamily="Poppins">
                        {ring.val}%
                      </text>
                    </svg>
                    <span className="dash-ring-label">{ring.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Graph */}
            <div className="dash-graph">
              <div className="graph-header">
                <div>
                  <div className="graph-rating-label">Rating</div>
                  <div className="graph-rating-num">1718</div>
                </div>
                <div className="graph-date">
                  <div>14 Sept 2020</div>
                  <div>September Challenge</div>
                </div>
              </div>
              <svg width="100%" height="90" viewBox="0 0 600 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                <path d="M0,85 C50,80 100,70 150,55 S250,25 300,18 S400,14 450,16 S530,18 600,16"
                  fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M0,85 C50,80 100,70 150,55 S250,25 300,18 S400,14 450,16 S530,18 600,16 L600,90 L0,90Z"
                  fill="url(#g1)"/>
              </svg>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                {['1500','1550','1600','1650','1700','1750','1800'].map(v => (
                  <span key={v} style={{ fontSize:'9px', color:'#4b5563' }}>{v}</span>
                ))}
              </div>
            </div>

            <div className="dash-heatmap">
              <div className="dash-heatmap-title">Contribution Activity — Last 6 months</div>
              <div className="heatmap-grid">
                {HEATMAP.map((color, i) => (
                  <div key={i} className="hcell" style={{ background:color }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Card */}
          <div className="float-card">
            <div className="float-card-title">🐧 DevNest CARD</div>
            <img src="/shrey.jpg" alt="Profile" style={{
              width:'58px', height:'58px', borderRadius:'50%',
              objectFit:'cover', objectPosition:'center top',
              border:'2px solid #22c55e', display:'block', margin:'0 auto 10px',
            }}/>
            <div className="float-name">Shrey Jain ✅</div>
            <div className="float-handle">@shreyjain</div>
            <div className="float-stats">
              <div>
                <div className="float-num" style={{ color:'#fff' }}>25</div>
                <div className="float-label">Questions</div>
              </div>
              <div className="float-divider"/>
              <div>
                <div className="float-num" style={{ color:'#22c55e' }}>7</div>
                <div className="float-label">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {[
            { num:'25+',  lbl:'DSA Problems'   },
            { num:'AI',   lbl:'Powered Mentor' },
            { num:'100%', lbl:'Free to Use'    },
            { num:'1',    lbl:'Platform'       },
          ].map(s => (
            <div key={s.lbl} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"/>

      {/* DSA Section */}
      <section className="section">
        <div className="section-inner">
          <div className="sec-label">DSA Tracker</div>
          <h2 className="sec-title">Track your coding sheets<br/><span>in one place</span></h2>
          <p className="sec-sub">Striver, Blind 75, company-specific lists — track every problem, mark solved, filter by difficulty.</p>
          <a href="/dashboard" className="sec-link">Try DSA Tracker →</a>
          <div className="dsa-card">
            <div className="dsa-head">
              <span className="dsa-head-title">📊 DSA Sheet Tracker</span>
              <span style={{ fontSize:'11px', color:'#22c55e' }}>2/6 solved</span>
            </div>
            {[
              { title:'Two Sum',                             diff:'Easy',   solved:true  },
              { title:'Best Time to Buy and Sell Stock',     diff:'Easy',   solved:true  },
              { title:'Maximum Subarray',                    diff:'Medium', solved:false },
              { title:'Longest Substring Without Repeating', diff:'Medium', solved:false },
              { title:'Number of Islands',                   diff:'Medium', solved:false },
              { title:'Merge k Sorted Lists',                diff:'Hard',   solved:false },
            ].map((p,i) => (
              <div key={i} className="dsa-row">
                <div className={`dsa-circle ${p.solved?'solved':''}`}/>
                <span className="dsa-title" style={{
                  textDecoration: p.solved ? 'line-through' : 'none',
                  color: p.solved ? '#6b7280' : '#e5e7eb',
                }}>{p.title}</span>
                <span className={`dsa-badge ${p.diff.toLowerCase()}`}>{p.diff}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* Numbers */}
      <section className="nums-section">
        <div className="nums-inner">
          <h2 className="nums-title">See cumulative progress</h2>
          <p className="nums-sub">All your coding platforms in one place</p>
          <div className="nums-grid">
            {[
              { num:'25+',  lbl:'Total DSA Problems',    color:'#fff'     },
              { num:'12',   lbl:'Total Active Days',     color:'#fff'     },
              { num:'78%',  lbl:'AI Interview Readiness',color:'#22c55e' },
              { num:'∞',    lbl:'Free Forever',          color:'#22c55e' },
            ].map(n => (
              <div key={n.lbl} className="num-card">
                <div className="num-big" style={{ color:n.color }}>{n.num}</div>
                <div className="num-lbl">{n.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* Features */}
      <section className="section">
        <div className="section-inner">
          <div className="sec-label">Everything in One Place</div>
          <h2 className="sec-title">Your <span>All-in-One</span> Coding Portfolio</h2>
          <div className="features-grid">
            {[
              { icon:'📊', title:'DSA Sheet Tracker',        desc:'Track Striver, Blind 75 and company-wise questions with progress analytics.' },
              { icon:'🐙', title:'GitHub Analytics',          desc:'Sync your repos, view contribution heatmap, top languages and commit stats.' },
              { icon:'🤖', title:'AI Coding Mentor',          desc:'Get personalized roadmap based on your weak spots — not generic tips.' },
              { icon:'🎯', title:'Interview Readiness Score', desc:'Google, Amazon, Microsoft readiness score — company specific.' },
              { icon:'🌐', title:'Shareable Portfolio',       desc:'Public profile at devnest.app/username — share with recruiters.' },
              { icon:'📄', title:'Resume Generator',          desc:'Auto-generate a clean resume PDF from your profile data.' },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* CTA */}
      <section className="cta-sec">
        <h2 className="cta-title">Ready to <span>unlock</span><br/>your Coding Portfolio?</h2>
        <p className="cta-sub">Join developers who are acing their interviews with DevNest</p>
        <a href="/register" className="btn-green">Login / Signup →</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">Dev<span>Nest</span></div>
        <div className="footer-links">
          {['FAQ','Privacy','Terms','Contact'].map(l => (
            <a key={l} href="#" className="footer-link">{l}</a>
          ))}
        </div>
        <div className="footer-copy">© 2026 DevNest. All rights reserved.</div>
      </footer>

    </div>
  );
}

export default Landing;