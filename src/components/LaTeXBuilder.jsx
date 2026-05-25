import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Sparkles, Code, FileText, Download, Copy, ExternalLink, 
  Plus, Trash2, ChevronDown, ChevronUp, Check, RotateCcw,
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Wrench, XCircle
} from 'lucide-react';

const Linkedin = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
import { buildLatexCode } from '../utils/latexTemplates';

const TEMPLATES = [
  { id: 'minimal', name: 'Minimalist Standard', desc: 'Clean, elegant single-column design. Highly readable by all modern ATS systems.' },
  { id: 'twocolumn', name: 'Two-Column Compact', desc: 'Maximizes space usage for dense skill sets while remaining parser-safe.' },
  { id: 'academic', name: 'Academic & Classic', desc: 'Sophisticated charter serif layout ideal for scientific, research, and graduate roles.' }
];

function LaTeXBuilder({ scanResult, selectedCategory, setActiveTab }) {
  const [template, setTemplate] = useState('minimal');
  
  // Accordion active state
  const [openSection, setOpenSection] = useState('personal');

  // Form Data State
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [
      { role: '', company: '', location: '', duration: '', bullets: '' }
    ],
    education: [
      { institution: '', degree: '', year: '', gpa: '' }
    ],
    skills: [
      { category: 'Languages', list: 'JavaScript, HTML/CSS' },
      { category: 'Frameworks & Libraries', list: 'React, Node.js' }
    ],
    projects: [
      { name: '', technologies: '', date: '', bullets: '' }
    ]
  });

  const [copied, setCopied] = useState(false);
  const [latexCode, setLatexCode] = useState('');
  const [activeTabPanel, setActiveTabPanel] = useState('code'); // 'code' or 'about'
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState('');

  // Refs for animations
  const builderContainerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const codePreRef = useRef(null);

  // Sync scan results if available (prefill once on mount or when scanResult changes)
  useEffect(() => {
    if (scanResult) {
      const skillsList = scanResult.matchedKeywords ? scanResult.matchedKeywords.join(', ') : '';
      const categoryLabel = selectedCategory ? selectedCategory.replace('_', ' ') : 'Primary Skills';
      
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          email: scanResult.details?.contactDetails?.email ? 'extracted@email.com' : '',
          phone: scanResult.details?.contactDetails?.phone ? '555-0199' : ''
        },
        skills: [
          { category: categoryLabel.toUpperCase(), list: skillsList },
          { category: 'Other Competencies', list: 'Git, Agile methodology, CI/CD' }
        ]
      }));
    }
  }, [scanResult, selectedCategory]);

  // Regenerate LaTeX code when formData or template changes
  useEffect(() => {
    const code = buildLatexCode(formData, template);
    setLatexCode(code);
  }, [formData, template]);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(leftPanelRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(rightPanelRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
    }, builderContainerRef);
    return () => ctx.revert();
  }, []);

  // Handle standard personal fields changes
  const handlePersonalInfoChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: val
      }
    }));
  };

  // Generic repeatable lists updates
  const updateListField = (section, index, field, val) => {
    setFormData(prev => {
      const updatedList = [...prev[section]];
      updatedList[index] = { ...updatedList[index], [field]: val };
      return { ...prev, [section]: updatedList };
    });
  };

  const addListItem = (section, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], defaultValue]
    }));
  };

  const removeListItem = (section, index) => {
    setFormData(prev => {
      if (prev[section].length <= 1) return prev; // Keep at least one item
      const updatedList = prev[section].filter((_, idx) => idx !== index);
      return { ...prev, [section]: updatedList };
    });
  };

  // Copy LaTeX code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download LaTeX as a .tex file
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([latexCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.personalInfo.name ? formData.personalInfo.name.replace(/\s+/g, '_') : 'resume'}_latex.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Compile LaTeX to PDF using free public serverless endpoint
  const handleCompilePDF = async () => {
    setIsCompiling(true);
    setCompileError('');
    try {
      const bodyData = new FormData();
      // Ensure CRLF endings to improve texlive.net stability
      const cleanLatex = latexCode.replace(/\r?\n/g, '\r\n');
      bodyData.append('filecontents[]', cleanLatex);
      bodyData.append('filename[]', 'document.tex');
      bodyData.append('engine', 'pdflatex');
      bodyData.append('return', 'pdf');

      const response = await fetch('https://corsproxy.io/?url=https://texlive.net/cgi-bin/latexcgi', {
        method: 'POST',
        body: bodyData
      });

      if (!response.ok) {
        throw new Error('Compilation server returned status ' + response.status + '.');
      }

      const blob = await response.blob();
      
      // Check if response is actually a log file instead of PDF (e.g. contains compilation error text)
      if (blob.type === 'text/html' || blob.type === 'text/plain') {
        const textLog = await blob.text();
        if (textLog.includes('Compilation failed') || textLog.includes('error') || textLog.includes('!')) {
          throw new Error('LaTeX compilation failed. Please check your document syntax.');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.personalInfo.name ? formData.personalInfo.name.replace(/\s+/g, '_') : 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setCompileError(err.message || 'An error occurred during LaTeX compilation.');
    } finally {
      setIsCompiling(false);
    }
  };

  // Form submission directly to Overleaf deep-link
  const handleOverleafSubmit = (e) => {
    e.preventDefault();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';

    const snipInput = document.createElement('input');
    snipInput.type = 'hidden';
    snipInput.name = 'snip[]';
    snipInput.value = latexCode;
    form.appendChild(snipInput);

    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'snip_name[]';
    nameInput.value = 'main.tex';
    form.appendChild(nameInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  // Lightweight custom syntax highlighter
  const highlightLatex = (code) => {
    if (!code) return '';
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Hide escaped percentage (\%) first
    html = html.replace(/\\%/g, '___ESC_PCT___');
    
    // Line comments: %[^\n]*
    let lines = html.split('\n');
    const highlighted = lines.map(line => {
      let commentPart = '';
      const pctIdx = line.indexOf('%');
      let codePart = line;
      if (pctIdx !== -1) {
        commentPart = line.substring(pctIdx);
        codePart = line.substring(0, pctIdx);
      }

      // Commands: \commandName
      codePart = codePart.replace(/(\\[a-zA-Z]+)/g, '<span class="tex-command">$1</span>');
      
      // Arguments: {text}
      codePart = codePart.replace(/(\{)([^}]+)(\})/g, '$1<span class="tex-arg">$2</span>$3');
      
      // Options: [text]
      codePart = codePart.replace(/(\[)([^\]]+)(\])/g, '$1<span class="tex-option">$2</span>$3');

      // Re-add comment
      if (commentPart) {
        return codePart + `<span class="tex-comment">${commentPart}</span>`;
      }
      return codePart;
    });

    html = highlighted.join('\n');
    // Restore escaped percentage
    html = html.replace(/___ESC_PCT___/g, '<span class="tex-escaped">\\%</span>');
    return html;
  };

  // Toggle Accordion Panels
  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? '' : sectionName);
  };

  return (
    <div className="latex-builder-root" ref={builderContainerRef}>
      {/* Tab Header */}
      <div className="builder-header-section">
        <span className="badge-glow-purple"><Sparkles size={14} /> Phase 3 Active</span>
        <h1 className="gradient-text-purple">LaTeX Live Template Editor</h1>
        <p>Input your credentials, configure dynamic repeatable bullet achievements, and export compiling-clean LaTeX code instantly.</p>
      </div>

      <div className="builder-grid">
        {/* Left Side: Structured Form Inputs */}
        <div className="glass-panel builder-left-panel" ref={leftPanelRef}>
          
          {/* Template Choice Cards */}
          <div className="panel-inner-section">
            <h3 className="section-title"><Code size={16} /> Choose LaTeX Theme</h3>
            <div className="template-cards-row">
              {TEMPLATES.map(t => (
                <div 
                  key={t.id} 
                  className={`template-theme-card ${template === t.id ? 'active' : ''}`}
                  onClick={() => setTemplate(t.id)}
                >
                  <FileText size={20} className="theme-card-icon" />
                  <h4>{t.name}</h4>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion List Form */}
          <div className="accordion-wrapper">
            
            {/* 1. PERSONAL DETAILS */}
            <div className={`accordion-item ${openSection === 'personal' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('personal')}>
                <span className="trigger-label"><User size={16} /> Personal Details</span>
                {openSection === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe" 
                      value={formData.personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="jane.doe@example.com" 
                      value={formData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 0199" 
                      value={formData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Location (City, State)</label>
                    <input 
                      type="text" 
                      placeholder="San Francisco, CA" 
                      value={formData.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>LinkedIn URL</label>
                    <input 
                      type="text" 
                      placeholder="linkedin.com/in/janedoe" 
                      value={formData.personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>GitHub URL</label>
                    <input 
                      type="text" 
                      placeholder="github.com/janedoe" 
                      value={formData.personalInfo.github}
                      onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PROFESSIONAL SUMMARY */}
            <div className={`accordion-item ${openSection === 'summary' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('summary')}>
                <span className="trigger-label"><FileText size={16} /> Professional Summary</span>
                {openSection === 'summary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                <div className="input-group">
                  <label>Brief Profile / Value Summary (2-3 sentences)</label>
                  <textarea 
                    rows="3"
                    className="builder-textarea"
                    placeholder="Describe your core expertise, career highlights, and what you aim to achieve..." 
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* 3. WORK EXPERIENCE */}
            <div className={`accordion-item ${openSection === 'experience' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('experience')}>
                <span className="trigger-label"><Briefcase size={16} /> Work Experience ({formData.experience.length})</span>
                {openSection === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="repeater-block">
                    <div className="repeater-header">
                      <span>Experience Entry #{idx + 1}</span>
                      {formData.experience.length > 1 && (
                        <button className="btn-remove-item" onClick={() => removeListItem('experience', idx)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2">
                      <div className="input-group">
                        <label>Job Title / Role</label>
                        <input 
                          type="text" 
                          placeholder="Senior Software Engineer"
                          value={exp.role}
                          onChange={(e) => updateListField('experience', idx, 'role', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Company Name</label>
                        <input 
                          type="text" 
                          placeholder="Acme Corp"
                          value={exp.company}
                          onChange={(e) => updateListField('experience', idx, 'company', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Duration (e.g. June 2022 -- Present)</label>
                        <input 
                          type="text" 
                          placeholder="June 2022 -- Present"
                          value={exp.duration}
                          onChange={(e) => updateListField('experience', idx, 'duration', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Location (City, State)</label>
                        <input 
                          type="text" 
                          placeholder="Chicago, IL"
                          value={exp.location}
                          onChange={(e) => updateListField('experience', idx, 'location', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="input-group mt-12">
                      <label>Bullet Accomplishments (One per line)</label>
                      <textarea 
                        rows="3"
                        className="builder-textarea"
                        placeholder="- Spearheaded migrating core dashboards to React, increasing page load speed by 30%&#10;- Led a team of 4 junior developers to build scalable microservices."
                        value={exp.bullets}
                        onChange={(e) => updateListField('experience', idx, 'bullets', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn-add-item mt-8" 
                  onClick={() => addListItem('experience', { role: '', company: '', location: '', duration: '', bullets: '' })}
                >
                  <Plus size={16} /> Add Work Experience
                </button>
              </div>
            </div>

            {/* 4. TECHNICAL SKILLS */}
            <div className={`accordion-item ${openSection === 'skills' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('skills')}>
                <span className="trigger-label"><Wrench size={16} /> Technical Skills ({formData.skills.length})</span>
                {openSection === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="repeater-block-inline">
                    <div className="input-group flex-1">
                      <label>Category (e.g. Languages)</label>
                      <input 
                        type="text" 
                        placeholder="Languages"
                        value={skill.category}
                        onChange={(e) => updateListField('skills', idx, 'category', e.target.value)}
                      />
                    </div>
                    <div className="input-group flex-2">
                      <label>Skills List (separated by commas)</label>
                      <input 
                        type="text" 
                        placeholder="Python, C++, Java, JavaScript"
                        value={skill.list}
                        onChange={(e) => updateListField('skills', idx, 'list', e.target.value)}
                      />
                    </div>
                    {formData.skills.length > 1 && (
                      <button className="btn-remove-icon-only mt-24" onClick={() => removeListItem('skills', idx)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  className="btn-add-item mt-8" 
                  onClick={() => addListItem('skills', { category: '', list: '' })}
                >
                  <Plus size={16} /> Add Skills Category
                </button>
              </div>
            </div>

            {/* 5. PERSONAL PROJECTS */}
            <div className={`accordion-item ${openSection === 'projects' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('projects')}>
                <span className="trigger-label"><Code size={16} /> Projects ({formData.projects.length})</span>
                {openSection === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="repeater-block">
                    <div className="repeater-header">
                      <span>Project Entry #{idx + 1}</span>
                      {formData.projects.length > 1 && (
                        <button className="btn-remove-item" onClick={() => removeListItem('projects', idx)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2">
                      <div className="input-group">
                        <label>Project Name</label>
                        <input 
                          type="text" 
                          placeholder="Dynamic Dashboard System"
                          value={proj.name}
                          onChange={(e) => updateListField('projects', idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Technologies Used</label>
                        <input 
                          type="text" 
                          placeholder="React, Redux, Node.js"
                          value={proj.technologies}
                          onChange={(e) => updateListField('projects', idx, 'technologies', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Completion Date</label>
                        <input 
                          type="text" 
                          placeholder="Spring 2024"
                          value={proj.date}
                          onChange={(e) => updateListField('projects', idx, 'date', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="input-group mt-12">
                      <label>Bullet Details (One per line)</label>
                      <textarea 
                        rows="2"
                        className="builder-textarea"
                        placeholder="- Built real-time WebSocket feeds pushing server analytics to client dashboard.&#10;- Optimized search queries reducing SQL execution times by 20%."
                        value={proj.bullets}
                        onChange={(e) => updateListField('projects', idx, 'bullets', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn-add-item mt-8" 
                  onClick={() => addListItem('projects', { name: '', technologies: '', date: '', bullets: '' })}
                >
                  <Plus size={16} /> Add Project
                </button>
              </div>
            </div>

            {/* 6. EDUCATION */}
            <div className={`accordion-item ${openSection === 'education' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleSection('education')}>
                <span className="trigger-label"><GraduationCap size={16} /> Education ({formData.education.length})</span>
                {openSection === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className="accordion-content">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="repeater-block">
                    <div className="repeater-header">
                      <span>Education Entry #{idx + 1}</span>
                      {formData.education.length > 1 && (
                        <button className="btn-remove-item" onClick={() => removeListItem('education', idx)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid-2">
                      <div className="input-group">
                        <label>Institution / University Name</label>
                        <input 
                          type="text" 
                          placeholder="State University"
                          value={edu.institution}
                          onChange={(e) => updateListField('education', idx, 'institution', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Degree / Certificate (e.g. B.S. in Computer Science)</label>
                        <input 
                          type="text" 
                          placeholder="Bachelor of Science in Software Engineering"
                          value={edu.degree}
                          onChange={(e) => updateListField('education', idx, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Graduation Year</label>
                        <input 
                          type="text" 
                          placeholder="May 2024"
                          value={edu.year}
                          onChange={(e) => updateListField('education', idx, 'year', e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>GPA (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="3.8 / 4.0"
                          value={edu.gpa}
                          onChange={(e) => updateListField('education', idx, 'gpa', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn-add-item mt-8" 
                  onClick={() => addListItem('education', { institution: '', degree: '', year: '', gpa: '' })}
                >
                  <Plus size={16} /> Add Education Entry
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Code Preview Panel */}
        <div className="glass-panel builder-right-panel" ref={rightPanelRef}>
          <div className="code-panel-header">
            <div className="panel-tabs">
              <button 
                className={`panel-tab-btn ${activeTabPanel === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTabPanel('code')}
              >
                LaTeX Source
              </button>
              <button 
                className={`panel-tab-btn ${activeTabPanel === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTabPanel('about')}
              >
                About Compiling
              </button>
            </div>
            
            <div className="panel-actions">
              <button 
                className={`btn-action-text compile-btn ${isCompiling ? 'loading' : ''}`} 
                onClick={handleCompilePDF}
                disabled={isCompiling}
                title="Compile LaTeX code directly into a PDF using texlive.net API"
              >
                {isCompiling ? (
                  <>
                    <div className="spinner-sm"></div>
                    Compiling...
                  </>
                ) : (
                  <>
                    Compile PDF <Sparkles size={14} />
                  </>
                )}
              </button>
              <button className="btn-action-icon" onClick={handleDownload} title="Download .tex File">
                <Download size={16} />
              </button>
              <button className={`btn-action-icon ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy to Clipboard">
                {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
              </button>
              <button className="btn-action-text glow-purple-btn" onClick={handleOverleafSubmit}>
                Open in Overleaf <ExternalLink size={14} />
              </button>
            </div>
          </div>

          <div className="code-panel-body">
            {compileError && (
              <div className="compile-error-banner">
                <XCircle size={16} style={{ flexShrink: 0 }} />
                <span>{compileError}</span>
              </div>
            )}
            {activeTabPanel === 'code' ? (
              <div className="code-viewer-container">
                <div className="sync-pulse">
                  <span className="sync-pulse-dot"></span>
                  Live Sync Active
                </div>
                <pre ref={codePreRef} className="latex-code-pre">
                  <code 
                    dangerouslySetInnerHTML={{ __html: highlightLatex(latexCode) }} 
                  />
                </pre>
              </div>
            ) : (
              <div className="instructions-panel">
                <h4>Compiling your LaTeX Resume</h4>
                <p>LaTeX is a document preparation system widely trusted by software engineers and academics because it generates clean layouts that are 100% readable by ATS scanning software.</p>
                
                <div className="instructions-step mt-12">
                  <h5>Option 1: Overleaf (Recommended)</h5>
                  <p>Click the <strong>"Open in Overleaf"</strong> button at the top right. This will launch a new, private project inside Overleaf containing your complete resume ready to compile into a PDF.</p>
                </div>

                <div className="instructions-step mt-12">
                  <h5>Option 2: Local Compilation</h5>
                  <ol>
                    <li>Download the source file using the Download button (<Download size={14} />).</li>
                    <li>Ensure you have a TeX distribution (MacTeX for macOS, TeX Live/MikTeX for Windows/Linux) installed.</li>
                    <li>Compile using <code>pdflatex resume_latex.tex</code>.</li>
                  </ol>
                </div>

                <div className="fixes-callout glass-panel mt-24">
                  <Sparkles size={20} className="callout-icon-purple" />
                  <div className="callout-text">
                    <h5>Need to re-evaluate after edits?</h5>
                    <p>Copy your PDF text or download the PDF from Overleaf and run it back through our scanner tab to score your edits.</p>
                    <button className="btn-secondary btn-sm mt-8" onClick={() => setActiveTab('scan')}>
                      Go to Scanner ←
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .latex-builder-root {
          padding: 60px 40px;
          max-width: 1350px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
          flex: 1;
        }

        .builder-header-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          max-width: 700px;
          margin: 0 auto;
        }

        .badge-glow-purple {
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: var(--accent);
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

        .gradient-text-purple {
          background: linear-gradient(135deg, #ffffff 30%, #a855f7 70%, #06b6d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shineText 6s linear infinite;
          font-size: 46px;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0;
        }

        .builder-header-section p {
          color: var(--text-secondary);
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }

        .builder-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: stretch;
          min-height: 700px;
        }

        .builder-left-panel, .builder-right-panel {
          background: rgba(10, 15, 30, 0.65);
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-radius: 16px;
        }

        .builder-right-panel {
          height: auto;
          max-height: 900px;
          position: sticky;
          top: 90px;
        }

        .panel-inner-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .template-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .template-theme-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .theme-card-icon {
          color: var(--text-muted);
          transition: color 0.25s;
        }

        .template-theme-card h4 {
          font-size: 14px;
          font-weight: 650;
          color: var(--text-primary);
        }

        .template-theme-card p {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .template-theme-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(168, 85, 247, 0.3);
        }

        .template-theme-card.active {
          background: rgba(168, 85, 247, 0.06);
          border-color: var(--accent);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.15);
        }

        .template-theme-card.active .theme-card-icon {
          color: var(--accent);
        }

        /* Accordion Panel Formatting */
        .accordion-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .accordion-item {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
          transition: background 0.3s;
        }

        .accordion-item.open {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }

        .trigger-label {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-out, padding 0.3s ease-out;
          padding: 0 20px;
        }

        .accordion-item.open .accordion-content {
          max-height: 1200px;
          padding: 0 20px 24px 20px;
          overflow-y: auto;
        }

        /* Form Inputs */
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group input, .builder-textarea {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .input-group input:focus, .builder-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.15);
        }

        .builder-textarea {
          resize: vertical;
          font-family: var(--font-sans);
          line-height: 1.5;
        }

        /* Repeatable sections block design */
        .repeater-block {
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px;
          margin-top: 14px;
          background: rgba(255, 255, 255, 0.01);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .repeater-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .repeater-block-inline {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        .btn-add-item {
          background: rgba(168, 85, 247, 0.06);
          color: var(--accent);
          border: 1px dashed rgba(168, 85, 247, 0.25);
          border-radius: 8px;
          padding: 10px;
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-add-item:hover {
          background: rgba(168, 85, 247, 0.1);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        .btn-remove-item {
          background: transparent;
          border: none;
          color: var(--danger);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-remove-item:hover {
          text-decoration: underline;
        }

        .btn-remove-icon-only {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--danger);
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-remove-icon-only:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--danger);
        }

        /* Code Preview Layout */
        .code-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .panel-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid var(--border-color);
        }

        .panel-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .panel-tab-btn.active {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .panel-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-action-icon {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
        }

        .btn-action-icon:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .btn-action-icon.copied {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .btn-action-text {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: var(--text-primary);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.25s;
        }

        .btn-action-text:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        .glow-purple-btn {
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
        }
        .glow-purple-btn:hover {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.35);
        }

        .code-panel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .code-viewer-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
          height: 100%;
        }

        .compile-btn {
          background: linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%) !important;
          border: 1px solid rgba(168, 85, 247, 0.4) !important;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.25) !important;
        }

        .compile-btn:hover:not(:disabled) {
          box-shadow: 0 0 16px rgba(168, 85, 247, 0.5) !important;
          transform: translateY(-1px);
        }

        .compile-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .compile-error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.4;
        }

        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .sync-pulse {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sync-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary);
          animation: pulseGlow 1.8s infinite ease-in-out;
        }

        .latex-code-pre {
          background: rgba(3, 5, 12, 0.85);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          overflow-y: auto;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 13.5px;
          line-height: 1.6;
          color: #d1d5db;
          flex: 1;
          max-height: 700px;
        }

        /* Syntax Highlighting CSS */
        .tex-command { color: #c084fc; font-weight: 500; } /* light purple */
        .tex-arg { color: #34d399; } /* emerald */
        .tex-option { color: #60a5fa; } /* blue */
        .tex-comment { color: #6b7280; font-style: italic; } /* gray */
        .tex-escaped { color: #f59e0b; } /* orange */

        /* About compiling panel */
        .instructions-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 10px 0;
        }

        .instructions-panel h4 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .instructions-panel p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .instructions-step {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 10px;
        }

        .instructions-step h5 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .instructions-step ol {
          margin-left: 20px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 13.5px;
        }

        .callout-icon-purple {
          color: var(--accent);
          flex-shrink: 0;
        }

        /* Responsive builder layout */
        @media (max-width: 992px) {
          .builder-grid {
            grid-template-columns: 1fr;
          }
          .builder-right-panel {
            position: relative;
            top: 0;
            max-height: 600px;
          }
        }
      `}} />
    </div>
  );
}

export default LaTeXBuilder;
