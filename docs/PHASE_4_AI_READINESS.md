# JobPortal 2.0 — Phase 4: AI Career Copilot Readiness & Future Integration Architecture

**Status:** Architecture Specification  
**Version:** 2.0.0  
**Target:** AI Enhancement Layer & LLM Adapter Architecture  
**Core Philosophy:** *Deterministic Core First $\rightarrow$ Pluggable AI Enhancement $\rightarrow$ Explainable User Control*  

---

## 1. Architectural Philosophy & Zero-Hallucination Guarantee

Modern AI features are most valuable when grounded in deterministic data integrity rather than unbounded generative guesses.

In JobPortal 2.0:
1. **The Deterministic Foundation is Autonomous**: The platform calculates ATS scores, skill matches, profile completion percentages, and gap analyses with 100% mathematical precision using explicit rules, even if AI services are completely disabled.
2. **AI Functions as an Enhancement Layer**: When enabled, AI models act as intelligent assistants (rephrasing resume bullets, identifying subtle semantic skill overlaps, generating customized interview prep questions).
3. **No Silent Data Mutation**: AI never modifies candidate profiles or resumes autonomously. All AI outputs are presented as suggestions that require explicit candidate review and approval before being saved.
4. **Zero Vendor Lock-In**: The AI layer communicates via a clean provider-agnostic interface, allowing interchangeable use of OpenAI, Google Gemini, Anthropic Claude, or self-hosted Ollama models.

---

## 2. Pluggable AI Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    CANDIDATE WORKSTATION UI                                        |
|                                                                                                    |
|  [Bullet Enhancer Modal]    [Cover Letter Assistant]    [Interview Prep Coach]    [Skill Matcher]  |
+---------------------------------------------------+------------------------------------------------+
                                                    | REST API Request
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                   BACKEND APPLICATION LAYER                                        |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | Base Deterministic Engine (Resume Rules, Skill Lexicon, Match Scoring Formulas)                | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                    | (Optional AI Hook)                            |
|                                                    v                                               |
|  +-----------------------------------------------------------------------------------------------+ |
|  | AI Copilot Adapter Layer (`server/services/ai/aiService.js`)                                  | |
|  | - Prompt Sanitization & Context Builder                                                      | |
|  | - Output Schema Validator (Zod / JSON Schema)                                                | |
|  | - Rate Limiter & Token Cost Controller                                                        | |
|  +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------+------------------------------------------------+
                                                    | Standardized LLM Interface
                                                    v
+----------------------------------------------------------------------------------------------------+
|                                   EXTERNAL / SELF-HOSTED LLM PROVIDER                             |
|                                                                                                    |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  | Google Gemini Flash |  | OpenAI GPT-4o-mini  |  | Anthropic Claude    |  | Local Ollama / vLLM| |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Provider-Agnostic Interface Definition

### 3.1 AI Provider Contract (`server/services/ai/LLMProvider.js`)
```javascript
/**
 * Abstract Base Provider for AI Copilot
 */
class LLMProvider {
  async generateCompletion(prompt, options = {}) {
    throw new Error("generateCompletion must be implemented by provider");
  }

  async generateStructuredJSON(prompt, jsonSchema, options = {}) {
    throw new Error("generateStructuredJSON must be implemented by provider");
  }
}

module.exports = LLMProvider;
```

### 3.2 Service Implementation Pattern (`server/services/ai/aiService.js`)
```javascript
const GeminiProvider = require("./providers/geminiProvider");
const OpenAIProvider = require("./providers/openAIProvider");

class AICopilotService {
  constructor() {
    this.enabled = process.env.ENABLE_AI_COPILOT === "true";
    this.provider = this.initializeProvider();
  }

  initializeProvider() {
    if (!this.enabled) return null;
    const providerType = process.env.AI_PROVIDER || "gemini";
    
    switch (providerType) {
      case "gemini":
        return new GeminiProvider(process.env.GEMINI_API_KEY);
      case "openai":
        return new OpenAIProvider(process.env.OPENAI_API_KEY);
      default:
        return null;
    }
  }

  /**
   * Enhances a candidate resume bullet point using STAR framework
   */
  async enhanceResumeBullet(bulletText, targetRole = "Software Engineer") {
    if (!this.enabled || !this.provider) {
      return {
        enhanced: bulletText,
        source: "deterministic_fallback",
        note: "AI service is not configured. Original text retained."
      };
    }

    const prompt = `
      You are an expert tech recruiter and ATS resume specialist.
      Transform the following resume bullet point into a high-impact, STAR-framework statement for a ${targetRole}.
      Rules:
      1. Start with a powerful action verb (e.g., Engineered, Architected, Spearheaded, Optimized).
      2. Keep the facts accurate without fabricating achievements or metrics.
      3. Maximize clarity and ATS keyword relevance.
      
      Original Bullet: "${bulletText}"
      
      Return JSON: { "enhanced": "...", "actionVerbUsed": "...", "tip": "..." }
    `;

    return await this.provider.generateStructuredJSON(prompt);
  }
}

module.exports = new AICopilotService();
```

---

## 4. Future AI Capabilities & Roadmap

1. **AI Resume Bullet Optimizer (STAR Framework)**:
   - Takes basic text (e.g., *"Worked on payment gateway"*) and transforms it into an impactful ATS statement (*"Engineered and integrated Razorpay webhook payment processing, reducing transaction latency by 35% across 50k+ daily checkouts"*).
2. **AI Contextual Cover Letter Generator**:
   - Synthesizes candidate's actual `CandidateProfile` experience with the target `Job` requirements to produce a 3-paragraph tailored cover letter draft.
3. **AI Mock Interview Coach**:
   - Analyzes target job description and generates role-specific behavioral (STAR) and technical questions with sample evaluation criteria.
4. **Semantic Skill Matching & Synonym Resolution**:
   - Maps related technologies (e.g., recognizing that proficiency in `MERN` inherently includes `React`, `Express`, `MongoDB`, `Node.js`).

---

## 5. Security, Privacy & Data Compliance

- **Zero Training on User Data**: API calls must explicitly configure `zero-data-retention` flags where available.
- **PII Redaction**: Email addresses, phone numbers, and home addresses are stripped from prompts before transmission to third-party LLM providers.
- **Graceful Degradation**: If an AI request times out (>3 seconds) or fails, the frontend receives a clean fallback response without disrupting the user flow.
