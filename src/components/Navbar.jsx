import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Cpu, FileText, Compass, Sparkles, Menu, X } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Cpu },
    { id: 'scan', label: 'ATS Checker', icon: Sparkles },
    { id: 'latex', label: 'LaTeX Builder', icon: FileText },
    { id: 'career', label: 'Career Guides', icon: Compass },
  ];

  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  return (
    <header className="sticky-nav-wrapper" ref={navRef}>
      <nav className="glass-panel navbar-container">
        <div className="nav-logo" onClick={() => setActiveTab('home')}>
          <div className="logo-icon-wrapper">
            <Cpu className="logo-icon pulse-glow" size={22} />
          </div>
          <span className="logo-text">
            ATS<span className="text-emerald">Pulse</span>
          </span>
          <span className="glow-dot"></span>
        </div>

        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-link-icon" size={16} />
                  <span>{item.label}</span>
                  {isActive && <span className="active-dot"></span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="nav-actions">
          <button onClick={() => setActiveTab('scan')} className="btn-primary nav-cta">
            <Sparkles size={16} />
            <span>Scan Now</span>
          </button>
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-nav-dropdown glass-panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .sticky-nav-wrapper {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          padding: 16px 24px 0 24px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .navbar-container {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          border-radius: 20px;
          background: rgba(10, 15, 26, 0.75);
          pointer-events: auto;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .logo-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon {
          color: var(--primary);
        }

        .logo-text {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .text-emerald {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
        }

        .nav-link-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 8px 16px;
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
          position: relative;
        }
        .nav-link-btn:active {
          transform: scale(0.96);
        }

        .nav-link-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link-btn.active {
          color: var(--primary);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .nav-link-icon {
          opacity: 0.8;
        }

        .active-dot {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 6px var(--primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-cta {
          padding: 8px 18px;
          font-size: 14px;
          border-radius: 10px;
        }

        .nav-mobile-toggle {
          display: none;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 7px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          align-items: center;
          justify-content: center;
        }

        .nav-mobile-toggle:hover {
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.15);
        }

        .mobile-nav-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 16px;
          right: 16px;
          border-radius: 16px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: rgba(10, 15, 26, 0.95);
          z-index: 200;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
        }

        .mobile-nav-item.active {
          color: var(--primary);
          background: rgba(16,185,129,0.08);
        }

        .mobile-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-cta { display: none; }
          .nav-mobile-toggle { display: flex; }
          .sticky-nav-wrapper { position: relative; }
        }
      `}} />
    </header>
  );
};

export default Navbar;
