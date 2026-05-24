import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, 
  ArrowRight, Sparkles, RotateCcw, Info, Briefcase, ChevronRight, Check, Settings
} from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfParser';
import { analyzeResume, JOB_CATEGORIES } from '../utils/atsEngine';
import { analyzeResumeWithGemini } from '../utils/geminiEngine';

const BREAKDOWN_ITEMS = [
  { label: 'Keywords Fit (30%)', key: 'keywords', color: 'var(--primary)' },
  { label: 'Formatting & Length (20%)', key: 'formatting', color: 'var(--secondary)' },
  { label: 'Section Coverage (20%)', key: 'structure', color: 'var(--accent)' },
  { label: 'Impact & Action Verbs (20%)', key: 'impactVerbs', color: 'var(--warning)' },
  { label: 'Contact Presence (10%)', key: 'contact', color: '#06b6d4' }
];

function ResumeScanner({ setActiveTab }) {
  const [selectedCategory, setSelectedCategory] = useState('web_developer');
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [activeResultsTab, setActiveResultsTab] = useState('issues');
  
  // Gemini API states
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [analysisSource, setAnalysisSource] = useState('local'); // 'gemini' | 'local'
  const [apiStatusMessage, setApiStatusMessage] = useState('');

  // GSAP animation refs
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const circleProgressRef = useRef(null);
  const scoreValRef = useRef({ val: 0 });
  const barRefs = useRef([]);

  // Load animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(leftPanelRef.current, 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(rightPanelRef.current, 
        { opacity: 0, x: 30 }, 
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animate score details when a new result comes in
  useEffect(() => {
    if (!result) return;

    // Trigger confetti on high scores
    if (result.total >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#a855f7']
      });
    }

    const ctx = gsap.context(() => {
      // 1. Score number counting up
      scoreValRef.current = { val: 0 };
      gsap.to(scoreValRef.current, {
        val: result.total,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          setDisplayScore(Math.round(scoreValRef.current.val));
        }
      });

      // 2. SVG circle stroke offset animation
      // Circumference = 2 * PI * r = 2 * 3.14159 * 42 = 263.89
      const circ = 263.89;
      const targetOffset = circ - (circ * result.total) / 100;
      gsap.fromTo(circleProgressRef.current,
        { strokeDashoffset: circ },
        { strokeDashoffset: targetOffset, duration: 1.6, ease: 'power3.out' }
      );

      // 3. Category bars loading
      BREAKDOWN_ITEMS.forEach((item, idx) => {
        const bar = barRefs.current[idx];
        if (!bar) return;
        const val = result.breakdown[item.key];
        gsap.fromTo(bar,
          { width: '0%' },
          { width: `${val}%`, duration: 1.2, ease: 'power2.out', delay: 0.2 + idx * 0.1 }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [result]);

  // Handle PDF file drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (droppedFile.type !== 'application/pdf') {
      setError('Please drop a valid PDF file.');
      return;
    }

    setFile(droppedFile);
    setPasteText(''); // Clear paste input
  };

  // Handle file select
  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Selected file must be a PDF.');
        return;
      }
      setFile(selectedFile);
      setPasteText(''); // Clear paste input
    }
  };

  // Trigger main analysis
  const runAnalysis = async () => {
    setError('');
    setResult(null);
    setApiStatusMessage('');
    setAnalysisSource('local');

    let textToAnalyze = pasteText.trim();

    if (file) {
      setIsParsing(true);
      try {
        textToAnalyze = await extractTextFromPDF(file);
      } catch (err) {
        setError(err.message);
        setIsParsing(false);
        return;
      }
      setIsParsing(false);
    }

    if (!textToAnalyze) {
      setError('Please upload a PDF resume or paste your resume text first.');
      return;
    }

    const category = JOB_CATEGORIES[selectedCategory] || JOB_CATEGORIES.fresher_developer;

    if (apiKey.trim()) {
      setIsParsing(true);
      try {
        const geminiResult = await analyzeResumeWithGemini(textToAnalyze, category.label, apiKey.trim());
        setResult(geminiResult);
        setAnalysisSource('gemini');
        setApiStatusMessage('Scored using Google Gemini 1.5 Flash.');
      } catch (err) {
        console.error('Gemini API Error:', err);
        let statusMsg = '';
        if (err.message === 'API_RATE_LIMIT') {
          statusMsg = 'Gemini API free tier rate limit reached. Fell back to local scoring rules.';
        } else if (err.message === 'API_KEY_MISSING') {
          statusMsg = 'Gemini API key is missing. Fell back to local scoring rules.';
        } else {
          statusMsg = `Gemini API error (${err.message}). Fell back to local scoring rules.`;
        }
        
        // Fallback to local
        const localResult = analyzeResume(textToAnalyze, selectedCategory);
        setResult(localResult);
        setAnalysisSource('local');
        setApiStatusMessage(statusMsg);
      }
      setIsParsing(false);
    } else {
      // Direct local analysis
      const localResult = analyzeResume(textToAnalyze, selectedCategory);
      setResult(localResult);
      setAnalysisSource('local');
      setApiStatusMessage('Scored using local ATS rules engine. Add a Gemini API key for AI-powered evaluation.');
    }
    setActiveResultsTab('issues'); // Default tab
  };

  const resetScanner = () => {
    setFile(null);
    setPasteText('');
    setResult(null);
    setError('');
    setDisplayScore(0);
    setApiStatusMessage('');
    setAnalysisSource('local');
  };

  return (
    <div className="scanner-container" ref={containerRef}>
      {/* Page Header */}
      <div className="scanner-header">
        <span className="badge-glow"><Sparkles size={14} /> Phase 2 Active</span>
        <h1 className="gradient-text">ATS Grading & Parser</h1>
        <p>Upload a PDF resume or copy-paste text to receive immediate structural score analysis and targeted keywords optimization checks.</p>
        <button 
          className={`btn-secondary btn-settings-toggle ${apiKey ? 'configured' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={16} /> {apiKey ? 'Gemini AI Configured' : 'Configure Gemini AI (Free)'}
        </button>
      </div>

      {/* API Settings Collapsible Card */}
      {showSettings && (
        <div className="glass-panel api-settings-panel animate-fade">
          <div className="settings-header">
            <h3 className="settings-title"><Settings size={18} /> Gemini AI Configuration</h3>
            <button className="btn-close-settings" onClick={() => setShowSettings(false)}>×</button>
          </div>
          <p className="settings-desc">
            Enter your Google Gemini API key to run a highly accurate, AI-powered evaluation checking grammar, writing style, formatting mistakes, and custom keyword density. You can get a free key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
          </p>
          <div className="key-input-row">
            <input 
              type="password" 
              placeholder="Paste Google Gemini API Key here (starts with AIzaSy...)" 
              value={apiKey} 
              onChange={(e) => {
                setApiKey(e.target.value);
                localStorage.setItem('gemini_api_key', e.target.value);
              }} 
              className="api-key-input"
            />
            {apiKey && (
              <button className="btn-secondary btn-clear-key" onClick={() => {
                setApiKey('');
                localStorage.removeItem('gemini_api_key');
              }}>Clear Key</button>
            )}
          </div>
          <div className="limits-info">
            <div className="limit-bullet">
              <span className="limit-tag">Gemini Free Rate Limit:</span>
              <span>15 requests per minute, 1,500 requests per day. Completely free.</span>
            </div>
            <div className="limit-bullet">
              <span className="limit-tag">Fallback protection:</span>
              <span>If rate limit is reached, or key is blank/invalid, the app instantly falls back to the local rules engine with full details.</span>
            </div>
          </div>
        </div>
      )}

      <div className="scanner-grid">
        {/* Left Side: Upload / Paste Input Panel */}
        <div className="glass-panel scanner-left" ref={leftPanelRef}>
          <div className="panel-section">
            <label className="section-label"><Briefcase size={16} /> 1. Target Career Category</label>
            <p className="section-desc">Select the industry standard keyword lexicon to analyze your resume against.</p>
            <div className="select-wrapper">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {Object.entries(JOB_CATEGORIES).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="panel-section">
            <label className="section-label"><UploadCloud size={16} /> 2. Upload PDF Resume</label>
            
            <div 
              className={`dropzone ${isDragOver ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="file-upload" 
                accept=".pdf" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {!file ? (
                <label htmlFor="file-upload" className="dropzone-label">
                  <div className="upload-icon-box pulse-glow">
                    <UploadCloud size={28} className="upload-icon" />
                  </div>
                  <span className="upload-title">Drag & Drop Resume PDF</span>
                  <span className="upload-subtitle">or click to browse files</span>
                  <span className="file-hint">Accepts standard PDF (not scans)</span>
                </label>
              ) : (
                <div className="file-info-container">
                  <FileText size={36} className="pdf-doc-icon" />
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button className="btn-icon-clear" onClick={() => setFile(null)} title="Remove file">
                    <RotateCcw size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="panel-divider">
            <span>OR</span>
          </div>

          <div className="panel-section">
            <label className="section-label"><FileText size={16} /> 3. Paste Resume Text</label>
            <textarea 
              className="text-input" 
              placeholder="Paste your plain resume text here..." 
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (file) setFile(null); // Clear file if typing starts
              }}
              disabled={!!file}
            />
            {file && (
              <p className="textarea-disabled-note">Text area disabled. Clear the uploaded PDF above to paste instead.</p>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="action-row">
            <button 
              className="btn-primary flex-1 btn-scan" 
              onClick={runAnalysis}
              disabled={isParsing || (!file && !pasteText.trim())}
            >
              {isParsing ? (
                <>
                  <div className="spinner"></div>
                  Parsing PDF...
                </>
              ) : (
                <>
                  Analyze Resume <ArrowRight size={18} />
                </>
              )}
            </button>

            {(file || pasteText.trim() || result) && (
              <button className="btn-secondary btn-reset" onClick={resetScanner} title="Reset All">
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Score Gauge & Breakdown Dashboard */}
        <div className="glass-panel scanner-right" ref={rightPanelRef}>
          {!result ? (
            /* Analysis Placeholder Dashboard */
            <div className="placeholder-dashboard">
              <div className="futuristic-scanner">
                <div className="scanner-line"></div>
                <div className="schema-paper">
                  <div className="schema-line header"></div>
                  <div className="schema-line body"></div>
                  <div className="schema-line body short"></div>
                  <div className="schema-line body"></div>
                  <div className="schema-line body short"></div>
                </div>
              </div>
              <h3>Ready for Grading</h3>
              <p>Configure your target role profile and submit your resume. Our parsing engine will compile immediate insights here.</p>
            </div>
          ) : (
            /* Fully Populated ATS Grading Dashboard */
            <div className="results-container">
              {/* API Mode Indicator Banner */}
              {apiStatusMessage && (
                <div className={`analysis-source-indicator ${analysisSource === 'gemini' ? 'ai-mode' : 'local-mode'}`}>
                  {analysisSource === 'gemini' ? (
                    <Sparkles size={16} className="indicator-icon sparkle-ai" />
                  ) : (
                    <Info size={16} className="indicator-icon" />
                  )}
                  <span>{apiStatusMessage}</span>
                </div>
              )}
              
              {/* Circular Score Gauge & Global Stats */}
              <div className="results-top-row">
                <div className="score-gauge-box">
                  <svg className="score-svg" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      className="gauge-bg"
                    />
                    {/* Progress Indicator */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      ref={circleProgressRef}
                      className={`gauge-progress ${displayScore >= 80 ? 'green' : displayScore >= 50 ? 'amber' : 'red'}`}
                      strokeDasharray="263.89"
                      strokeDashoffset="263.89"
                    />
                  </svg>
                  <div className="score-text">
                    <span className="score-num">{displayScore}</span>
                    <span className="score-max">/100</span>
                  </div>
                </div>

                <div className="report-brief">
                  <span className="brief-title">ATS Verdict</span>
                  <h2 className="brief-grade">
                    {result.total >= 80 ? 'Highly Optimised' : result.total >= 60 ? 'Moderate Fit' : 'Needs Improvement'}
                  </h2>
                  <p className="brief-desc">
                    {result.total >= 80 
                      ? 'Your resume shows strong section labeling, robust industry keywords coverage, and quantifiable impact ratios.'
                      : result.total >= 60 
                        ? 'Good groundwork is present, but lacking key target skills terminology and action verbs to stand out.'
                        : 'Your resume runs a high risk of being discarded by ATS parsers. Apply the key adjustments listed below.'
                    }
                  </p>
                  <div className="stats-row">
                    <div className="stat-pill">
                      <span className="stat-label">Words</span>
                      <span className="stat-val">{result.wordCount}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-label">Metrics</span>
                      <span className="stat-val">{result.hasMetrics ? 'Present' : 'None'}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-label">Keywords</span>
                      <span className="stat-val">{result.matchedKeywords.length}/{JOB_CATEGORIES[selectedCategory].keywords.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="breakdown-grid">
                {BREAKDOWN_ITEMS.map((item, index) => (
                  <div key={item.key} className="breakdown-item">
                    <div className="breakdown-labels">
                      <span className="b-label">{item.label}</span>
                      <span className="b-val">{result.breakdown[item.key]}%</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        ref={el => barRefs.current[index] = el}
                        className="progress-bar"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Tab Menu */}
              <div className="results-tab-bar">
                <button 
                  className={`tab-btn ${activeResultsTab === 'issues' ? 'active' : ''}`}
                  onClick={() => setActiveResultsTab('issues')}
                >
                  Issues & Fixes ({result.issues.length})
                </button>
                <button 
                  className={`tab-btn ${activeResultsTab === 'keywords' ? 'active' : ''}`}
                  onClick={() => setActiveResultsTab('keywords')}
                >
                  Keyword Check ({result.matchedKeywords.length})
                </button>
                <button 
                  className={`tab-btn ${activeResultsTab === 'fixes' ? 'active' : ''}`}
                  onClick={() => setActiveResultsTab('fixes')}
                >
                  Recommendations
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="tab-contents">
                {activeResultsTab === 'issues' && (
                  <div className="issues-list animate-fade">
                    {result.issues.map((issue, idx) => (
                      <div key={idx} className={`issue-card ${issue.type}`}>
                        {issue.type === 'error' && <XCircle className="issue-icon icon-error" size={18} />}
                        {issue.type === 'warning' && <AlertTriangle className="issue-icon icon-warning" size={18} />}
                        {issue.type === 'success' && <CheckCircle2 className="issue-icon icon-success" size={18} />}
                        <span className="issue-message">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeResultsTab === 'keywords' && (
                  <div className="keywords-panel animate-fade">
                    <div className="keywords-summary">
                      <p>Resume matches standard keywords needed for <strong>{JOB_CATEGORIES[selectedCategory].label}</strong>.</p>
                    </div>

                    <div className="kw-section">
                      <h4 className="kw-header matched"><Check size={14} /> Matched ({result.matchedKeywords.length})</h4>
                      <div className="chip-container">
                        {result.matchedKeywords.length === 0 ? (
                          <span className="no-chip-text">No keywords matched yet. Add details under your skills/experience.</span>
                        ) : (
                          result.matchedKeywords.map(kw => (
                            <span key={kw} className="kw-chip match">{kw}</span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="kw-section mt-16">
                      <h4 className="kw-header missing"><Info size={14} /> Missing ({result.missingKeywords.length})</h4>
                      <div className="chip-container">
                        {result.missingKeywords.length === 0 ? (
                          <span className="no-chip-text">Excellent! You covered all key metrics keywords.</span>
                        ) : (
                          result.missingKeywords.map(kw => (
                            <span key={kw} className="kw-chip miss">{kw}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeResultsTab === 'fixes' && (
                  <div className="suggestions-list animate-fade">
                    {result.suggestions.length === 0 ? (
                      <div className="empty-suggestions">
                        <CheckCircle2 size={36} style={{ color: 'var(--primary)' }} />
                        <p>No immediate suggestions! Your resume follows optimal structure guidelines.</p>
                      </div>
                    ) : (
                      result.suggestions.map((sug, idx) => (
                        <div key={idx} className="suggestion-card">
                          <ChevronRight size={18} className="sug-bullet" />
                          <p className="sug-text">{sug}</p>
                        </div>
                      ))
                    )}
                    
                    <div className="fixes-callout glass-panel">
                      <Sparkles size={20} className="callout-icon" />
                      <div className="callout-text">
                        <h5>Need a cleaner, ATS-optimized layout?</h5>
                        <p>Use our interactive Overleaf-compatible LaTeX builder to quickly copy templates optimized for scanners.</p>
                        <button className="btn-secondary btn-sm mt-8" onClick={() => setActiveTab('latex')}>
                          Go to LaTeX Builder <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scanner-container {
          padding: 60px 40px;
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
          flex: 1;
        }

        .scanner-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          max-width: 700px;
          margin: 0 auto;
        }

        .badge-glow {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid var(--border-glow);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .scanner-header h1 {
          font-size: 46px;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0;
        }

        .scanner-header p {
          color: var(--text-secondary);
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }

        .scanner-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.3fr;
          gap: 32px;
          align-items: stretch;
        }

        .scanner-left, .scanner-right {
          background: rgba(10, 15, 30, 0.65);
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .scanner-right {
          min-height: 580px;
          justify-content: center;
        }

        .panel-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .section-desc {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 4px;
        }

        .select-wrapper {
          position: relative;
        }

        .category-select {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }

        .category-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
        }

        .select-wrapper::after {
          content: '▼';
          font-size: 10px;
          color: var(--text-secondary);
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        /* Drag and Drop Zone */
        .dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 30px;
          text-align: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          transition: all 0.3s ease;
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone:hover, .dropzone.drag-active {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.03);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.08) inset;
        }

        .dropzone.has-file {
          border-color: var(--secondary);
          border-style: solid;
          background: rgba(99, 102, 241, 0.03);
        }

        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          gap: 8px;
          width: 100%;
        }

        .upload-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .upload-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .upload-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .file-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        /* File Info Bar */
        .file-info-container {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 8px;
        }

        .pdf-doc-icon {
          color: var(--secondary);
        }

        .file-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          text-align: left;
        }

        .file-size {
          font-size: 12px;
          color: var(--text-muted);
        }

        .btn-icon-clear {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon-clear:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .panel-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          margin: -4px 0;
        }

        .panel-divider::before, .panel-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        /* Text Area paste */
        .text-input {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.5;
          min-height: 150px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .text-input:focus {
          border-color: var(--primary);
        }

        .text-input:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.005);
        }

        .textarea-disabled-note {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: -2px;
        }

        .action-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .flex-1 {
          flex: 1;
        }

        .btn-scan {
          justify-content: center;
        }

        .btn-scan:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .btn-reset {
          padding: 12px 16px;
          justify-content: center;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid var(--danger-glow);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          line-height: 1.4;
        }

        /* Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Placeholder Right Dashboard */
        .placeholder-dashboard {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          padding: 40px;
        }

        .futuristic-scanner {
          width: 140px;
          height: 160px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary);
          box-shadow: 0 0 15px 2px var(--primary);
          z-index: 10;
          animation: scan 4s infinite ease-in-out;
        }

        .schema-paper {
          width: 80px;
          height: 100px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .schema-line {
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .schema-line.header {
          width: 70%;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          margin-bottom: 6px;
        }

        .schema-line.body {
          width: 100%;
        }

        .schema-line.body.short {
          width: 60%;
        }

        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }

        .placeholder-dashboard h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .placeholder-dashboard p {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.6;
          max-width: 320px;
          margin: 0;
        }

        /* Results dashboard */
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .results-top-row {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .score-gauge-box {
          width: 130px;
          height: 130px;
          position: relative;
          flex-shrink: 0;
        }

        .score-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .gauge-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.04);
          stroke-width: 7.5;
        }

        .gauge-progress {
          fill: none;
          stroke-width: 7.5;
          stroke-linecap: round;
          transition: stroke 0.3s;
        }

        .gauge-progress.green {
          stroke: var(--primary);
          filter: drop-shadow(0 0 6px var(--primary-glow));
        }

        .gauge-progress.amber {
          stroke: var(--warning);
          filter: drop-shadow(0 0 6px var(--warning-glow));
        }

        .gauge-progress.red {
          stroke: #ef4444;
          filter: drop-shadow(0 0 6px var(--danger-glow));
        }

        .score-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          line-height: 1.1;
        }

        .score-num {
          font-size: 42px;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-sans);
          letter-spacing: -1px;
          line-height: 1;
        }

        .score-max {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-top: 2px;
          line-height: 1;
        }

        .report-brief {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .brief-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .brief-grade {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .brief-desc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0 0 6px 0;
        }

        .stats-row {
          display: flex;
          gap: 12px;
        }

        .stat-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .stat-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-val {
          color: var(--text-primary);
          font-weight: 600;
        }

        /* Breakdown Progress Grid */
        .breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 24px;
          background: rgba(255, 255, 255, 0.015);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .breakdown-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
        }

        .b-label {
          color: var(--text-secondary);
        }

        .b-val {
          color: var(--text-primary);
        }

        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          width: 0%;
          border-radius: 10px;
        }

        /* Tab switcher */
        .results-tab-bar {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 2px;
        }

        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--primary);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 10px;
          right: 10px;
          height: 2px;
          background-color: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 8px var(--primary-glow);
        }

        .tab-contents {
          min-height: 160px;
        }

        /* Issues list */
        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-card {
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13.5px;
          line-height: 1.4;
          font-weight: 500;
        }

        .issue-card.error {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.12);
          color: #fca5a5;
        }

        .issue-card.warning {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.12);
          color: #fde047;
        }

        .issue-card.success {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.12);
          color: #a7f3d0;
        }

        .issue-icon {
          flex-shrink: 0;
        }

        .icon-error { color: #ef4444; }
        .icon-warning { color: #f59e0b; }
        .icon-success { color: var(--primary); }

        /* Keywords Panel */
        .keywords-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .keywords-summary {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .kw-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .kw-header {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .kw-header.matched { color: var(--primary); }
        .kw-header.missing { color: var(--text-muted); }

        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .kw-chip {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .kw-chip.match {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #a7f3d0;
        }

        .kw-chip.miss {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--border-color);
          color: var(--text-secondary);
        }

        .no-chip-text {
          font-size: 12px;
          color: var(--text-muted);
          font-style: italic;
        }

        .mt-16 { margin-top: 16px; }

        /* Suggestions fixes tab */
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .suggestion-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .sug-bullet {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .sug-text {
          font-size: 13.5px;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .fixes-callout {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
          border-color: rgba(99, 102, 241, 0.2);
          padding: 20px;
          display: flex;
          gap: 16px;
          margin-top: 8px;
          align-items: flex-start;
        }

        .callout-icon {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .callout-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .callout-text h5 {
          font-size: 14.5px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .callout-text p {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .btn-sm {
          padding: 6px 14px;
          font-size: 12px;
          border-radius: 8px;
        }

        .mt-8 { margin-top: 8px; }

        .btn-settings-toggle {
          margin-top: 14px;
          padding: 8px 18px;
          font-size: 13.5px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-color: rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: all 0.25s ease;
        }

        .btn-settings-toggle:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--secondary-glow);
          box-shadow: 0 0 12px rgba(99,102,241,0.2);
        }

        .btn-settings-toggle.configured {
          border-color: var(--primary-glow);
          color: var(--primary);
          background: rgba(16,185,129,0.05);
        }

        .btn-settings-toggle.configured:hover {
          background: rgba(16,185,129,0.1);
          box-shadow: 0 0 12px var(--primary-glow);
        }

        /* Collapsible Settings Panel */
        .api-settings-panel {
          padding: 24px;
          background: rgba(12, 17, 34, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.08);
          max-width: 1300px;
          width: 100%;
          margin: -10px auto 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .settings-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .btn-close-settings {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
          line-height: 1;
        }

        .btn-close-settings:hover {
          color: var(--danger);
        }

        .settings-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .settings-desc a {
          color: var(--secondary);
          text-decoration: none;
          font-weight: 600;
          transition: text-decoration 0.2s;
        }

        .settings-desc a:hover {
          text-decoration: underline;
        }

        .key-input-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .api-key-input {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-family: var(--font-mono);
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }

        .api-key-input:focus {
          border-color: var(--secondary);
        }

        .btn-clear-key {
          padding: 10px 18px;
          font-size: 13px;
          border-radius: 10px;
        }

        .btn-clear-key:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.25);
        }

        .limits-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 12px;
        }

        .limit-bullet {
          display: flex;
          gap: 6px;
        }

        .limit-tag {
          font-weight: 700;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        /* API Mode Indicator Banner */
        .analysis-source-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 550;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .analysis-source-indicator.ai-mode {
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: #d8b4fe;
        }

        .analysis-source-indicator.local-mode {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.15);
          color: #fde047;
        }

        .indicator-icon {
          flex-shrink: 0;
        }

        .sparkle-ai {
          color: #c084fc;
          animation: rotateGlow 3s infinite linear;
        }

        @keyframes rotateGlow {
          0% { transform: scale(1); filter: drop-shadow(0 0 1px #a855f7); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 4px #a855f7); }
          100% { transform: scale(1); filter: drop-shadow(0 0 1px #a855f7); }
        }

        /* Animation utilities */
        .animate-fade {
          animation: fadeEnter 0.4s forwards ease-out;
        }

        @keyframes fadeEnter {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .scanner-container {
            padding: 40px 20px;
          }
          .scanner-grid {
            grid-template-columns: 1fr;
          }
          .scanner-header h1 {
            font-size: 38px;
          }
        }
      `}} />
    </div>
  );
}

export default ResumeScanner;
