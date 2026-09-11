# VeritasSupply — Shared Data Contracts (Hour 0 / Day 0)

This document establishes the inviolable data contract between **Contributor A (Data & Backend)** and **Contributor B (Graph & Frontend)**. Both contributors code against these interfaces and Zod schemas.

---

## 1. Shared Types & Schemas

### Entity: Supplier
```typescript
import { z } from 'zod';

export const SupplierStatusSchema = z.enum(['NOMINAL', 'ELEVATED', 'CRITICAL']);
export type SupplierStatus = z.infer<typeof SupplierStatusSchema>;

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  country: z.string(),
  countryCode: z.string().length(3),
  tier: z.number().int().min(0).max(4),
  materialCategory: z.string(),
  certifications: z.array(z.string()).default([]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  spend: z.number(), // in Millions USD
  leadTimeDays: z.number().int(),
  status: SupplierStatusSchema.default('NOMINAL'),
  riskScore: z.number().min(0).max(1).default(0.0),
  isSPOF: z.boolean().default(false),
});
export type Supplier = z.infer<typeof SupplierSchema>;
```

### Entity: SupplierEdge (DAG Dependency)
```typescript
export const SupplierEdgeSchema = z.object({
  id: z.string(),
  // parent = DOWNSTREAM consumer (e.g. Tier 0 or Tier 1)
  parentSupplierId: z.string().uuid(),
  // child = UPSTREAM provider (e.g. Tier 2 or Tier 3)
  childSupplierId: z.string().uuid(),
  componentName: z.string(),
  spendUsd: z.number(),
  leadTimeDays: z.number().int(),
  shippingRoute: z.string().optional(),
});
export type SupplierEdge = z.infer<typeof SupplierEdgeSchema>;
```

### Entity: DisruptionEvent
```typescript
export const DisruptionTypeSchema = z.enum([
  'GEOPOLITICAL_BLOCKADE',
  'NATURAL_DISASTER',
  'SANCTIONS_FORCED_LABOR',
  'PORT_CLOSURE',
]);
export type DisruptionType = z.infer<typeof DisruptionTypeSchema>;

export const DisruptionEventSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().uuid(),
  type: DisruptionTypeSchema,
  severity: z.number().min(0).max(1),
  sourceSummary: z.string(),
  sourceUrl: z.string().url().optional(),
  triggeredAt: z.string().datetime(),
});
export type DisruptionEvent = z.infer<typeof DisruptionEventSchema>;
```

### Entity: AlternateSupplier & MitigationMemo
```typescript
export const AlternateSupplierSchema = z.object({
  id: z.string().uuid(),
  replacesSupplierId: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  countryCode: z.string().length(3),
  priceIndex: z.number(), // 1.04 for +4.2%
  leadTimeDays: z.number().int(),
  emissionsFactor: z.number(),
  certifications: z.array(z.string()),
});
export type AlternateSupplier = z.infer<typeof AlternateSupplierSchema>;

export const MitigationMemoSchema = z.object({
  id: z.string().uuid(),
  disruptedSupplierId: z.string().uuid(),
  alternateSupplierId: z.string().uuid(),
  alternateName: z.string(),
  priceVariancePct: z.number(),
  leadTimeDeltaDays: z.number().int(),
  avoidedScope3Tco2e: z.number(),
  complianceRationale: z.string(),
  executiveSummary: z.string(),
  generatedAt: z.string().datetime(),
});
export type MitigationMemo = z.infer<typeof MitigationMemoSchema>;
```

---

## 2. API Response Payloads

### `GET /api/supply-chain/:orgId`
```typescript
export interface SupplyChainDAGResponse {
  organization: {
    id: string;
    name: string;
    industry: string;
  };
  nodes: Supplier[];
  edges: SupplierEdge[];
}
```

### `GET /api/risk-state/:orgId`
```typescript
export interface RiskStateResponse {
  orgId: string;
  timestamp: string;
  nodes: {
    supplierId: string;
    status: SupplierStatus;
    riskScore: number;
    isSPOF: boolean;
  }[];
  portfolioMetrics: {
    totalSpendAtRiskUSD: number;
    avoidedScope3Tco2e: number;
    activeDisruptionsCount: number;
  };
}
```
