/**
 * Calls the Google Gemini API to analyze a resume and returns a structured JSON report.
 * Uses Gemini 1.5 Flash with structured JSON output.
 * 
 * @param {string} text - The resume plain text.
 * @param {string} categoryLabel - The target career category label.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<object>} The parsed JSON analysis result.
 */
export const analyzeResumeWithGemini = async (text, categoryLabel, apiKey) => {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a world-class Applicant Tracking System (ATS) evaluator and professional resume writer.
Analyze the following resume text against the target job category: "${categoryLabel}".

Provide a comprehensive, objective scoring and review.
You must return your response as a valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks.

JSON Structure:
{
  "total": 75, // Integer from 0 to 100 representing the overall ATS score
  "breakdown": {
    "structure": 80, // Integer 0 to 100 for section layout and titles completeness
    "keywords": 60, // Integer 0 to 100 for core industry keywords matching
    "formatting": 90, // Integer 0 to 100 for word count density and formatting checks
    "impactVerbs": 70, // Integer 0 to 100 for action verb usage and metrics presence
    "contact": 80 // Integer 0 to 100 for social/contact details coverage
  },
  "issues": [
    { "type": "error", "message": "Explain critical structural or contact issues (e.g. missing work experience)." },
    { "type": "warning", "message": "Explain minor keyword deficits or weak verbs (e.g. no action verbs used in bullets)." },
    { "type": "success", "message": "List items done exceptionally well." }
  ],
  "suggestions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "matchedKeywords": ["react", "git"], // Array of matched keywords found in resume text (lowercase)
  "missingKeywords": ["docker", "typescript"], // Array of important missing keywords for this target role (lowercase)
  "wordCount": 450, // Calculated word count of the input text
  "hasMetrics": true // Boolean check if quantitative metrics (%, numbers, currency) were used to demonstrate impact
}

Analyze spelling/grammar, look for weak phrases like "responsible for" or "helped", assess if metrics are used, check if contact detail elements (email, phone, LinkedIn, GitHub) exist, and verify section presence.

Resume Text:
${text}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API_RATE_LIMIT');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP_ERROR_${response.status}`);
  }

  const resultData = await response.json();
  const textResponse = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('API_EMPTY_RESPONSE');
  }

  // Parse candidate response
  try {
    return JSON.parse(textResponse.trim());
  } catch (parseError) {
    throw new Error('API_JSON_PARSE_ERROR');
  }
};
