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
  spend: z.number(), // Millions USD
  leadTimeDays: z.number().int(),
  status: SupplierStatusSchema.default('NOMINAL'),
  riskScore: z.number().min(0).max(1).default(0.0),
  isSPOF: z.boolean().default(false),
});
export type Supplier = z.infer<typeof SupplierSchema>;

export const SupplierEdgeSchema = z.object({
  id: z.string(),
  parentSupplierId: z.string().uuid(), // Downstream consumer
  childSupplierId: z.string().uuid(),  // Upstream supplier
  componentName: z.string(),
  spendUsd: z.number(),
  leadTimeDays: z.number().int(),
  shippingRoute: z.string().optional(),
});
export type SupplierEdge = z.infer<typeof SupplierEdgeSchema>;

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

export const RiskScoreSchema = z.object({
  id: z.string().uuid().optional(),
  supplierId: z.string().uuid(),
  probability: z.number().min(0).max(1),
  severity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  computedAt: z.string().datetime(),
});
export type RiskScore = z.infer<typeof RiskScoreSchema>;

export const AlternateSupplierSchema = z.object({
  id: z.string().uuid(),
  replacesSupplierId: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  countryCode: z.string().length(3),
  priceIndex: z.number(),
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

export interface SupplyChainDAGResponse {
  organization: {
    id: string;
    name: string;
    industry: string;
  };
  nodes: Supplier[];
  edges: SupplierEdge[];
}

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
