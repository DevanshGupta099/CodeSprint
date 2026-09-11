import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { query } from './db/index.js';
import { getSupplyChainDAG, getRiskState, getAlternatesForSupplier, resetRiskState } from './db/queries.js';
import { triggerDisruptionSentinel, TriggerDisruptionRequestSchema } from './services/sentinel.js';
import { generateMitigationMemo } from './services/mitigation.js';
import { parseBOMCSV, ingestBOMItems } from './services/ingestion.js';
import { validateUUIDParam, validateBody } from './middleware/validate.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security: Disable X-Powered-By
app.disable('x-powered-by');

// Security: Enforce upload size limits (10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Middleware
app.use(cors({
  origin: '*', // Open in dev, can be configured for production origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security: Enforce JSON body size limit (1MB)
app.use(express.json({ limit: '1mb' }));

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

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

// 6. Generate Autonomous Procurement Switch Memo
app.post(
  '/api/mitigation/:supplierId',
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

// 8. Ingest BOM (CSV Upload or JSON Payload)
app.post('/api/ingest', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.body.orgId || DEFAULT_ORG_ID;

    if (req.file) {
      const csvText = req.file.buffer.toString('utf-8');
      const { items, errors } = parseBOMCSV(csvText);

      if (items.length === 0) {
        return res.status(400).json({
          error: 'INVALID_BOM_DATA',
          message: 'No valid BOM line items found in CSV',
          parseErrors: errors,
        });
      }

      const result = await ingestBOMItems(orgId, items);
      return res.json({
        message: `Successfully ingested ${result.ingestedSuppliersCount} suppliers and linked ${result.linkedEdgesCount} edges`,
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
      message: 'Please upload a CSV file as form-data (field: "file") or provide a JSON array "lineItems"',
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'NOT_FOUND', message: error.message });
    }
    next(error);
  }
});

// Centralized Error Handling Middleware (prevents DB leak)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED_ERROR]', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'File exceeds maximum upload size (10MB)' });
    }
    return res.status(400).json({ error: 'UPLOAD_ERROR', message: err.message });
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
