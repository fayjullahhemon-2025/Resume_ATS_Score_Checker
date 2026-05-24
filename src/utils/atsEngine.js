// Keywords dictionary based on target job categories
export const JOB_CATEGORIES = {
  web_developer: {
    label: "Web Developer (Full Stack / Frontend / Backend)",
    keywords: [
      "react", "javascript", "typescript", "node.js", "git", "rest api", "html5", "css3", 
      "database", "mongodb", "postgresql", "sql", "graphql", "redux", "tailwind css", 
      "docker", "aws", "next.js", "express", "responsive design", "ci/cd", "agile", "testing"
    ]
  },
  data_scientist: {
    label: "Data Scientist / ML Engineer",
    keywords: [
      "python", "r language", "machine learning", "deep learning", "sql", "pandas", "numpy", 
      "scikit-learn", "tensorflow", "pytorch", "statistics", "tableau", "power bi", "data mining", 
      "big data", "spark", "hadoop", "predictive modeling", "nlp", "data visualization"
    ]
  },
  ux_designer: {
    label: "UI/UX & Product Designer",
    keywords: [
      "figma", "sketch", "adobe xd", "wireframing", "prototyping", "user research", "ui design", 
      "usability testing", "design system", "information architecture", "interaction design", 
      "user journeys", "persona", "heurisitc evaluation", "mockups", "visual design", "css"
    ]
  },
  marketing_manager: {
    label: "Digital Marketing & Growth Manager",
    keywords: [
      "seo", "sem", "google analytics", "growth hacking", "ppc", "crm", "email marketing", 
      "social media", "campaign", "copywriting", "lead generation", "content strategy", 
      "ab testing", "branding", "roi", "conversion rate", "marketing automation", "sql"
    ]
  },
  finance_analyst: {
    label: "Financial & Business Analyst",
    keywords: [
      "financial modeling", "valuation", "forecasting", "excel", "sql", "tableau", "power bi", 
      "budgeting", "variance analysis", "portfolio management", "risk analysis", "corporate finance", 
      "vba", "accounting", "reporting", "sap", "market research"
    ]
  },
  fresher_developer: {
    label: "Entry Level Software Engineer (Fresher)",
    keywords: [
      "data structures", "algorithms", "java", "python", "c++", "javascript", "git", "github", 
      "oop", "problem solving", "databases", "html", "css", "software engineering", "web design", 
      "portfolio", "debugging", "teamwork", "sdlc"
    ]
  }
};

// Section headers mapping for structure check
const SECTION_HEADERS = {
  experience: ["experience", "work experience", "professional experience", "employment history", "work history", "professional background"],
  education: ["education", "academic history", "academic background", "education details", "studies", "academic profile"],
  skills: ["skills", "technical skills", "core competencies", "technologies", "key skills", "expertise"],
  projects: ["projects", "personal projects", "academic projects", "key projects", "notable projects"],
  summary: ["summary", "profile", "professional summary", "about me", "objective", "career objective"]
};

// Action verbs list (Impact)
const ACTION_VERBS = [
  "spearheaded", "engineered", "architected", "orchestrated", "developed", "implemented", 
  "designed", "managed", "led", "built", "optimized", "automated", "streamlined", 
  "created", "delivered", "increased", "reduced", "improved", "achieved", "analyzed", 
  "formulated", "leveraged", "expanded", "pioneered", "coordinated", "executed"
];

// Weak phrases/verbs to warning
const WEAK_PHRASES = [
  "helped", "assisted", "responsible for", "worked on", "participated in", "duties included", 
  "handled", "various tasks", "etc."
];

/**
 * Escapes special regex characters in a string so it can be safely used in a RegExp.
 * e.g. "c++" -> "c\\+\\+", "node.js" -> "node\.js"
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Analyzes resume plain text against standard ATS guidelines and target job category.
 * @param {string} text - Resume plain text
 * @param {string} categoryKey - Selected job category key from JOB_CATEGORIES
 * @returns {object} Analysis result containing scores, issues, and suggestions
 */
export const analyzeResume = (text, categoryKey) => {
  const cleanText = text.toLowerCase();
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Initialize scores
  let structureScore = 0; // max 20
  let keywordScore = 0;   // max 30
  let formattingScore = 0;// max 20
  let impactScore = 0;    // max 20
  let contactScore = 0;   // max 10
  
  const issues = [];
  const suggestions = [];
  
  // 1. STRUCTURE ANALYSIS (Max 20 points, 4 points per section found)
  const sectionsFound = {};
  Object.entries(SECTION_HEADERS).forEach(([section, keywords]) => {
    const found = keywords.some(kw => {
      // Escape the keyword and match as a near-standalone heading on its own line
      const escaped = escapeRegex(kw);
      const regex = new RegExp(`(^|\\n|\\r)\\s*${escaped}\\s*(\\n|\\r|$)`, 'i');
      return regex.test(text);
    });
    sectionsFound[section] = found;
    if (found) {
      structureScore += 4;
    }
  });

  // Structure suggestions/issues
  if (!sectionsFound.experience) {
    issues.push({ type: 'error', message: 'Missing "Work Experience" section header.' });
    suggestions.push('Add a clearly labeled "Work Experience" section to outline your career history.');
  } else {
    issues.push({ type: 'success', message: 'Work Experience section found.' });
  }

  if (!sectionsFound.education) {
    issues.push({ type: 'error', message: 'Missing "Education" section header.' });
    suggestions.push('Add an "Education" section including details of your degree and institution.');
  } else {
    issues.push({ type: 'success', message: 'Education section found.' });
  }

  if (!sectionsFound.skills) {
    issues.push({ type: 'error', message: 'Missing "Skills" section header.' });
    suggestions.push('Create a dedicated "Skills" or "Technical Skills" section for easy keyword scanning.');
  } else {
    issues.push({ type: 'success', message: 'Skills section found.' });
  }

  if (!sectionsFound.projects) {
    issues.push({ type: 'warning', message: 'Missing "Projects" section.' });
    suggestions.push('Add a "Projects" section to demonstrate practical application of your skills.');
  } else {
    issues.push({ type: 'success', message: 'Projects section found.' });
  }

  if (!sectionsFound.summary) {
    issues.push({ type: 'warning', message: 'Missing "Professional Summary" or "Profile" section.' });
    suggestions.push('Add a brief 2-3 sentence professional summary at the top to highlight your value proposition.');
  }

  // 2. KEYWORD ANALYSIS (Max 30 points)
  const category = JOB_CATEGORIES[categoryKey] || JOB_CATEGORIES.fresher_developer;
  const matchedKeywords = [];
  const missingKeywords = [];

  category.keywords.forEach(kw => {
    // Escape special regex characters (e.g. c++, node.js, r language)
    const escaped = escapeRegex(kw);
    // For multi-word keywords use a simple includes check; for single words use word boundary
    const isMultiWord = kw.includes(' ');
    let regex;
    if (isMultiWord) {
      regex = new RegExp(escaped, 'i');
    } else {
      // Use word boundary but fall back gracefully for symbols like c++
      try {
        regex = new RegExp(`\\b${escaped}\\b`, 'i');
      } catch {
        regex = new RegExp(escaped, 'i');
      }
    }
    if (regex.test(text)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchRatio = category.keywords.length > 0 ? matchedKeywords.length / category.keywords.length : 0;
  keywordScore = Math.round(keywordMatchRatio * 30);

  if (keywordMatchRatio < 0.3) {
    issues.push({ type: 'error', message: `Very low alignment with ${category.label} keywords (${matchedKeywords.length} matched).` });
    suggestions.push(`Weave more industry-specific terms like ${missingKeywords.slice(0, 4).join(', ')} into your experience bullets.`);
  } else if (keywordMatchRatio < 0.6) {
    issues.push({ type: 'warning', message: `Moderate keyword match (${matchedKeywords.length} of ${category.keywords.length}).` });
    suggestions.push(`Consider adding keywords like ${missingKeywords.slice(0, 3).join(', ')} to boost alignment.`);
  } else {
    issues.push({ type: 'success', message: `Strong keyword match! Covered ${matchedKeywords.length} core competencies.` });
  }

  // 3. FORMATTING & DENSITY ANALYSIS (Max 20 points)
  // Optimal resume length: 300 - 800 words
  if (wordCount === 0) {
    formattingScore = 0;
    issues.push({ type: 'error', message: 'Resume text is empty.' });
  } else if (wordCount < 200) {
    formattingScore = 8;
    issues.push({ type: 'warning', message: 'Resume is too short (less than 200 words).' });
    suggestions.push('Expand your experience and project details to show depth. Try to aim for at least 350-500 words.');
  } else if (wordCount > 1000) {
    formattingScore = 12;
    issues.push({ type: 'warning', message: 'Resume is very long (over 1000 words).' });
    suggestions.push('Condense your bullet points. Keep it punchy, preferably keeping it within 1-2 pages.');
  } else {
    formattingScore = 20;
    issues.push({ type: 'success', message: `Perfect length! Word count (${wordCount}) fits the sweet spot.` });
  }

  // 4. IMPACT & ACTION VERBS (Max 20 points)
  // Check action verbs density
  const foundActionVerbs = [];
  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(text)) {
      foundActionVerbs.push(verb);
    }
  });

  const foundWeakPhrases = [];
  WEAK_PHRASES.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    if (regex.test(text)) {
      foundWeakPhrases.push(phrase);
    }
  });

  // Check metrics (presence of numbers, percentages, dollar signs, e.g., "30%", "$10k", "5x")
  const metricsRegex = /\b\d+(?:%|\+|-|x|k|m)?\b/g;
  const metricsMatches = text.match(metricsRegex) || [];
  // Filter out standalone years like 2021, 2022
  const actualMetrics = metricsMatches.filter(m => {
    const val = parseInt(m);
    return !(val >= 1990 && val <= 2030); // Not a standard year
  });
  const hasMetrics = actualMetrics.length > 0;

  // Score calculation
  // Up to 10 points for Action Verbs (2 points per unique action verb, max 10)
  const verbPoints = Math.min(foundActionVerbs.length * 2, 10);
  // Up to 10 points for Metrics (5 points if metrics present, up to 10 points if 3+ metrics matches)
  const metricPoints = Math.min(actualMetrics.length * 3.5, 10);
  
  impactScore = Math.round(verbPoints + metricPoints);

  if (foundActionVerbs.length < 3) {
    issues.push({ type: 'warning', message: 'Few strong action verbs detected.' });
    suggestions.push('Begin resume bullets with powerful verbs (e.g., "Engineered", "Orchestrated", "Spearheaded") instead of "responsible for".');
  } else {
    issues.push({ type: 'success', message: `Great use of action verbs (${foundActionVerbs.length} unique verbs found).` });
  }

  if (!hasMetrics) {
    issues.push({ type: 'warning', message: 'No clear metrics or quantifiable results found.' });
    suggestions.push('Add metrics, percentages, or dollar values (e.g., "improved load times by 20%", "reduced bounce rates") to prove your impact.');
  } else {
    issues.push({ type: 'success', message: `Quantified impact found! Detected ${actualMetrics.length} metrics/numerical stats.` });
  }

  if (foundWeakPhrases.length > 0) {
    issues.push({ type: 'warning', message: `Passive/weak language detected ("${foundWeakPhrases.slice(0, 2).join('", "')}").` });
    suggestions.push('Replace passive words like "helped" or "assisted" with strong action verbs to project authority.');
  }

  // 5. CONTACT & ONLINE PRESENCE (Max 10 points)
  const contactDetails = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
    linkedin: /linkedin\.com\/in\/[a-zA-Z0-9-_]+/i.test(text),
    github: /github\.com\/[a-zA-Z0-9-_]+/i.test(text)
  };

  if (contactDetails.email) contactScore += 3;
  if (contactDetails.phone) contactScore += 3;
  if (contactDetails.linkedin) contactScore += 2;
  if (contactDetails.github) contactScore += 2;

  if (!contactDetails.email) {
    issues.push({ type: 'error', message: 'Missing email address.' });
    suggestions.push('Ensure your email address is clearly visible at the top of your resume.');
  }
  if (!contactDetails.phone) {
    issues.push({ type: 'warning', message: 'Missing phone number.' });
    suggestions.push('Provide a contact phone number so hiring managers can easily reach you.');
  }
  if (!contactDetails.linkedin) {
    issues.push({ type: 'warning', message: 'LinkedIn URL not detected.' });
    suggestions.push('Include your LinkedIn profile link to showcase your professional network.');
  }
  if (categoryKey === 'web_developer' || categoryKey === 'fresher_developer') {
    if (!contactDetails.github) {
      issues.push({ type: 'warning', message: 'GitHub URL not detected.' });
      suggestions.push('For developer roles, linking your GitHub profile is critical to showcase your code portfolio.');
    }
  }

  if (contactDetails.email && contactDetails.phone && contactDetails.linkedin) {
    issues.push({ type: 'success', message: 'Contact details and professional social presence look solid.' });
  }

  // Total Score Sum (weighted)
  const total = Math.min(structureScore + keywordScore + formattingScore + impactScore + contactScore, 100);

  return {
    total,
    breakdown: {
      structure: Math.round((structureScore / 20) * 100),
      keywords: Math.round((keywordScore / 30) * 100),
      formatting: Math.round((formattingScore / 20) * 100),
      impactVerbs: Math.round((impactScore / 20) * 100),
      contact: Math.round((contactScore / 10) * 100)
    },
    issues: issues.sort((a, b) => {
      // Sort issues: errors first, then warnings, then successes
      const severity = { error: 0, warning: 1, success: 2 };
      return severity[a.type] - severity[b.type];
    }),
    suggestions,
    matchedKeywords,
    missingKeywords,
    wordCount,
    hasMetrics,
    details: {
      sections: sectionsFound,
      contactDetails,
      foundActionVerbs,
      foundWeakPhrases,
      actualMetrics
    }
  };
};
