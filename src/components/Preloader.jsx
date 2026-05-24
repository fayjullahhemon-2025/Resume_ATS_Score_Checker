import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Preloader = ({ onComplete }) => {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressFillRef = useRef(null);
  const percentRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (overlayRef.current) overlayRef.current.style.display = 'none';
            onComplete();
          }
        });
      }
    });

    // Phase 1: Logo entrance
    tl.set(overlayRef.current, { opacity: 1 })
      .fromTo(logoRef.current,
        { scale: 0, opacity: 0, rotationY: -180 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1, ease: 'back.out(1.5)' }
      )
      .fromTo(textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(progressBarRef.current,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out', transformOrigin: 'left' },
        '-=0.2'
      )
      // Progress fill animation
      .to(progressFillRef.current, {
        width: '100%',
        duration: 1.8,
        ease: 'power1.inOut',
      })
      // Count up percentage
      .to({ val: 0 }, {
        val: 100,
        duration: 1.8,
        ease: 'power1.inOut',
        onUpdate: function () {
          if (percentRef.current) {
            percentRef.current.textContent = Math.round(this.targets()[0].val) + '%';
          }
        }
      }, '<');

    // Pulsing glow ring on logo
    gsap.to('.preloader-ring', {
      scale: 1.3,
      opacity: 0,
      duration: 1.2,
      repeat: -1,
      ease: 'power2.out',
    });

    return () => tl.kill();
  }, []);

  return (
    <div className="preloader-overlay" ref={overlayRef}>
      {/* Background grid */}
      <div className="preloader-grid-bg"></div>

      {/* Ambient orbs */}
      <div className="preloader-orb preloader-orb-1"></div>
      <div className="preloader-orb preloader-orb-2"></div>

      <div className="preloader-content">
        {/* Logo mark */}
        <div className="preloader-logo-wrap" ref={logoRef}>
          <div className="preloader-ring"></div>
          <div className="preloader-logo-box">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5"/>
              {/* CPU chip icon */}
              <rect x="16" y="16" width="16" height="16" rx="3" stroke="#10b981" strokeWidth="2" fill="rgba(16,185,129,0.1)"/>
              <line x1="20" y1="16" x2="20" y2="12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="24" y1="16" x2="24" y2="12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="28" y1="16" x2="28" y2="12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="20" y1="32" x2="20" y2="36" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="24" y1="32" x2="24" y2="36" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="28" y1="32" x2="28" y2="36" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="20" x2="12" y2="20" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="24" x2="12" y2="24" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="28" x2="12" y2="28" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="32" y1="20" x2="36" y2="20" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="32" y1="24" x2="36" y2="24" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="32" y1="28" x2="36" y2="28" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Center dot */}
              <circle cx="24" cy="24" r="3" fill="#10b981"/>
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div className="preloader-brand" ref={textRef}>
          <h1 className="preloader-title">
            ATS<span className="preloader-title-accent">Pulse</span>
          </h1>
          <p className="preloader-subtitle">Initializing AI analysis engine...</p>
        </div>

        {/* Progress bar */}
        <div className="preloader-progress-wrap" ref={progressBarRef}>
          <div className="preloader-progress-track">
            <div className="preloader-progress-fill" ref={progressFillRef}></div>
            <div className="preloader-progress-glow"></div>
          </div>
          <span className="preloader-percent" ref={percentRef}>0%</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .preloader-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #030712;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
        }

        .preloader-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        .preloader-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .preloader-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(16, 185, 129, 0.12);
          top: -100px;
          left: -100px;
        }

        .preloader-orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(99, 102, 241, 0.1);
          bottom: -80px;
          right: -80px;
        }

        .preloader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          z-index: 1;
        }

        /* Logo ring + box */
        .preloader-logo-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preloader-ring {
          position: absolute;
          width: 110px;
          height: 110px;
          border: 1.5px solid rgba(16, 185, 129, 0.6);
          border-radius: 28px;
          transform: scale(1);
          opacity: 0.7;
        }

        .preloader-logo-box {
          width: 84px;
          height: 84px;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* Brand text */
        .preloader-brand {
          text-align: center;
        }

        .preloader-title {
          font-family: 'Outfit', sans-serif;
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: #ffffff;
          margin: 0 0 8px 0;
          line-height: 1;
        }

        .preloader-title-accent {
          color: #10b981;
        }

        .preloader-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: rgba(156, 163, 175, 0.8);
          letter-spacing: 0.5px;
          margin: 0;
        }

        /* Progress */
        .preloader-progress-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 280px;
          transform-origin: left;
        }

        .preloader-progress-track {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          overflow: visible;
          position: relative;
        }

        .preloader-progress-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          border-radius: 10px;
          position: relative;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
        }

        .preloader-progress-fill::after {
          content: '';
          position: absolute;
          right: -1px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        .preloader-percent {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          color: rgba(16, 185, 129, 0.9);
          letter-spacing: 1px;
        }
      `}} />
    </div>
  );
};

export default Preloader;
