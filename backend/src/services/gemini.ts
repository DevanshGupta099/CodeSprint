/**
 * Autonomous AI Intelligence Engine — Gemini 1.5 Structured Output Service
 * Features zero-latency deterministic fallback for 100% demo uptime
 */

export interface LLMRiskAssessment {
  probability: number;
  severity: number;
  confidence: number;
  sdgImpact: string;
  rationale: string;
}

export interface LLMMitigationInsight {
  complianceRationale: string;
  executiveSummary: string;
  sdgAnchors: string[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Calls Google Gemini structured JSON mode with timeout and automatic fallback fixture
 */
async function callGeminiStructured<T>(prompt: string, fallbackFixture: T): Promise<T> {
  if (!GEMINI_API_KEY) {
    return fallbackFixture;
  }

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3500), // 3.5s timeout for demo responsiveness
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      console.warn(`[GEMINI_AGENT] API returned ${res.status}, using deterministic fallback.`);
      return fallbackFixture;
    }

    const data: any = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return fallbackFixture;
    }

    return JSON.parse(candidateText) as T;
  } catch (err: any) {
    console.warn(`[GEMINI_AGENT] Network/quota fallback: ${err.message}`);
    return fallbackFixture;
  }
}

/**
 * Autonomous Disruption Intelligence Agent
 */
export async function assessDisruptionWithAI(
  supplierName: string,
  country: string,
  materialCategory: string,
  disruptionSummary: string,
  fallback: LLMRiskAssessment
): Promise<LLMRiskAssessment> {
  const prompt = `
You are VeritasSupply Disruption Intelligence Agent. Analyze the following supply chain hazard:
- Target Supplier: ${supplierName} (${country})
- Material / Commodity: ${materialCategory}
- Event Brief: "${disruptionSummary}"

Assess probability, severity, and compliance impact under UN Sustainable Development Goals (SDG 8: Decent Work / Forced Labor, SDG 12: Responsible Production / Avoided Carbon).
Return a JSON object conforming to:
{
  "probability": <float 0.0-1.0>,
  "severity": <float 0.0-1.0>,
  "confidence": <float 0.0-1.0>,
  "sdgImpact": <string>,
  "rationale": <string brief technical executive statement>
}
`;

  return callGeminiStructured<LLMRiskAssessment>(prompt, fallback);
}

/**
 * Autonomous Mitigation Directive Agent
 */
export async function generateMitigationWithAI(
  disruptedName: string,
  disruptedCountry: string,
  materialCategory: string,
  alternateName: string,
  priceVariancePct: number,
  leadTimeDeltaDays: number,
  avoidedScope3Tco2e: number,
  fallback: LLMMitigationInsight
): Promise<LLMMitigationInsight> {
  const prompt = `
You are VeritasSentinel Autonomous Procurement Engine. Generate an executive mitigation directive memo:
- Disrupted Supplier: ${disruptedName} (${disruptedCountry})
- Critical Component: ${materialCategory}
- Recommended Compliant Alternate: ${alternateName}
- Price Variance: ${priceVariancePct}%
- Transit / Lead Time Delta: ${leadTimeDeltaDays} days
- Avoided Scope-3 Carbon: ${avoidedScope3Tco2e} tCO2e

Anchor your justification in UN SDG 8 (Decent Work, Maritime Labor Standards, Forced Labor Prevention) and SDG 12 (Responsible Production, Scope-3 Decarbonization).
Return a JSON object conforming to:
{
  "complianceRationale": <string paragraph detailing audited provenance and compliance standards>,
  "executiveSummary": <string terminal-style formatted executive memo directive>,
  "sdgAnchors": [<string>, <string>]
}
`;

  return callGeminiStructured<LLMMitigationInsight>(prompt, fallback);
}
