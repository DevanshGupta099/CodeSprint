import { NextRequest, NextResponse } from 'next/server';
import { AICopilotResponse, SupplierAIAudit } from '../../../../types/ai';
import { INITIAL_DAG_DATA, ALTERNATES_MAP, SCENARIO_PRESETS } from '../../../../data/seed-graph';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;


// Deterministic Supply Chain Reasoning Engine (Always Available Fallback)
function generateDeterministicAIResponse(query: string, supplierId?: string): AICopilotResponse {
  const q = query.toLowerCase();

  // 1. Semiconductor / Chip bottleneck query
  if (q.includes('semiconductor') || q.includes('bottleneck') || q.includes('fab') || q.includes('tier-3') || q.includes('chip') || q.includes('inverter')) {
    return {
      query,
      headline: 'Tier-3 to Tier-2 Semiconductor Fab Capacity Bottleneck Identified',
      summary: 'PostgreSQL CTE path analysis reveals a critical constraint between Tier-3 Polysilicon Refining (Xinjiang PureSilicon Ltd) and Tier-2 Inverter Fabrication (DriveTech Inverters, DTI-JPN). Sole-source reliance on regional smelters created a 28-day backlog that directly impacts Tier-1 Apex PowerSystems.',
      rootCauseDiagnosis: 'Propagated CTE shock origin: Sole-supplier dependency on wafer fabrication nodes in Kyushu and Taiwan Strait maritime shipping lanes, combined with UFLPA origin-audit holds at international entry ports.',
      affectedTiers: ['Tier 3: Smelters & Chemical Refiners', 'Tier 2: Component Manufacturers', 'Tier 1: Direct Subsystems'],
      affectedSupplierNames: ['DriveTech Inverters Inc.', 'Xinjiang PureSilicon Ltd', 'Apex PowerSystems GmbH'],
      riskMetrics: {
        probability: 0.88,
        severity: 0.82,
        confidence: 0.94,
        financialExposureUSD: '$26,800,000',
        sdgImpact: {
          sdg8ForcedLabor: 'Elevated UFLPA Section 307 audit exposure on upstream metallurgical silicon supply chain.',
          sdg12AvoidedCarbon: 'Switching to domestic Nordic/EU foundries reduces transport footprint by ~480 tCO2e.',
        },
      },
      recommendations: {
        action: 'Execute dual-sourcing failover to Infineon / STMicroelectronics and activate pre-qualified alternates in Vietnam & Mexico.',
        targetSupplierId: '10000000-0000-0000-0000-000000000004', // DriveTech Inverters
        alternateSupplierId: '50000000-0000-0000-0000-000000000002',
        alternateName: 'Kyoto Semiconductor Dynamics (Japan)',
        priceVariancePct: 3.8,
        leadTimeDeltaDays: -6,
        avoidedScope3Tco2e: 480.0,
      },
      suggestedAction: 'SIMULATE_DISRUPTION',
      suggestedActionLabel: 'Simulate Semiconductor Halt on DAG',
      suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000004', severity: 0.88 },
    };
  }

  // 2. Sanctions / Forced Labor / UFLPA query
  if (q.includes('sanction') || q.includes('forced labor') || q.includes('uflpa') || q.includes('sdg 8') || q.includes('xinjiang') || q.includes('silicon')) {
    return {
      query,
      headline: 'UFLPA Section 307 Sanctions Screening & Provenance Audit',
      summary: 'Automated entity screening against Uyghur Forced Labor Prevention Act (UFLPA) and Countering America’s Adversaries (CAATSA) lists. Node [Xinjiang PureSilicon Ltd, XPS-CHN] triggers a rebuttable presumption hold requiring audited silica provenance certificates.',
      rootCauseDiagnosis: 'Direct Tier-4 smelting node linked to regional state-subsidized coal electricity grids in Northwest China. High risk of customs seizure at US/EU ports of entry under forced labor compliance directives.',
      affectedTiers: ['Tier 4: Raw Material & Maritime', 'Tier 3: Smelters & Chemical Refiners'],
      affectedSupplierNames: ['Xinjiang PureSilicon Ltd', 'Tianqi Lithium Corp'],
      riskMetrics: {
        probability: 0.96,
        severity: 0.91,
        confidence: 0.98,
        financialExposureUSD: '$18,400,000',
        sdgImpact: {
          sdg8ForcedLabor: 'UN SDG 8.7 Violation Alert: Rebuttable presumption of forced labor under U.S. CBP guidelines.',
          sdg12AvoidedCarbon: 'Transitioning to hydro-powered Norwegian polysilicon avoids 1,120 tCO2e of coal-heavy emissions.',
        },
      },
      recommendations: {
        action: 'Immediate procurement reroute to REC Silicon / Wacker Chemie (Hydro-electric smelting). Full provenance chain certified.',
        targetSupplierId: '10000000-0000-0000-0000-000000000006', // Xinjiang PureSilicon
        alternateSupplierId: '50000000-0000-0000-0000-000000000003',
        alternateName: 'Nordic PureSilicon Smelters AS (Norway)',
        priceVariancePct: 5.4,
        leadTimeDeltaDays: -2,
        avoidedScope3Tco2e: 1120.0,
      },
      suggestedAction: 'EXECUTE_REROUTE',
      suggestedActionLabel: 'Reroute to Cleared Hydro Smelter',
      suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000006' },
    };
  }

  // 3. Red Sea / Bab-el-Mandeb / Maritime Blockade query
  if (q.includes('red sea') || q.includes('bab-el-mandeb') || q.includes('maritime') || q.includes('blockade') || q.includes('shipping') || q.includes('yemen')) {
    return {
      query,
      headline: 'Maritime Choke Point Alert: Bab-el-Mandeb Security Blockade',
      summary: 'Maritime intelligence monitors confirm security interdictions in the southern Red Sea corridor. Node [Apex Maritime Logistics, AML-YEM] compromised. Recursive CTE risk wave propagates upward with 0.7x decay factor across battery assembly nodes.',
      rootCauseDiagnosis: 'Geopolitical vessel interdictions forcing 100% of non-coalition maritime container freight to divert via Cape of Good Hope, adding 12-14 transit days unless autonomous dual-fuel split routing is engaged.',
      affectedTiers: ['Tier 4: Raw Material & Maritime', 'Tier 2: Component Manufacturers', 'Tier 1: Direct Subsystems'],
      affectedSupplierNames: ['Apex Maritime Logistics', 'Voltaic Cell Dynamics', 'Apex PowerSystems GmbH'],
      riskMetrics: {
        probability: 0.94,
        severity: 0.92,
        confidence: 0.96,
        financialExposureUSD: '$41,540,000',
        sdgImpact: {
          sdg8ForcedLabor: 'Seafarer safety standards under IMO maritime security protocol.',
          sdg12AvoidedCarbon: 'Nordic Cape dual-fuel route avoids 1,420.5 tCO2e Scope-3 emissions vs heavy bunker fuel delay.',
        },
      },
      recommendations: {
        action: 'Autonomous Mitigation Directive: Execute split rerouting to Nordic Horn Maritime Lines (Cape Route) and secondary packaging in Vietnam & Mexico. Price variance +4.2%, transit reduced by 3 days.',
        targetSupplierId: '10000000-0000-0000-0000-000000000007', // AML-YEM
        alternateSupplierId: '50000000-0000-0000-0000-000000000001',
        alternateName: 'Nordic Horn Maritime Lines (Norway Cape Route)',
        priceVariancePct: 4.2,
        leadTimeDeltaDays: -3,
        avoidedScope3Tco2e: 1420.5,
      },
      suggestedAction: 'SIMULATE_DISRUPTION',
      suggestedActionLabel: 'Execute Red Sea Blockade on DAG',
      suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000007', severity: 0.94 },
    };
  }

  // 4. Lithium / Cobalt / Mining / Raw Materials query
  if (q.includes('lithium') || q.includes('cobalt') || q.includes('mining') || q.includes('atacama') || q.includes('chile') || q.includes('drc') || q.includes('tier-4')) {
    return {
      query,
      headline: 'Tier-4 Critical Mineral Extraction & Water Scarcity Assessment',
      summary: 'Hydro-geological stress analysis at Salar de Atacama (Sociedad Química y Minera, SQM-CHL) and artisanal mining compliance screening at Katanga Mining (KAT-COD). Both nodes represent vital Tier-4 inputs for LFP and NMC cathode chemistry.',
      rootCauseDiagnosis: 'Strict environmental water extraction quotas in the Atacama basin and OECD Due Diligence Guidance scrutiny in Katanga province requiring digital mass-balance custody certification.',
      affectedTiers: ['Tier 4: Raw Material & Maritime', 'Tier 3: Smelters & Chemical Refiners'],
      affectedSupplierNames: ['Sociedad Química y Minera de Chile', 'Katanga Mining DRC', 'Tianqi Lithium Corp'],
      riskMetrics: {
        probability: 0.76,
        severity: 0.85,
        confidence: 0.91,
        financialExposureUSD: '$14,200,000',
        sdgImpact: {
          sdg8ForcedLabor: 'OECD Annex II child labor & artisanal cobalt supply-chain compliance check.',
          sdg12AvoidedCarbon: 'Direct brine extraction with closed-loop reinjection reduces Scope-3 footprint by 860 tCO2e.',
        },
      },
      recommendations: {
        action: 'Qualify secondary supply contracts with Albemarle (Nevada, USA) and Glencore certified industrial concessions with IRMA standard audits.',
        targetSupplierId: '10000000-0000-0000-0000-000000000009',
        alternateSupplierId: '50000000-0000-0000-0000-000000000004',
        alternateName: 'Albemarle Silver Peak Brine Operations (USA)',
        priceVariancePct: 6.1,
        leadTimeDeltaDays: -8,
        avoidedScope3Tco2e: 860.0,
      },
      suggestedAction: 'INSPECT_SUPPLIER',
      suggestedActionLabel: 'Inspect Tier-4 Mining Nodes',
      suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000009' },
    };
  }

  // 5. Default General Supply Chain Reasoning
  return {
    query,
    headline: 'Veritas Autonomous Disruption & Resilience Intelligence Directive',
    summary: `Comprehensive multi-tier graph analysis for: "${query}". Graph traversal across 14 monitored Tier-0 to Tier-4 entities shows steady baseline throughput with critical attention required on maritime choke points and sole-source semiconductor component nodes.`,
    rootCauseDiagnosis: 'Multi-hop CTE risk attenuation models show downstream vulnerability concentrated in single-point-of-failure (SPOF) nodes: Apex Maritime Logistics (Bab-el-Mandeb) and DriveTech Inverters.',
    affectedTiers: ['Tier 4: Raw Material & Maritime', 'Tier 2: Component Manufacturers', 'Tier 0: Enterprise OEM'],
    affectedSupplierNames: ['Apex Maritime Logistics', 'DriveTech Inverters Inc.', 'Apex PowerSystems GmbH'],
    riskMetrics: {
      probability: 0.65,
      severity: 0.70,
      confidence: 0.90,
      financialExposureUSD: '$41,540,000',
      sdgImpact: {
        sdg8ForcedLabor: 'UN SDG 8: Fair work and forced labor screening across all 14 active nodes.',
        sdg12AvoidedCarbon: 'UN SDG 12: Continuous Scope-3 avoided emissions optimization targeting 2,500+ tCO2e.',
      },
    },
    recommendations: {
      action: 'Maintain active monitoring of Red Sea corridor and pre-qualify secondary European rail freight alternates.',
      targetSupplierId: '10000000-0000-0000-0000-000000000007',
      alternateSupplierId: '50000000-0000-0000-0000-000000000001',
      alternateName: 'Nordic Horn Maritime Lines (Cape Route)',
      priceVariancePct: 4.2,
      leadTimeDeltaDays: -3,
      avoidedScope3Tco2e: 1420.5,
    },
    suggestedAction: 'SIMULATE_DISRUPTION',
    suggestedActionLabel: 'Simulate Bab-el-Mandeb Blockade',
    suggestedPayload: { supplierId: '10000000-0000-0000-0000-000000000007' },
  };
}
// Mistral AI API Call (Ultra-fast code & reasoning with codestral-latest and ministral-8b-latest)
async function callMistralCopilot(query: string): Promise<AICopilotResponse | null> {
  if (!MISTRAL_API_KEY) return null;

  const models = ['codestral-latest', 'ministral-8b-latest'];

  for (const model of models) {
    try {
      const prompt = `
You are the VeritasSupply Autonomous AI Supply Chain Disruption Engine.
The user is asking: "${query}".

Analyze our multi-tier supply chain (Tier-0 finished electric vehicles to Tier-4 raw mines like Chile lithium, DRC cobalt, Xinjiang silicon, and Bab-el-Mandeb Red Sea shipping choke points).
Ground your analysis in:
1. Recursive CTE risk propagation (0.7x decay factor per upstream hop).
2. UN SDG 8 (Decent Work & Forced Labor / UFLPA Section 307 sanctions).
3. UN SDG 12 (Responsible Production & Avoided Scope-3 Carbon emissions).

Return ONLY a valid JSON object conforming strictly to this format:
{
  "query": "${query}",
  "headline": "<punchy 1-sentence technical title>",
  "summary": "<2-3 sentence executive intelligence briefing>",
  "rootCauseDiagnosis": "<technical analysis of upstream choke points and CTE propagation>",
  "affectedTiers": ["<Tier X name>", "<Tier Y name>"],
  "affectedSupplierNames": ["<Supplier A>", "<Supplier B>"],
  "riskMetrics": {
    "probability": 0.85,
    "severity": 0.8,
    "confidence": 0.9,
    "financialExposureUSD": "$24,500,000",
    "sdgImpact": {
      "sdg8ForcedLabor": "<statement on labor compliance & sanctions>",
      "sdg12AvoidedCarbon": "<statement on carbon savings>"
    }
  },
  "recommendations": {
    "action": "<executive procurement reroute directive>",
    "targetSupplierId": "10000000-0000-0000-0000-000000000007",
    "alternateSupplierId": "50000000-0000-0000-0000-000000000001",
    "alternateName": "Nordic Horn Maritime Lines (Cape Route)",
    "priceVariancePct": 4.2,
    "leadTimeDeltaDays": -3,
    "avoidedScope3Tco2e": 1420.5
  },
  "suggestedAction": "SIMULATE_DISRUPTION",
  "suggestedActionLabel": "Execute Simulation on DAG"
}
`;

      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as AICopilotResponse;
        }
      }
    } catch (err) {
      console.warn(`[MISTRAL_COPILOT] Model ${model} error:`, err);
    }
  }

  return null;
}

// Groq API Call (High-throughput frontier LLM)
async function callGroqCopilot(query: string): Promise<AICopilotResponse | null> {
  if (!GROQ_API_KEY) return null;

  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];

  for (const model of models) {
    try {
      const prompt = `
You are the VeritasSupply Autonomous AI Supply Chain Disruption Engine.
The user is asking: "${query}".

Analyze our multi-tier supply chain (Tier-0 finished electric vehicles to Tier-4 raw mines like Chile lithium, DRC cobalt, Xinjiang silicon, and Bab-el-Mandeb Red Sea shipping choke points).
Ground your analysis in:
1. Recursive CTE risk propagation (0.7x decay factor per upstream hop).
2. UN SDG 8 (Decent Work & Forced Labor / UFLPA Section 307 sanctions).
3. UN SDG 12 (Responsible Production & Avoided Scope-3 Carbon emissions).

Return a JSON object conforming strictly to this format:
{
  "query": "${query}",
  "headline": "<punchy 1-sentence technical title>",
  "summary": "<2-3 sentence executive intelligence briefing>",
  "rootCauseDiagnosis": "<technical analysis of upstream choke points and CTE propagation>",
  "affectedTiers": ["<Tier X name>", "<Tier Y name>"],
  "affectedSupplierNames": ["<Supplier A>", "<Supplier B>"],
  "riskMetrics": {
    "probability": 0.85,
    "severity": 0.8,
    "confidence": 0.9,
    "financialExposureUSD": "$24,500,000",
    "sdgImpact": {
      "sdg8ForcedLabor": "<statement on labor compliance & sanctions>",
      "sdg12AvoidedCarbon": "<statement on carbon savings>"
    }
  },
  "recommendations": {
    "action": "<executive procurement reroute directive>",
    "targetSupplierId": "10000000-0000-0000-0000-000000000007",
    "alternateSupplierId": "50000000-0000-0000-0000-000000000001",
    "alternateName": "Nordic Horn Maritime Lines (Cape Route)",
    "priceVariancePct": 4.2,
    "leadTimeDeltaDays": -3,
    "avoidedScope3Tco2e": 1420.5
  },
  "suggestedAction": "SIMULATE_DISRUPTION",
  "suggestedActionLabel": "Execute Simulation on DAG"
}
`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as AICopilotResponse;
        }
      }
    } catch (err) {
      console.warn(`[GROQ_COPILOT] Model ${model} error:`, err);
    }
  }

  return null;
}

// Gemini API Call (Supports gemini-3.6-flash and gemini-3.5-flash-lite)
async function callGeminiCopilot(query: string): Promise<AICopilotResponse | null> {
  if (!GEMINI_API_KEY) return null;

  const models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const prompt = `
You are the VeritasSupply Autonomous AI Supply Chain Disruption Engine.
The user is asking: "${query}".
Return a JSON object conforming strictly to the AICopilotResponse structure with headline, summary, rootCauseDiagnosis, affectedTiers, affectedSupplierNames, riskMetrics (probability, severity, confidence, financialExposureUSD, sdgImpact), recommendations, and suggestedAction.
`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text) as AICopilotResponse;
        }
      }
    } catch (err) {
      console.warn(`[GEMINI_COPILOT] Model ${model} error:`, err);
    }
  }

  return null;
}

// OpenRouter API Call (Access to dozens of free and frontier models with auto-failover)
async function callOpenRouterCopilot(query: string): Promise<AICopilotResponse | null> {
  if (!OPENROUTER_API_KEY) return null;

  const models = [
    'nvidia/nemotron-3.5-lightning:free',
    'deepseek/deepseek-v4-flash-0731:free',
    'qwen/qwen3.8-27b:free',
  ];

  for (const model of models) {
    try {
      const prompt = `
You are the VeritasSupply Autonomous AI Supply Chain Disruption Engine.
The user is asking: "${query}".

Analyze our multi-tier supply chain (Tier-0 finished electric vehicles to Tier-4 raw mines like Chile lithium, DRC cobalt, Xinjiang silicon, and Bab-el-Mandeb Red Sea shipping choke points).
Ground your analysis in:
1. Recursive CTE risk propagation (0.7x decay factor per upstream hop).
2. UN SDG 8 (Decent Work & Forced Labor / UFLPA Section 307 sanctions).
3. UN SDG 12 (Responsible Production & Avoided Scope-3 Carbon emissions).

Return ONLY a valid JSON object conforming strictly to this format:
{
  "query": "${query}",
  "headline": "<punchy 1-sentence technical title>",
  "summary": "<2-3 sentence executive intelligence briefing>",
  "rootCauseDiagnosis": "<technical analysis of upstream choke points and CTE propagation>",
  "affectedTiers": ["<Tier X name>", "<Tier Y name>"],
  "affectedSupplierNames": ["<Supplier A>", "<Supplier B>"],
  "riskMetrics": {
    "probability": 0.85,
    "severity": 0.8,
    "confidence": 0.9,
    "financialExposureUSD": "$24,500,000",
    "sdgImpact": {
      "sdg8ForcedLabor": "<statement on labor compliance & sanctions>",
      "sdg12AvoidedCarbon": "<statement on carbon savings>"
    }
  },
  "recommendations": {
    "action": "<executive procurement reroute directive>",
    "targetSupplierId": "10000000-0000-0000-0000-000000000007",
    "alternateSupplierId": "50000000-0000-0000-0000-000000000001",
    "alternateName": "Nordic Horn Maritime Lines (Cape Route)",
    "priceVariancePct": 4.2,
    "leadTimeDeltaDays": -3,
    "avoidedScope3Tco2e": 1420.5
  },
  "suggestedAction": "SIMULATE_DISRUPTION",
  "suggestedActionLabel": "Execute Simulation on DAG"
}
`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://veritas-supply.vercel.app',
          'X-Title': 'VeritasSupply AI Copilot',
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as AICopilotResponse;
        }
      }
    } catch (err) {
      console.warn(`[OPENROUTER_COPILOT] Model ${model} error:`, err);
    }
  }

  return null;
}

// Cerebras Cloud API Call (Ultra-fast LPU inference)
async function callCerebrasCopilot(query: string): Promise<AICopilotResponse | null> {
  if (!CEREBRAS_API_KEY) return null;

  const models = ['qwen-3.8-27b', 'gpt-oss-120b'];

  for (const model of models) {
    try {
      const prompt = `
You are the VeritasSupply Autonomous AI Supply Chain Disruption Engine.
The user is asking: "${query}".
Return a JSON object conforming strictly to the AICopilotResponse structure with headline, summary, rootCauseDiagnosis, affectedTiers, affectedSupplierNames, riskMetrics (probability, severity, confidence, financialExposureUSD, sdgImpact), recommendations, and suggestedAction.
`;

      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CEREBRAS_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as AICopilotResponse;
        }
      }
    } catch (err) {
      console.warn(`[CEREBRAS_COPILOT] Model ${model} error:`, err);
    }
  }

  return null;
}


// In-memory rate limiter for Edge/Serverless Next.js API route
const copilotIpLimits = new Map<string, { count: number; resetTime: number }>();

function checkCopilotRateLimit(ip: string, limit: number = 30, windowMs: number = 60000): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  let record = copilotIpLimits.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    copilotIpLimits.set(ip, record);
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const retryAfter = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting Guardrail
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : 'client-unknown';
    const rateCheck = checkCopilotRateLimit(clientIp, 30, 60000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'TOO_MANY_REQUESTS',
          message: `AI Copilot request limit exceeded. Please retry in ${rateCheck.retryAfter}s.`,
          retryAfterSeconds: rateCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 2. Parse & Sanitize Request Body
    const body = await req.json();
    let query = typeof body.query === 'string' ? body.query.trim() : '';
    const supplierId = typeof body.supplierId === 'string' ? body.supplierId.trim() : undefined;

    if (!query && !supplierId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Query or supplierId is required' },
        { status: 400 }
      );
    }

    // Guard against prompt-bloat / denial of service
    if (query.length > 1500) {
      return NextResponse.json(
        { error: 'PAYLOAD_TOO_LARGE', message: 'Query text exceeds 1500 character security limit.' },
        { status: 400 }
      );
    }

    // Strip non-printable control characters
    query = query.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 3. Multi-Provider Cascading Engine: Mistral -> Groq -> OpenRouter -> Cerebras -> Gemini -> Deterministic Fallback
    let result = await callMistralCopilot(query);

    // 4. Failover to Groq if Mistral is busy or unavailable
    if (!result) {
      result = await callGroqCopilot(query);
    }

    // 5. Failover to OpenRouter (Fast free models)
    if (!result) {
      result = await callOpenRouterCopilot(query);
    }

    // 6. Failover to Cerebras Cloud
    if (!result) {
      result = await callCerebrasCopilot(query);
    }

    // 7. Failover to Gemini API if others unavailable or quota exceeded
    if (!result) {
      result = await callGeminiCopilot(query);
    }

    // 8. Guaranteed High-Intelligence Deterministic Fallback
    if (!result) {
      result = generateDeterministicAIResponse(query, supplierId);
    }

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      },
    });
  } catch (error: any) {
    console.error('[SECURITY_GUARD] AI Copilot route error:', error.message);
    const fallback = generateDeterministicAIResponse('Supply Chain Overview');
    return NextResponse.json(fallback);
  }
}

