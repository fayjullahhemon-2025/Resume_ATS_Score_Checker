import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Sparkles, ArrowRight, FileCheck, Code, Award, Zap } from 'lucide-react';

gsap.registerPlugin(MotionPathPlugin);

// ─── Blob shape sequences (same M+4C+Z structure for smooth morphing) ─────────
const BLOB_SHAPES = {
  emerald: [
    'M200,60 C280,58 342,118 342,200 C342,282 280,342 200,342 C120,342 58,282 58,200 C58,118 120,62 200,60 Z',
    'M218,52 C305,62 358,128 348,210 C338,288 268,348 186,338 C104,328 52,262 64,178 C76,96 134,44 218,52 Z',
    'M200,48 C298,48 362,104 358,198 C354,292 290,358 196,358 C102,358 42,298 42,204 C42,110 106,48 200,48 Z',
    'M192,55 C276,50 338,112 332,198 C326,284 262,346 180,344 C98,342 44,278 50,192 C56,108 112,60 192,55 Z',
  ],
  indigo: [
    'M200,65 C275,58 338,115 340,195 C342,275 280,340 202,342 C124,344 60,282 60,202 C60,122 122,72 200,65 Z',
    'M212,58 C292,65 350,124 344,206 C338,284 272,344 194,340 C114,336 56,272 62,192 C68,112 130,52 212,58 Z',
    'M195,55 C280,52 348,110 345,195 C342,280 278,348 195,348 C112,348 48,284 48,200 C48,116 112,58 195,55 Z',
    'M205,62 C285,56 345,120 342,202 C339,284 274,344 195,342 C116,340 56,278 60,198 C64,118 126,68 205,62 Z',
  ],
  purple: [
    'M200,58 C282,52 345,112 344,196 C343,280 280,344 198,345 C116,346 54,284 54,200 C54,116 118,64 200,58 Z',
    'M215,55 C298,60 354,122 348,208 C342,290 274,348 192,344 C110,340 52,276 58,194 C64,112 132,50 215,55 Z',
    'M196,50 C284,46 352,108 350,198 C348,288 284,354 198,354 C112,354 46,290 48,202 C50,114 112,54 196,50 Z',
    'M208,60 C290,58 348,118 345,202 C342,286 276,346 194,344 C112,342 52,280 56,196 C60,112 126,62 208,60 Z',
  ],
};

// ─── Motion-path waypoint definitions (viewBox 1200 500) ────────────────────
const MOTION_PATHS = [
  // Flowing S-curve across top
  'M-20,80 C120,20 280,140 440,80 C600,20 720,120 900,60 C1020,20 1100,80 1240,50',
  // Wide arch bottom
  'M-20,420 C150,380 300,460 480,400 C640,340 780,440 960,380 C1080,340 1160,400 1240,370',
  // Diagonal river top-left to bottom-right
  'M-20,30 C100,80 200,200 360,260 C500,320 640,240 780,300 C900,350 1020,440 1240,480',
  // Reverse diagonal
  'M1240,40 C1100,100 950,60 800,140 C650,220 540,160 380,240 C240,300 120,380 -20,460',
  // Central wave
  'M-20,250 C150,180 300,320 500,250 C680,180 820,320 1000,250 C1100,210 1160,260 1240,240',
  // Short inner arc — left cluster
  'M80,150 C140,80 260,80 320,150 C380,220 340,320 260,340 C180,360 80,300 80,220 C80,190 80,165 80,150',
  // Short inner arc — right cluster
  'M920,120 C980,60 1080,70 1120,140 C1160,210 1120,310 1050,330 C980,350 900,290 910,220 C912,180 918,140 920,120',
];

// Particles configuration: which path, color, speed, delay, size
const PARTICLES = [
  { path: 0, color: '#10b981', duration: 9,  delay: 0,   r: 3.5 },
  { path: 0, color: '#06b6d4', duration: 12, delay: 3,   r: 2.5 },
  { path: 0, color: '#10b981', duration: 7,  delay: 6,   r: 2   },
  { path: 1, color: '#6366f1', duration: 11, delay: 1,   r: 3   },
  { path: 1, color: '#a855f7', duration: 8,  delay: 4.5, r: 2.5 },
  { path: 1, color: '#6366f1', duration: 14, delay: 7,   r: 2   },
  { path: 2, color: '#a855f7', duration: 13, delay: 0.5, r: 3   },
  { path: 2, color: '#ec4899', duration: 9,  delay: 5,   r: 2   },
  { path: 3, color: '#10b981', duration: 11, delay: 2,   r: 2.5 },
  { path: 3, color: '#06b6d4', duration: 8,  delay: 6,   r: 3   },
  { path: 4, color: '#f59e0b', duration: 10, delay: 1.5, r: 2.5 },
  { path: 4, color: '#10b981', duration: 13, delay: 5.5, r: 2   },
  { path: 5, color: '#a855f7', duration: 6,  delay: 0,   r: 2.5 },
  { path: 5, color: '#6366f1', duration: 8,  delay: 3,   r: 2   },
  { path: 6, color: '#10b981', duration: 7,  delay: 1,   r: 2.5 },
  { path: 6, color: '#ec4899', duration: 9,  delay: 4,   r: 2   },
];

// Neural network node positions
const NODES = [
  { x: 80,   y: 150, color: '#10b981', r: 5 },
  { x: 320,  y: 150, color: '#10b981', r: 4 },
  { x: 260,  y: 340, color: '#6366f1', r: 4 },
  { x: 440,  y: 80,  color: '#06b6d4', r: 5 },
  { x: 500,  y: 250, color: '#10b981', r: 3 },
  { x: 780,  y: 300, color: '#a855f7', r: 5 },
  { x: 900,  y: 60,  color: '#06b6d4', r: 3 },
  { x: 960,  y: 380, color: '#6366f1', r: 4 },
  { x: 920,  y: 120, color: '#10b981', r: 5 },
  { x: 1050, y: 330, color: '#a855f7', r: 4 },
  { x: 1120, y: 140, color: '#ec4899', r: 3 },
  { x: 1000, y: 250, color: '#10b981', r: 4 },
];

const HeroSection = ({ setActiveTab }) => {
  const containerRef  = useRef(null);
  const titleRef      = useRef(null);
  const subtitleRef   = useRef(null);
  const buttonsRef    = useRef(null);
  const cardRef       = useRef(null);
  const svgRef        = useRef(null);
  const blob1Ref      = useRef(null);
  const blob2Ref      = useRef(null);
  const blob3Ref      = useRef(null);
  const badgeRef      = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── 1. MORPHING BLOBS ────────────────────────────────────────────────
      const morphBlob = (pathEl, shapes, baseDuration) => {
        let idx = 0;
        const next = () => {
          idx = (idx + 1) % shapes.length;
          gsap.to(pathEl, {
            attr: { d: shapes[idx] },
            duration: baseDuration + Math.random() * 2,
            ease: 'sine.inOut',
            onComplete: next,
          });
        };
        next();
      };
      if (blob1Ref.current) morphBlob(blob1Ref.current, BLOB_SHAPES.emerald, 5);
      if (blob2Ref.current) morphBlob(blob2Ref.current, BLOB_SHAPES.indigo,  6);
      if (blob3Ref.current) morphBlob(blob3Ref.current, BLOB_SHAPES.purple,  7);

      // ── 2. BLOB SCALE BREATHING ─────────────────────────────────────────
      gsap.to('.morph-blob-1', { scale: 1.12, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%' });
      gsap.to('.morph-blob-2', { scale: 1.08, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%', delay: 2 });
      gsap.to('.morph-blob-3', { scale: 1.15, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: '50% 50%', delay: 1 });

      // ── 3. MOTION PATH PARTICLES ─────────────────────────────────────────
      PARTICLES.forEach((p, i) => {
        const el = document.getElementById(`mp-particle-${i}`);
        if (!el) return;
        gsap.set(el, { opacity: 0 });
        gsap.to(el, {
          motionPath: {
            path: `#mp-path-${p.path}`,
            align: `#mp-path-${p.path}`,
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
          },
          duration: p.duration,
          delay: p.delay,
          repeat: -1,
          ease: 'none',
          opacity: 1,
        });
        // Particle fade pulse
        gsap.to(el, {
          opacity: 0.2,
          duration: p.duration * 0.3,
          delay: p.delay + p.duration * 0.7,
          repeat: -1,
          repeatDelay: p.duration * 0.7,
          ease: 'power2.in',
        });
      });

      // ── 4. PARTICLE TRAIL (comet tail) ────────────────────────────────────
      // Extra "tail" particles that follow behind with offset
      [0, 1, 2, 3, 4].forEach(pathIdx => {
        ['#10b981', '#06b6d4', '#a855f7'].forEach((color, ci) => {
          const trailId = `mp-trail-${pathIdx}-${ci}`;
          const el = document.getElementById(trailId);
          if (!el) return;
          gsap.to(el, {
            motionPath: {
              path: `#mp-path-${pathIdx}`,
              align: `#mp-path-${pathIdx}`,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
            },
            duration: 10 + pathIdx * 2,
            delay: ci * 0.6,
            repeat: -1,
            ease: 'none',
          });
          gsap.to(el, { opacity: 0.15 + ci * 0.05, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: ci * 0.3 });
        });
      });

      // ── 5. NODE PULSE ───────────────────────────────────────────────────
      gsap.utils.toArray('.net-node').forEach((node, i) => {
        gsap.to(node, {
          r: parseFloat(node.getAttribute('r')) * 2.2,
          opacity: 0.12,
          duration: 1.5 + i * 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: i * 0.18,
        });
      });

      // ── 6. PATH LINE DASH ANIMATION ──────────────────────────────────────
      gsap.utils.toArray('.mp-visible-line').forEach((line, i) => {
        const len = line.getTotalLength ? line.getTotalLength() : 1000;
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, {
          strokeDashoffset: 0,
          duration: 2.5 + i * 0.4,
          delay: 0.3 + i * 0.2,
          ease: 'power2.out',
        });
      });

      // ── 7. HERO CONTENT STAGGER ENTRANCE ─────────────────────────────────
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current, buttonsRef.current], { opacity: 0, y: 40 });
      gsap.set(cardRef.current, { opacity: 0, scale: 0.85, rotateY: 25, rotateX: 8 });
      gsap.set('.feature-card-hero', { opacity: 0, y: 30, scale: 0.95 });

      const heroTL = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.3 });
      heroTL
        .to(badgeRef.current,    { opacity: 1, y: 0, duration: 0.7 })
        .to(titleRef.current,    { opacity: 1, y: 0, duration: 1 },   '-=0.4')
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.9 }, '-=0.7')
        .to(buttonsRef.current,  { opacity: 1, y: 0, duration: 0.7 }, '-=0.6')
        .to(cardRef.current,     { opacity: 1, scale: 1, rotateY: 0, rotateX: 0, duration: 1.4, ease: 'elastic.out(1, 0.7)' }, '-=0.7')
        .to('.feature-card-hero', { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.5)' }, '-=0.8');

      // ── 8. 3D TILT CARD ───────────────────────────────────────────────────
      const card = cardRef.current;
      if (card) {
        const onMove = (e) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(card, { rotateY: x * 0.07, rotateX: -y * 0.07, transformPerspective: 1000, duration: 0.5, ease: 'power2.out' });
        };
        const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out' });
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); };
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-container" ref={containerRef}>

      {/* ── MORPHING BLOB LAYER ───────────────────────────────────────── */}
      <div className="blob-layer" aria-hidden="true">
        <svg className="morph-blob-1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blob-blur-1"><feGaussianBlur stdDeviation="30" /></filter>
          </defs>
          <path ref={blob1Ref}
            d="M200,60 C280,58 342,118 342,200 C342,282 280,342 200,342 C120,342 58,282 58,200 C58,118 120,62 200,60 Z"
            fill="rgba(16,185,129,0.22)"
            filter="url(#blob-blur-1)"
          />
        </svg>

        <svg className="morph-blob-2" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blob-blur-2"><feGaussianBlur stdDeviation="35" /></filter>
          </defs>
          <path ref={blob2Ref}
            d="M200,65 C275,58 338,115 340,195 C342,275 280,340 202,342 C124,344 60,282 60,202 C60,122 122,72 200,65 Z"
            fill="rgba(99,102,241,0.2)"
            filter="url(#blob-blur-2)"
          />
        </svg>

        <svg className="morph-blob-3" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blob-blur-3"><feGaussianBlur stdDeviation="28" /></filter>
          </defs>
          <path ref={blob3Ref}
            d="M200,58 C282,52 345,112 344,196 C343,280 280,344 198,345 C116,346 54,284 54,200 C54,116 118,64 200,58 Z"
            fill="rgba(168,85,247,0.18)"
            filter="url(#blob-blur-3)"
          />
        </svg>
      </div>

      {/* ── MOTION PATH NETWORK CANVAS ───────────────────────────────────── */}
      <svg
        ref={svgRef}
        className="network-canvas"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Glowing filter for nodes */}
          <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="particle-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Hidden motion paths */}
          {MOTION_PATHS.map((d, i) => (
            <path key={i} id={`mp-path-${i}`} d={d} fill="none" />
          ))}
        </defs>

        {/* Visible faint path lines (draw-on animation via strokeDashoffset) */}
        {MOTION_PATHS.slice(0, 5).map((d, i) => (
          <path
            key={i}
            className="mp-visible-line"
            d={d}
            fill="none"
            stroke={['rgba(16,185,129,0.1)', 'rgba(99,102,241,0.1)', 'rgba(168,85,247,0.1)', 'rgba(6,182,212,0.1)', 'rgba(245,158,11,0.08)'][i]}
            strokeWidth="1.2"
          />
        ))}

        {/* Inner loop arcs (always visible, subtler) */}
        {MOTION_PATHS.slice(5).map((d, i) => (
          <path
            key={i}
            className="mp-visible-line"
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Node network dots */}
        {NODES.map((n, i) => (
          <g key={i} filter="url(#node-glow)">
            {/* Outer pulse ring */}
            <circle className="net-node" cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity="0.5" />
            {/* Core dot */}
            <circle cx={n.x} cy={n.y} r={n.r * 0.5} fill={n.color} opacity="0.9" />
          </g>
        ))}

        {/* Motion path particles */}
        {PARTICLES.map((p, i) => (
          <circle
            key={i}
            id={`mp-particle-${i}`}
            r={p.r}
            fill={p.color}
            opacity="0"
            filter="url(#particle-glow)"
          />
        ))}

        {/* Trail particles (smaller, slower, offset) */}
        {[0, 1, 2, 3, 4].map(pathIdx =>
          ['#10b981', '#06b6d4', '#a855f7'].map((color, ci) => (
            <circle
              key={`${pathIdx}-${ci}`}
              id={`mp-trail-${pathIdx}-${ci}`}
              r={1.5}
              fill={color}
              opacity="0.08"
            />
          ))
        )}
      </svg>

      {/* ── HERO GRID CONTENT ─────────────────────────────────────────────── */}
      <div className="hero-grid">
        <div className="hero-content">
          <div className="badge-wrapper" ref={badgeRef}>
            <span className="glass-panel hero-badge">
              <Zap size={14} className="text-emerald" />
              <span>Next-Gen ATS Optimization</span>
            </span>
          </div>

          <h1 className="hero-title" ref={titleRef}>
            Land Your Dream<br />
            Interview With{' '}
            <span className="gradient-text">ATSPulse</span>
          </h1>

          <p className="hero-subtitle" ref={subtitleRef}>
            An AI-powered diagnostic scanner engineered to dissect your resume, expose ATS filtering risks, fix formatting bugs, and live-generate industry-standard LaTeX code.
          </p>

          <div className="hero-actions" ref={buttonsRef}>
            <button onClick={() => setActiveTab('scan')} className="btn-primary btn-lg pulse-glow">
              <span>Scan Resume Free</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => setActiveTab('latex')} className="btn-secondary btn-lg">
              <Code size={18} />
              <span>LaTeX Builder</span>
            </button>
          </div>
        </div>

        {/* Interactive Mock Score Card */}
        <div className="hero-visual">
          <div className="glass-panel mock-score-card" ref={cardRef}>
            <div className="mock-card-header">
              <div className="mock-window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="mock-file-name">resume_software_engineer.pdf</div>
            </div>

            <div className="mock-card-body">
              <div className="score-dial-section">
                <div className="score-dial">
                  <svg className="progress-ring" width="160" height="160">
                    <defs>
                      <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <circle stroke="rgba(255,255,255,0.04)" strokeWidth="12" fill="transparent" r="68" cx="80" cy="80" />
                    <circle stroke="url(#emerald-grad)" strokeWidth="12" fill="transparent" r="68" cx="80" cy="80"
                      strokeDasharray="427" strokeDashoffset="90" strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <div className="score-number-overlay">
                    <span className="score-num">82</span>
                    <span className="score-label">ATS Score</span>
                  </div>
                </div>
                <div className="metrics-list-mini">
                  <div className="metric-row"><span className="metric-name">Keyword Match</span><span className="metric-val text-emerald">85%</span></div>
                  <div className="metric-row"><span className="metric-name">Impact Verbs</span><span className="metric-val text-accent">72%</span></div>
                  <div className="metric-row"><span className="metric-name">Structure</span><span className="metric-val" style={{color:'#10b981'}}>95%</span></div>
                </div>
              </div>
              <div className="mock-issues">
                <div className="issue-item warning">
                  <span className="issue-bullet"></span>
                  <span>Weak verb: <strong>"responsible for leading"</strong></span>
                </div>
                <div className="issue-item success">
                  <span className="issue-bullet"></span>
                  <span>Quantified achievements in <strong>"Experience"</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURE CARDS ─────────────────────────────────────────────────── */}
      <div className="features-grid">
        {[
          { Icon: FileCheck, cls: 'em-glow', col: 'text-emerald', title: 'AI Diagnostic Scoring', desc: 'Scan structures, fonts, sections, and keyword densities instantly inside the browser.' },
          { Icon: Sparkles, cls: 'purple-glow', col: 'text-accent', title: 'Grammar & Weak Verbs', desc: 'Expose weak verbs like "helped" and replace them with heavy-impact action words.' },
          { Icon: Code, cls: 'blue-glow', col: 'text-blue', title: 'LaTeX Live Editor', desc: 'Write parsing-proof Overleaf-compatible LaTeX code dynamically with live preview.' },
          { Icon: Award, cls: 'green-glow', col: 'text-primary', title: 'Career Action Guides', desc: 'Unlock curated keywords and roadmaps customised for your exact professional role.' },
        ].map(({ Icon, cls, col, title, desc }, i) => (
          <div key={i} className="feature-card-hero glass-panel glass-panel-hover">
            <div className={`feature-icon-box ${cls}`}>
              <Icon className={`feature-icon ${col}`} size={24} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* ── Container ─────────────────────────────────────────────────── */
        .hero-container {
          position: relative;
          padding: 80px 24px 60px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          overflow: hidden;
        }

        /* ── Blob Layer ────────────────────────────────────────────────── */
        .blob-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .morph-blob-1 {
          position: absolute;
          top: -8%;
          left: -10%;
          width: 55%;
          max-width: 560px;
          will-change: transform;
        }

        .morph-blob-2 {
          position: absolute;
          bottom: 0%;
          right: -8%;
          width: 50%;
          max-width: 520px;
          will-change: transform;
        }

        .morph-blob-3 {
          position: absolute;
          top: 35%;
          left: 35%;
          width: 40%;
          max-width: 420px;
          will-change: transform;
        }

        /* ── Network Canvas ────────────────────────────────────────────── */
        .network-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Hero Grid ─────────────────────────────────────────────────── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 80px;
          position: relative;
          z-index: 1;
        }

        .hero-content { text-align: left; }

        .badge-wrapper { margin-bottom: 20px; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .hero-title {
          font-size: 58px;
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
          color: #fff;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.65;
          color: var(--text-secondary);
          margin-bottom: 36px;
          max-width: 560px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-lg { padding: 14px 32px; font-size: 16px; }

        .text-emerald { color: var(--primary); }
        .text-accent  { color: var(--accent); }
        .text-blue    { color: #3b82f6; }

        /* ── Mock Score Card ───────────────────────────────────────────── */
        .hero-visual { display: flex; justify-content: center; z-index: 1; }

        .mock-score-card {
          width: 100%;
          max-width: 440px;
          background: rgba(10,17,32,0.82);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06);
          transform-style: preserve-3d;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .mock-card-header {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.01);
          border-radius: 20px 20px 0 0;
        }

        .mock-window-dots { display: flex; gap: 6px; }
        .mock-window-dots .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-red    { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green  { background: #10b981; }

        .mock-file-name {
          margin-left: 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .mock-card-body { padding: 24px; }

        .score-dial-section {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 24px;
        }

        .score-dial {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring { position: absolute; }

        .score-number-overlay { display: flex; flex-direction: column; align-items: center; }
        .score-num   { font-size: 42px; font-weight: 800; color: #fff; line-height: 1; }
        .score-label { font-size: 11px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

        .metrics-list-mini { display: flex; flex-direction: column; gap: 12px; }
        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          border-bottom: 1px dashed rgba(255,255,255,0.05);
          padding-bottom: 6px;
        }
        .metric-name { color: var(--text-secondary); }
        .metric-val  { font-weight: 700; }

        .mock-issues {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 18px;
        }

        .issue-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .issue-item.warning { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); color: #fbd38d; }
        .issue-item.success { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15); color: #a7f3d0; }
        .issue-bullet { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
        .warning .issue-bullet { background: var(--warning); }
        .success .issue-bullet { background: var(--primary); }

        /* ── Features Grid ─────────────────────────────────────────────── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .feature-card-hero {
          padding: 30px 24px;
          text-align: left;
          background: rgba(8,13,26,0.6);
        }

        .feature-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .em-glow     { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.2); box-shadow: 0 0 18px rgba(16,185,129,0.15); }
        .purple-glow { background: rgba(168,85,247,0.08); border-color: rgba(168,85,247,0.2); box-shadow: 0 0 18px rgba(168,85,247,0.15); }
        .blue-glow   { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); box-shadow: 0 0 18px rgba(59,130,246,0.15); }
        .green-glow  { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.2); box-shadow: 0 0 18px rgba(16,185,129,0.15); }

        .feature-card-hero h3 { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .feature-card-hero p  { font-size: 14px; line-height: 1.55; color: var(--text-secondary); }

        /* ── Responsive ────────────────────────────────────────────────── */
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-content { text-align: center; }
          .hero-subtitle { margin-left: auto; margin-right: auto; }
          .hero-actions { justify-content: center; }
          .hero-title { font-size: 42px; }
          .morph-blob-1 { width: 80%; left: -20%; }
          .morph-blob-2 { width: 70%; right: -15%; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 34px; }
          .hero-subtitle { font-size: 16px; }
        }
      `}} />
    </section>
  );
};

export default HeroSection;
