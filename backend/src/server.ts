import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { query } from './db/index.js';
import { getSupplyChainDAG, getRiskState, getAlternatesForSupplier, resetRiskState } from './db/queries.js';
import { triggerDisruptionSentinel } from './services/sentinel.js';
import { generateMitigationMemo } from './services/mitigation.js';
import { parseBOMCSV, ingestBOMItems } from './services/ingestion.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

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
    });
  } catch (error: any) {
    res.status(500).json({ status: 'DEGRADED', database: 'DISCONNECTED', error: error.message });
  }
});

// 2. Supply Chain DAG (React Flow Payload)
app.get('/api/supply-chain/:orgId?', async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId || DEFAULT_ORG_ID;
    const dag = await getSupplyChainDAG(orgId);
    res.json(dag);
  } catch (error: any) {
    console.error('[API_ERROR] /api/supply-chain:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Polled Risk State (Nodes + Metrics)
app.get('/api/risk-state/:orgId?', async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId || DEFAULT_ORG_ID;
    const riskState = await getRiskState(orgId);
    res.json(riskState);
  } catch (error: any) {
    console.error('[API_ERROR] /api/risk-state:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Trigger Disruption Simulation (Disruption Sentinel)
app.post('/api/disruption/trigger', async (req: Request, res: Response) => {
  try {
    const { supplierId, type, severity, sourceSummary, sourceUrl } = req.body;
    const result = await triggerDisruptionSentinel({
      supplierId,
      type,
      severity,
      sourceSummary,
      sourceUrl,
    });
    res.json(result);
  } catch (error: any) {
    console.error('[API_ERROR] /api/disruption/trigger:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Reset Risk State (For Live Demo Replay)
app.post('/api/disruption/reset/:orgId?', async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId || DEFAULT_ORG_ID;
    await resetRiskState(orgId);
    res.json({ message: '[SYS_RESET] Supply chain returned to NOMINAL state.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Generate Autonomous Procurement Switch Memo
app.post('/api/mitigation/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const memo = await generateMitigationMemo(supplierId);
    res.json(memo);
  } catch (error: any) {
    console.error('[API_ERROR] /api/mitigation:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Get Candidate Alternates for a Disrupted Node
app.get('/api/alternates/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const alternates = await getAlternatesForSupplier(supplierId);
    res.json({ supplierId, alternates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Ingest BOM (CSV Upload or JSON Payload)
app.post('/api/ingest', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const orgId = req.body.orgId || DEFAULT_ORG_ID;

    if (req.file) {
      const csvText = req.file.buffer.toString('utf-8');
      const items = parseBOMCSV(csvText);
      const updatedDAG = await ingestBOMItems(orgId, items);
      return res.json({ message: `Ingested ${items.length} line items from CSV`, dag: updatedDAG });
    }

    if (req.body.lineItems) {
      const updatedDAG = await ingestBOMItems(orgId, req.body.lineItems);
      return res.json({ message: `Ingested ${req.body.lineItems.length} line items`, dag: updatedDAG });
    }

    return res.status(400).json({ error: 'Please provide a CSV file or JSON lineItems' });
  } catch (error: any) {
    console.error('[API_ERROR] /api/ingest:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`\n========================================================`);
  console.log(`[VERITAS // SUPPLY] Backend Intel Engine running on port ${port}`);
  console.log(`Database connected: veritassupply`);
  console.log(`Default Org ID: ${DEFAULT_ORG_ID}`);
  console.log(`Endpoints active:`);
  console.log(`  - GET  /api/health`);
  console.log(`  - GET  /api/supply-chain/:orgId`);
  console.log(`  - GET  /api/risk-state/:orgId`);
  console.log(`  - POST /api/disruption/trigger`);
  console.log(`  - POST /api/disruption/reset/:orgId`);
  console.log(`  - POST /api/mitigation/:supplierId`);
  console.log(`  - GET  /api/alternates/:supplierId`);
  console.log(`  - POST /api/ingest`);
  console.log(`========================================================\n`);
});
