/**
 * Helper to escape special LaTeX characters to prevent compile errors.
 * @param {string} str - Raw input text
 * @returns {string} LaTeX-safe text
 */
export const escapeLatex = (str) => {
  if (str === null || str === undefined) return '';
  const stringVal = typeof str === 'function' ? '' : String(str);
  return stringVal
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\[/g, '{[}')
    .replace(/\]/g, '{]}');
};

/**
 * Builds the full LaTeX source code based on form data and selected template.
 * @param {object} formData - Form input values
 * @param {string} template - Template name ('minimal', 'twocolumn', 'academic')
 * @returns {string} Compilable LaTeX code
 */
export const buildLatexCode = (formData, template = 'minimal') => {
  const {
    personalInfo = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    projects = []
  } = formData;

  const esc = escapeLatex;

  // Contact details formatting
  const contacts = [];
  if (personalInfo.phone) contacts.push(esc(personalInfo.phone));
  if (personalInfo.email) contacts.push(`\\href{mailto:${personalInfo.email}}{${esc(personalInfo.email)}}`);
  if (personalInfo.location) contacts.push(esc(personalInfo.location));
  if (personalInfo.linkedin) {
    const cleanLinkedin = personalInfo.linkedin.replace(/https?:\/\/(www\.)?/, '');
    contacts.push(`\\href{https://${cleanLinkedin}}{LinkedIn}`);
  }
  if (personalInfo.github) {
    const cleanGithub = personalInfo.github.replace(/https?:\/\/(www\.)?/, '');
    contacts.push(`\\href{https://${cleanGithub}}{GitHub}`);
  }
  const contactLine = contacts.join(' $\\mid$ ');

  if (template === 'twocolumn') {
    return generateTwoColumnTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc);
  } else if (template === 'academic') {
    return generateAcademicTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc);
  } else {
    return generateMinimalTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc);
  }
};

// --- Minimalist Standard Template ---
function generateMinimalTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc) {
  return `%-------------------------
% Resume in LaTeX (Minimal Template)
% Author: ATSPulse Live Editor
%------------------------

\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancybehavior{clear}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure PDF is machine readable (ATS friendly)
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small\\textbf{#1} & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${esc(personalInfo.name || 'Your Name')}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}

${summary ? `
%----------SUMMARY----------
\\section{Professional Summary}
\\small{
  ${esc(summary)}
}
` : ''}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    ${experience.length > 0 ? experience.map(exp => `
    \\resumeSubheading{
      ${esc(exp.role || 'Job Title')}}{${esc(exp.duration || 'Duration')}}{
      ${esc(exp.company || 'Company')}}{${esc(exp.location || 'Location')}}
      \\begin{itemize}
        ${(exp.bullets || '').split('\n').filter(b => b.trim()).map(bullet => `\\resumeItem{${esc(bullet.replace(/^-\s*/, ''))}}`).join('\n        ') || '\\resumeItem{Responsibilities and achievements.}'}
      \\end{itemize}
    `).join('\n') : `
    \\resumeSubheading{
      Role Title}{June 2024 -- Present}{
      Company Name}{City, State}
      \\begin{itemize}
        \\resumeItem{Spearheaded a critical technical project delivering 15\\% improvement in latency.}
        \\resumeItem{Collaborated with cross-functional teams using React and Node.js.}
      \\end{itemize}
    `}
  \\end{itemize}

%-----------PROJECTS-----------
\\section{Projects}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    ${projects.length > 0 ? projects.map(proj => `
    \\resumeProjectHeading{
      \\textbf{${esc(proj.name || 'Project Name')}} $|$ \\emph{${esc(proj.technologies || 'Tech Stack')}}}{${esc(proj.date || 'Date')}}
      \\begin{itemize}
        ${(proj.bullets || '').split('\n').filter(b => b.trim()).map(bullet => `\\resumeItem{${esc(bullet.replace(/^-\s*/, ''))}}`).join('\n        ') || '\\resumeItem{Describe project details and impact.}'}
      \\end{itemize}
    `).join('\n') : `
    \\resumeProjectHeading{
      \\textbf{E-Commerce Service} $|$ \\emph{React, Node.js, PostgreSQL}}{May 2024}
      \\begin{itemize}
        \\resumeItem{Designed and implemented RESTful API scaling transaction throughput by 40\\%.}
        \\resumeItem{Integrated secure payment workflows supporting thousands of monthly users.}
      \\end{itemize}
    `}
  \\end{itemize}

%-----------TECHNICAL SKILLS-----------
\\section{Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      ${skills.length > 0 ? skills.map(sk => `\\textbf{${esc(sk.category || 'Category')}}{: ${esc(sk.list || 'Skill, Skill')}} \\\\`).join('\n      ') : `
      \\textbf{Languages}{: JavaScript, TypeScript, Python, HTML/CSS, SQL} \\\\
      \\textbf{Frameworks}{: React.js, Next.js, Node.js, Express} \\\\
      \\textbf{Developer Tools}{: Git, Docker, VS Code, AWS}
      `}
    }}
 \\end{itemize}

%-----------EDUCATION-----------
\\section{Education}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    ${education.length > 0 ? education.map(edu => `
    \\resumeSubheading{
      ${esc(edu.institution || 'University')}}{${esc(edu.location || '')}}{
      ${esc(edu.degree || 'Degree')}}{${esc(edu.year || 'Graduation Year')}}
      ${edu.gpa ? `\\small{GPA: ${esc(edu.gpa)}}` : ''}
    `).join('\n') : `
    \\resumeSubheading{
      State University}{City, State}{
      Bachelor of Science in Computer Science}{May 2024}
    `}
  \\end{itemize}

\\end{document}
`;
}

// --- Two-Column Layout Template ---
function generateTwoColumnTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc) {
  return `%-------------------------
% Resume in LaTeX (Two-Column Template)
% Author: ATSPulse Live Editor
%------------------------

\\documentclass[letterpaper,10pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{multicol}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancybehavior{clear}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-.6in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{gray}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} $|$ \\small\\emph{#3} & \\small#2 \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small\\textbf{#1} & #2 \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge ${esc(personalInfo.name || 'Your Name')}} \\\\ \\vspace{4pt}
    \\small ${contactLine}
\\end{center}

${summary ? `
\\section{Profile}
\\small{
  ${esc(summary)}
}
\\vspace{5pt}
` : ''}

% Split into Left (Experience/Projects) and Right (Skills/Education)
\\begin{multicols}{2}
\\setlength{\\columnsep}{25pt}

\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    ${experience.length > 0 ? experience.map(exp => `
    \\resumeSubheading{
      ${esc(exp.role || 'Role')}}{${esc(exp.duration || 'Date')}}{
      ${esc(exp.company || 'Company')}}{}
      \\begin{itemize}[leftmargin=0.1in]
        ${(exp.bullets || '').split('\n').filter(b => b.trim()).map(bullet => `\\resumeItem{${esc(bullet.replace(/^-\s*/, ''))}}`).join('\n        ') || '\\resumeItem{Key responsibility bullet.}'}
      \\end{itemize}
    `).join('\n') : `
    \\resumeSubheading{
      Software Engineer}{2024 -- Pres.}{
      Enterprise Inc.}{}
      \\begin{itemize}[leftmargin=0.1in]
        \\resumeItem{Led frontend migrations.}
        \\resumeItem{Improved build tools speed.}
      \\end{itemize}
    `}
  \\end{itemize}

\\columnbreak

\\section{Skills}
  \\begin{itemize}[leftmargin=0.1in, label={}]
    \\small{
    ${skills.length > 0 ? skills.map(sk => `\\item \\textbf{${esc(sk.category || 'Category')}}: \\\\ ${esc(sk.list || 'Skill, Skill')} \\vspace{2pt}`).join('\n    ') : `
    \\item \\textbf{Languages}: \\\\ JavaScript, Python, SQL
    \\item \\textbf{Frameworks}: \\\\ React, Node.js, Tailwind
    \\item \\textbf{Concepts}: \\\\ CI/CD, Git, REST APIs
    `}
    }
  \\end{itemize}
  \\vspace{10pt}

\\section{Education}
  \\begin{itemize}[leftmargin=0.1in, label={}]
    ${education.length > 0 ? education.map(edu => `
    \\item
      \\textbf{${esc(edu.institution || 'University')}} \\\\
      \\small\\emph{${esc(edu.degree || 'Degree')}} \\\\
      \\small{Graduated: ${esc(edu.year || 'Date')}}
      ${edu.gpa ? `\\\\ \\small{GPA: ${esc(edu.gpa)}}` : ''}
      \\vspace{4pt}
    `).join('\n') : `
    \\item
      \\textbf{State University} \\\\
      \\small\\emph{B.S. Computer Science} \\\\
      \\small{Graduated: 2024}
    `}
  \\end{itemize}
  \\vspace{10pt}

\\section{Projects}
  \\begin{itemize}[leftmargin=0.1in, label={}]
    ${projects.length > 0 ? projects.map(proj => `
    \\item
      \\textbf{${esc(proj.name || 'Project')}} \\\\
      \\small\\emph{${esc(proj.technologies || 'Stack')}}
      \\begin{itemize}[leftmargin=0.1in]
        ${(proj.bullets || '').split('\n').filter(b => b.trim()).slice(0, 2).map(bullet => `\\resumeItem{${esc(bullet.replace(/^-\s*/, ''))}}`).join('\n        ') || '\\resumeItem{Describe impact.}'}
      \\end{itemize}
    `).join('\n') : `
    \\item
      \\textbf{Task Board} \\\\
      \\small\\emph{React \& Webpack}
      \\begin{itemize}[leftmargin=0.1in]
        \\resumeItem{Designed drag-drop UI.}
      \\end{itemize}
    `}
  \\end{itemize}

\\end{multicols}

\\end{document}
`;
}

// --- Academic / Classic Template ---
function generateAcademicTemplate(personalInfo, contactLine, summary, experience, education, skills, projects, esc) {
  return `%-------------------------
% Resume in LaTeX (Academic / Classic Template)
% Author: ATSPulse Live Editor
%------------------------

\\documentclass[letterpaper,11pt]{article}
\\usepackage{charter} % Serif font standard in academic designs
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\input{glyphtounicode}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section Titles (Academic Style)
\\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\hrule]
\\titlespacing{\\section}{0pt}{12pt}{8pt}

\\pdfgentounicode=1

\\begin{document}

%----------HEADER----------
\\begin{center}
    {\\Huge \\scshape ${esc(personalInfo.name || 'Your Name')}} \\\\ \\vspace{6pt}
    \\small ${contactLine}
\\end{center}

${summary ? `
%----------STATEMENT----------
\\section{Research / Professional Statement}
\\small{
  ${esc(summary)}
}
` : ''}

%----------EDUCATION----------
\\section{Education}
\\begin{itemize}[leftmargin=0in, label={}]
  ${education.length > 0 ? education.map(edu => `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${esc(edu.institution || 'Institution')}} & ${esc(edu.year || 'Date')} \\\\
      \\emph{${esc(edu.degree || 'Degree')}} ${edu.gpa ? ` $|$ \\small{GPA: ${esc(edu.gpa)}}` : ''} & \\\\
    \\end{tabular*}\\vspace{4pt}
  `).join('\n') : `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{State University} & May 2024 \\\\
      \\emph{Bachelor of Science in Computer Science} & \\\\
    \\end{tabular*}\\vspace{4pt}
  `}
\\end{itemize}

%----------RESEARCH & WORK EXPERIENCE----------
\\section{Professional & Research Experience}
\\begin{itemize}[leftmargin=0in, label={}]
  ${experience.length > 0 ? experience.map(exp => `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${esc(exp.company || 'Organization')}} & ${esc(exp.location || 'Location')} \\\\
      \\emph{${esc(exp.role || 'Role Title')}} & ${esc(exp.duration || 'Duration')} \\\\
    \\end{tabular*}
    \\begin{itemize}[leftmargin=0.2in]
      ${(exp.bullets || '').split('\n').filter(b => b.trim()).map(bullet => `\\item ${esc(bullet.replace(/^-\s*/, ''))}`).join('\n      ') || '\\item Documented core achievements and technical responsibilities.'}
    \\end{itemize}
    \\vspace{4pt}
  `).join('\n') : `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{Department of Computer Science, State University} & City, State \\\\
      \\emph{Research Assistant} & Sept 2023 -- May 2024 \\\\
    \\end{tabular*}
    \\begin{itemize}[leftmargin=0.2in]
      \\item Assisted faculty members in data pipeline modeling using Python and pandas.
      \\item Co-authored publications detailing algorithmic performance profiles.
    \\end{itemize}
    \\vspace{4pt}
  `}
\\end{itemize}

%----------PROJECTS----------
\\section{Selected Projects}
\\begin{itemize}[leftmargin=0in, label={}]
  ${projects.length > 0 ? projects.map(proj => `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{${esc(proj.name || 'Project Title')}} $|$ \\small\\emph{${esc(proj.technologies || 'Technologies')}} & ${esc(proj.date || 'Date')} \\\\
    \\end{tabular*}
    \\begin{itemize}[leftmargin=0.2in]
      ${(proj.bullets || '').split('\n').filter(b => b.trim()).map(bullet => `\\item ${esc(bullet.replace(/^-\s*/, ''))}`).join('\n      ') || '\\item Key project contribution bullet.'}
    \\end{itemize}
    \\vspace{4pt}
  `).join('\n') : `
  \\item
    \\begin{tabular*}{1.0\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{Distributed File Node} $|$ \\small\\emph{Go, gRPC, Protobuf} & Fall 2023 \\\\
    \\end{tabular*}
    \\begin{itemize}[leftmargin=0.2in]
      \\item Built consistent hashing algorithms partition file replication states.
    \\end{itemize}
  `}
\\end{itemize}

%----------SKILLS----------
\\section{Expertise & Technical Profile}
\\begin{itemize}[leftmargin=0.15in]
  ${skills.length > 0 ? skills.map(sk => `\\item \\textbf{${esc(sk.category || 'Category')}}: ${esc(sk.list || 'Skill, Skill')}`).join('\n  ') : `
  \\item \\textbf{Programming Languages}: Python, Java, Go, SQL, JavaScript
  \\item \\textbf{Frameworks \\& Libraries}: React, PyTorch, NumPy, Flask
  \\item \\textbf{System Competencies}: Docker, Kubernetes, Linux Core, Git
  `}
\\end{itemize}

\\end{document}
`;
}
