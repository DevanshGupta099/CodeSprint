import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { query } from './db/index.js';
import { 
  getSupplyChainDAG, 
  getRiskState, 
  getAlternatesForSupplier, 
  resetRiskState, 
  getSPOFAnalytics,
  executeReroute,
  getPortfolioAnalytics 
} from './db/queries.js';
import { triggerDisruptionSentinel, TriggerDisruptionRequestSchema } from './services/sentinel.js';
import { generateMitigationMemo } from './services/mitigation.js';
import { parseBOMCSV, parseBOMFile, ingestBOMItems } from './services/ingestion.js';
import { getScenarioCatalog, simulateScenario, getAvailableBOMPresets, loadBOMPreset } from './services/scenarios.js';
import { getLiveDisruptionBulletin } from './services/gemini.js';
import { validateUUIDParam, validateBody } from './middleware/validate.js';
import {
  generalRateLimiter,
  sensitiveEndpointLimiter,
  hardenedSecurityHeaders,
  validateSafeIdentifier,
  getCorsOptions,
} from './middleware/security.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security: Disable X-Powered-By
app.disable('x-powered-by');

// Security: Trust first proxy (Render, Cloudflare, Vercel) for accurate client IP rate limiting
app.set('trust proxy', 1);

// Security: Apply hardened CORS configuration
app.use(cors(getCorsOptions()));

// Security: Apply OWASP security headers globally
app.use(hardenedSecurityHeaders);

// Security: Global rate limiter for API endpoints (120 req / min)
app.use('/api', generalRateLimiter);

// Security: Enforce upload size limits (10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Security: Enforce JSON body size limit (1MB)
app.use(express.json({ limit: '1mb' }));

const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';


// 1. Healthcheck & DB Status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbCheck = await query('SELECT NOW() AS current_time');
    res.json({
      status: 'ONLINE',
      service: 'VeritasSupply Autonomous Tier-N Intel Engine',
      database: 'CONNECTED',
      timestamp: dbCheck.rows[0].current_time,
      defaultOrgId: DEFAULT_ORG_ID,
      version: '1.0.0',
    });
  } catch (error: any) {
    res.status(500).json({ status: 'DEGRADED', database: 'DISCONNECTED', error: 'Database connection failed' });
  }
});

// 2. Supply Chain DAG (React Flow Payload)
app.get(
  '/api/supply-chain/:orgId?',
  validateUUIDParam('orgId', false),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId || DEFAULT_ORG_ID;
      const dag = await getSupplyChainDAG(orgId);
      res.json(dag);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 3. Polled Risk State (Nodes + Metrics)
app.get(
  '/api/risk-state/:orgId?',
  validateUUIDParam('orgId', false),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId || DEFAULT_ORG_ID;
      const riskState = await getRiskState(orgId);
      res.json(riskState);
    } catch (error: any) {
      next(error);
    }
  }
);

// 4. Trigger Disruption Simulation (Disruption Sentinel)
app.post(
  '/api/disruption/trigger',
  sensitiveEndpointLimiter,
  validateBody(TriggerDisruptionRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await triggerDisruptionSentinel(req.body);
      res.json(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 5. Reset Risk State (For Live Demo Replay)
app.post(
  '/api/disruption/reset/:orgId?',
  sensitiveEndpointLimiter,
  validateUUIDParam('orgId', false),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId || DEFAULT_ORG_ID;
      await resetRiskState(orgId);
      res.json({ message: '[SYS_RESET] Supply chain returned to NOMINAL state.' });
    } catch (error: any) {
      next(error);
    }
  }
);

// 6. Execute Autonomous Reroute (Closed-loop mitigation)
app.post(
  '/api/mitigation/execute',
  sensitiveEndpointLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memoId = req.body.memoId;
      if (!memoId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memoId)) {
        return res.status(400).json({ error: 'INVALID_PARAMETER', message: 'Valid UUID memoId is required' });
      }
      const result = await executeReroute(memoId);
      res.json(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

app.post(
  '/api/mitigation/:memoId/execute',
  sensitiveEndpointLimiter,
  validateUUIDParam('memoId', true),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { memoId } = req.params;
      const result = await executeReroute(memoId);
      res.json(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 6b. Generate Autonomous Procurement Switch Memo
app.post(
  '/api/mitigation/:supplierId',
  sensitiveEndpointLimiter,
  validateUUIDParam('supplierId', true),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;
      const memo = await generateMitigationMemo(supplierId);
      res.json(memo);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 6c. Multi-Scenario Disruption Catalog
app.get('/api/disruption/scenarios', (req: Request, res: Response) => {
  res.json({ scenarios: getScenarioCatalog() });
});

// 6d. Simulate Named Preset Scenario
app.post(
  '/api/disruption/simulate/:scenarioKey',
  sensitiveEndpointLimiter,
  validateSafeIdentifier('scenarioKey'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scenarioKey } = req.params;
      const result = await simulateScenario(scenarioKey);
      res.json(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);


// 7. Get Candidate Alternates for a Disrupted Node
app.get(
  '/api/alternates/:supplierId',
  validateUUIDParam('supplierId', true),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.params;
      const alternates = await getAlternatesForSupplier(supplierId);
      res.json({ supplierId, alternates });
    } catch (error: any) {
      next(error);
    }
  }
);

// 7b. Graph SPOF Hazard & Bottleneck Analytics
app.get(
  '/api/analytics/spofs/:orgId?',
  validateUUIDParam('orgId', false),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId || DEFAULT_ORG_ID;
      const analytics = await getSPOFAnalytics(orgId);
      res.json(analytics);
    } catch (error: any) {
      next(error);
    }
  }
);

// 7c. Recharts Portfolio Breakdown Analytics
app.get(
  '/api/analytics/portfolio-breakdown/:orgId?',
  validateUUIDParam('orgId', false),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId || DEFAULT_ORG_ID;
      const analytics = await getPortfolioAnalytics(orgId);
      res.json(analytics);
    } catch (error: any) {
      next(error);
    }
  }
);

// 8. Ingest BOM (CSV, XLSX, PDF Upload or JSON Payload)
app.post(
  '/api/ingest',
  sensitiveEndpointLimiter,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.body.orgId || DEFAULT_ORG_ID;

      if (req.file) {
        const { items, format, source, errors } = await parseBOMFile(req.file);

        if (items.length === 0) {
          return res.status(400).json({
            error: 'INVALID_BOM_DATA',
            message: `No valid BOM line items found in uploaded ${format.toUpperCase()} document`,
            format,
            parseErrors: errors,
          });
        }

        const result = await ingestBOMItems(orgId, items);
        return res.json({
          message: `Successfully ingested ${result.ingestedSuppliersCount} suppliers and linked ${result.linkedEdgesCount} edges via ${format.toUpperCase()} pipeline`,
          format,
          source,
          parseErrors: errors.length > 0 ? errors : undefined,
          dag: result.dag,
        });
      }

      if (req.body.lineItems && Array.isArray(req.body.lineItems)) {
        const result = await ingestBOMItems(orgId, req.body.lineItems);
        return res.json({
          message: `Successfully ingested ${result.ingestedSuppliersCount} suppliers`,
          dag: result.dag,
        });
      }

      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Please upload a CSV, XLSX, or PDF file as form-data (field: "file") or provide a JSON array "lineItems"',
      });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 9. Multi-BOM Presets Catalog
app.get('/api/scenarios/boms', (_req: Request, res: Response) => {
  const presets = getAvailableBOMPresets();
  res.json({ count: presets.length, presets });
});

// 10. Load Multi-BOM Architecture Preset
app.post(
  '/api/scenarios/boms/:presetKey/load',
  sensitiveEndpointLimiter,
  validateSafeIdentifier('presetKey'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { presetKey } = req.params;
      const orgId = req.body.orgId || DEFAULT_ORG_ID;
      const result = await loadBOMPreset(presetKey, orgId);
      res.json(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
      }
      next(error);
    }
  }
);

// 11. Live Maritime & Trade Disruption Intelligence Bulletin
app.get(
  '/api/disruption/bulletin/:scenarioKey',
  validateSafeIdentifier('scenarioKey'),
  (req: Request, res: Response) => {
    const { scenarioKey } = req.params;
    const rawCountry = typeof req.query.country === 'string' ? req.query.country : 'Global Corridor';
    const country = rawCountry.slice(0, 80).replace(/[^a-zA-Z0-9\s,.-]/g, '');
    const bulletin = getLiveDisruptionBulletin(scenarioKey, country);
    res.json({ scenarioKey, bulletin });
  }
);

// Centralized Error Handling Middleware (prevents DB credential / stack leak)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err.message || err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'File exceeds maximum upload size (10MB)' });
    }
    return res.status(400).json({ error: 'UPLOAD_ERROR', message: err.message });
  }

  // Database UUID parsing error
  if (err.message?.includes('invalid input syntax for type uuid')) {
    return res.status(400).json({ error: 'INVALID_PARAMETER', message: 'Invalid UUID syntax in request identifier.' });
  }

  // PostgreSQL constraint violations
  if (err.code === '23505') {
    return res.status(409).json({ error: 'CONFLICT', message: 'A record with this identifier already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'FOREIGN_KEY_VIOLATION', message: 'Referenced parent record does not exist.' });
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
  });
});


// Start Server
app.listen(port, () => {
  console.log(`\n========================================================`);
  console.log(`[VERITAS // SUPPLY] Hardened Backend running on port ${port}`);
  console.log(`Database connected: veritassupply`);
  console.log(`Default Org ID: ${DEFAULT_ORG_ID}`);
  console.log(`Security: UUID validation, Zod payload schemas, 10MB upload limit active.`);
  console.log(`========================================================\n`);
});
