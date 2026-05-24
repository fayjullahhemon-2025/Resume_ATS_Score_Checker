import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, ArrowRight, FileCheck, Code, Award, Zap } from 'lucide-react';

const HeroSection = ({ setActiveTab }) => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const cardRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // GSAP Hero entrance animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Reset initial values to prevent flash of content
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], { opacity: 0, y: 50 });
      gsap.set(cardRef.current, { opacity: 0, scale: 0.8, rotateY: 30, rotateX: 10 });
      gsap.set('.feature-card-hero', { opacity: 0, y: 30 });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.2
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
      }, '-=0.9')
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }, '-=0.8')
      .to(cardRef.current, {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.75)'
      }, '-=0.8')
      .to('.feature-card-hero', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }, '-=1');

      // Floating items animation
      gsap.to('.floating-orb', {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      });

      // Simple interactive card tilt on hover
      const card = cardRef.current;
      if (card) {
        const handleMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(card, {
            rotateY: x * 0.08,
            rotateX: -y * 0.08,
            transformPerspective: 1000,
            duration: 0.5,
            ease: 'power2.out'
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          card.removeEventListener('mousemove', handleMouseMove);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-container" ref={containerRef}>
      {/* Decorative Orbs */}
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>

      <div className="hero-grid">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="glass-panel hero-badge">
              <Zap size={14} className="text-emerald" />
              <span>Next-Gen ATS Optimization</span>
            </span>
          </div>

          <h1 className="hero-title" ref={titleRef}>
            Land Your Dream Interview With <span className="gradient-text">ATSPulse</span>
          </h1>

          <p className="hero-subtitle" ref={subtitleRef}>
            An AI-powered diagnostic scanner engineered to dissect your resume, expose critical ATS filtering risks, fix formatting bugs, and live-generate industry-standard LaTeX code.
          </p>

          <div className="hero-actions" ref={buttonsRef}>
            <button onClick={() => setActiveTab('scan')} className="btn-primary btn-lg pulse-glow">
              <span>Scan Resume Free</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => setActiveTab('latex')} className="btn-secondary btn-lg">
              <Code size={18} />
              <span>LaTeX Resume Builder</span>
            </button>
          </div>
        </div>

        {/* Visual Showcase - Interactive Scoring Mock Card */}
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
                    <circle className="progress-ring-bg" stroke="rgba(255,255,255,0.04)" strokeWidth="12" fill="transparent" r="68" cx="80" cy="80" />
                    <circle className="progress-ring-fill" stroke="url(#emerald-grad)" strokeWidth="12" fill="transparent" r="68" cx="80" cy="80" strokeDasharray="427" strokeDashoffset="90" />
                    <defs>
                      <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-number-overlay">
                    <span className="score-num">82</span>
                    <span className="score-label">ATS Score</span>
                  </div>
                </div>

                <div className="metrics-list-mini">
                  <div className="metric-row">
                    <span className="metric-name">Keyword Match</span>
                    <span className="metric-val text-emerald">85%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Impact Verbs</span>
                    <span className="metric-val text-accent">72%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Structure Integrity</span>
                    <span className="metric-val text-primary">95%</span>
                  </div>
                </div>
              </div>

              {/* Mock issues */}
              <div className="mock-issues">
                <div className="issue-item warning">
                  <span className="issue-bullet"></span>
                  <span className="issue-text">Weak action verb detected: <strong>"responsible for leading"</strong></span>
                </div>
                <div className="issue-item success">
                  <span className="issue-bullet"></span>
                  <span className="issue-text">Quantifiable achievements found in <strong>"Experience"</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid display */}
      <div className="features-grid" ref={featuresRef}>
        <div className="feature-card-hero glass-panel glass-panel-hover">
          <div className="feature-icon-box em-glow">
            <FileCheck className="feature-icon text-emerald" size={24} />
          </div>
          <h3>AI Diagnostic Scoring</h3>
          <p>Scan structures, fonts, files, sections, and densities instantly inside the browser.</p>
        </div>

        <div className="feature-card-hero glass-panel glass-panel-hover">
          <div className="feature-icon-box purple-glow">
            <Sparkles className="feature-icon text-accent" size={24} />
          </div>
          <h3>Grammar & Weak Verbs</h3>
          <p>Expose weak verbs like "helped" and swap them for heavy-impact action words automatically.</p>
        </div>

        <div className="feature-card-hero glass-panel glass-panel-hover">
          <div className="feature-icon-box blue-glow">
            <Code className="feature-icon text-blue" size={24} />
          </div>
          <h3>LaTeX Live Editor</h3>
          <p>Write raw, parsing-proof Overleaf-compatible LaTeX code dynamically with automated fields.</p>
        </div>

        <div className="feature-card-hero glass-panel glass-panel-hover">
          <div className="feature-icon-box green-glow">
            <Award className="feature-icon text-primary" size={24} />
          </div>
          <h3>Career Action Guides</h3>
          <p>Unlock curated roadmaps and keywords customized for your exact chosen professional career.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hero-container {
          position: relative;
          padding: 80px 24px 60px 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* Decorative Orbs */
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.3;
        }

        .orb-1 {
          top: 15%;
          left: 5%;
          width: 250px;
          height: 250px;
          background: rgba(16, 185, 129, 0.4);
        }

        .orb-2 {
          bottom: 25%;
          right: 5%;
          width: 300px;
          height: 300px;
          background: rgba(99, 102, 241, 0.35);
        }

        .orb-3 {
          top: 50%;
          left: 45%;
          width: 180px;
          height: 180px;
          background: rgba(168, 85, 247, 0.3);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 80px;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          text-align: left;
        }

        .badge-wrapper {
          margin-bottom: 20px;
        }

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
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .hero-title {
          font-size: 58px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
          color: #ffffff;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 36px;
          max-width: 580px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 14px 32px;
          font-size: 16px;
        }

        /* Mock Score Card */
        .hero-visual {
          display: flex;
          justify-content: center;
          z-index: 1;
        }

        .mock-score-card {
          width: 100%;
          max-width: 440px;
          background: rgba(13, 20, 35, 0.75);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transform-style: preserve-3d;
        }

        .mock-card-header {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.01);
        }

        .mock-window-dots {
          display: flex;
          gap: 6px;
        }

        .mock-window-dots .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }

        .mock-file-name {
          margin-left: 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }

        .mock-card-body {
          padding: 24px;
        }

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

        .progress-ring {
          position: absolute;
          transform: rotate(-90deg);
        }

        .progress-ring-fill {
          transition: stroke-dashoffset 0.35s;
          transform-origin: 50% 50%;
        }

        .score-number-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-num {
          font-size: 42px;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .score-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        .metrics-list-mini {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
          padding-bottom: 6px;
        }

        .metric-name {
          color: var(--text-secondary);
        }

        .metric-val {
          font-weight: 700;
        }

        .text-accent { color: var(--accent); }
        .text-blue { color: #3b82f6; }

        .mock-issues {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
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

        .issue-item.warning {
          background: rgba(245, 158, 11, 0.06);
          border: 1px solid rgba(245, 158, 11, 0.15);
          color: #fbd38d;
        }

        .issue-item.success {
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: #a7f3d0;
        }

        .issue-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 6px;
        }

        .warning .issue-bullet { background: var(--warning); }
        .success .issue-bullet { background: var(--primary); }

        /* Features Grid */
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
          background: rgba(10, 15, 28, 0.55);
        }

        .feature-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .em-glow {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
        }

        .purple-glow {
          background: rgba(168, 85, 247, 0.08);
          border-color: rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.15);
        }

        .blue-glow {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
        }

        .green-glow {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
        }

        .feature-card-hero h3 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 10px;
        }

        .feature-card-hero p {
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-content {
            text-align: center;
          }

          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-title {
            font-size: 44px;
          }
        }
      `}} />
    </section>
  );
};

export default HeroSection;
