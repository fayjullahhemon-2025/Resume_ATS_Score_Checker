import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ResumeScanner from './components/ResumeScanner';
import LaTeXBuilder from './components/LaTeXBuilder';
import Preloader from './components/Preloader';
import PageTransition from './components/PageTransition';
import './index.css';

// Page tab metadata
const PAGES = {
  home: () => import('./components/HeroSection'),
  scan: () => import('./components/ResumeScanner'),
  latex: () => import('./components/LaTeXBuilder'),
  career: null,
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [displayedTab, setDisplayedTab] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Persisted state across tab switches
  const [scanResult, setScanResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('web_developer');

  const mainRef = useRef(null);
  const progressBarRef = useRef(null);

  // Smooth tab change with exit animation
  const handleTabChange = useCallback((newTab) => {
    if (newTab === activeTab || isTransitioning) return;
    setIsTransitioning(true);

    // Top progress bar flash
    gsap.fromTo(
      progressBarRef.current,
      { width: '0%', opacity: 1 },
      {
        width: '100%',
        opacity: 1,
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(progressBarRef.current, {
            opacity: 0,
            duration: 0.25,
            delay: 0.05,
            onComplete: () => {
              gsap.set(progressBarRef.current, { width: '0%' });
            }
          });
        }
      }
    );

    // Exit animation on current page
    if (mainRef.current) {
      gsap.to(mainRef.current, {
        opacity: 0,
        y: -16,
        filter: 'blur(4px)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setActiveTab(newTab);
          setDisplayedTab(newTab);
          // Reset position for enter animation
          gsap.set(mainRef.current, { y: 20, filter: 'blur(6px)' });
          gsap.to(mainRef.current, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.45,
            ease: 'power3.out',
            onComplete: () => setIsTransitioning(false),
          });
        }
      });
    } else {
      setActiveTab(newTab);
      setDisplayedTab(newTab);
      setIsTransitioning(false);
    }
  }, [activeTab, isTransitioning]);

  return (
    <>
      {/* Top progress bar */}
      <div
        ref={progressBarRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2px',
          width: '0%',
          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
          boxShadow: '0 0 10px rgba(16,185,129,0.8)',
          zIndex: 99999,
          opacity: 0,
          borderRadius: '0 2px 2px 0',
          pointerEvents: 'none',
        }}
      />

      {/* Preloader */}
      {!isLoaded && <Preloader onComplete={() => setIsLoaded(true)} />}

      {/* App Shell */}
      <div className="app-root" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

        <main className="app-main" ref={mainRef}>
          {activeTab === 'home' && (
            <HeroSection setActiveTab={handleTabChange} />
          )}

          {activeTab === 'scan' && (
            <ResumeScanner 
              setActiveTab={handleTabChange} 
              scanResult={scanResult}
              setScanResult={setScanResult}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          )}

          {activeTab === 'latex' && (
            <LaTeXBuilder 
              scanResult={scanResult} 
              selectedCategory={selectedCategory} 
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === 'career' && (
            <div className="coming-soon-page">
              <div className="glass-panel coming-soon-card">
                <div className="cs-icon-box">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <rect x="4" y="4" width="48" height="48" rx="14" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.25)" strokeWidth="1.5"/>
                    <path d="M28 16l3 8h8l-6.5 5 2.5 8L28 33l-7 4 2.5-8L17 24h8z" stroke="#f59e0b" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 style={{background:'linear-gradient(135deg,#fff 40%,#f59e0b 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Career Guides</h2>
                <p>Role-specific ATS roadmaps, must-have keywords, and resume bullet templates are arriving in <strong>Phase 5</strong>.</p>
                <button className="btn-secondary" onClick={() => handleTabChange('home')}>← Back to Home</button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-darker);
        }

        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          will-change: opacity, transform, filter;
        }

        .coming-soon-page {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          padding: 40px 24px;
        }

        .coming-soon-card {
          text-align: center;
          padding: 60px 60px;
          max-width: 560px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          background: rgba(10, 15, 28, 0.7);
        }

        .cs-icon-box {
          margin-bottom: 8px;
        }

        .coming-soon-card h2 {
          font-size: 34px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .coming-soon-card p {
          color: var(--text-secondary);
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
          max-width: 400px;
        }

        .coming-soon-card strong {
          color: var(--text-primary);
        }
      `}} />
    </>
  );
}

export default App;
