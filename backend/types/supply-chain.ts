import { z } from 'zod';

export const SupplierStatusSchema = z.enum(['NOMINAL', 'ELEVATED', 'CRITICAL']);
export type SupplierStatus = z.infer<typeof SupplierStatusSchema>;

export const SupplierSchema = z.object({
  id: z.string().min(1),
  orgId: z.string().min(1),
  name: z.string(),
  code: z.string(),
  country: z.string(),
  countryCode: z.string().min(2).max(4),
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
  parentSupplierId: z.string().min(1), // Downstream consumer
  childSupplierId: z.string().min(1),  // Upstream supplier
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
  id: z.string().min(1),
  supplierId: z.string().min(1),
  type: DisruptionTypeSchema,
  severity: z.number().min(0).max(1),
  sourceSummary: z.string(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  occurredAt: z.string().datetime().optional(),
});
export type DisruptionEvent = z.infer<typeof DisruptionEventSchema>;

export const RiskScoreSchema = z.object({
  id: z.string().min(1),
  supplierId: z.string().min(1),
  probability: z.number().min(0).max(1),
  severity: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  computedAt: z.string().datetime().optional(),
});
export type RiskScore = z.infer<typeof RiskScoreSchema>;

export const AlternateSupplierSchema = z.object({
  id: z.string().min(1),
  replacesSupplierId: z.string().min(1),
  name: z.string(),
  country: z.string(),
  countryCode: z.string().min(2).max(4),
  priceIndex: z.number(),
  leadTimeDays: z.number().int(),
  emissionsFactor: z.number(),
  certifications: z.array(z.string()).default([]),
});
export type AlternateSupplier = z.infer<typeof AlternateSupplierSchema>;

export const MitigationMemoSchema = z.object({
  id: z.string().min(1),
  disruptedSupplierId: z.string().min(1),
  alternateSupplierId: z.string().min(1),
  alternateName: z.string(),
  priceVariancePct: z.number(),
  leadTimeDeltaDays: z.number().int(),
  avoidedScope3Tco2e: z.number(),
  complianceRationale: z.string(),
  executiveSummary: z.string(),
  generatedAt: z.string().min(1),
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

export const DisruptionScenarioSchema = z.object({
  key: z.string(),
  title: z.string(),
  targetSupplierCode: z.string(),
  targetSupplierName: z.string(),
  disruptionType: DisruptionTypeSchema,
  severity: z.number().min(0).max(1),
  sdgAnchor: z.string(),
  narrative: z.string(),
});
export type DisruptionScenario = z.infer<typeof DisruptionScenarioSchema>;

export const RerouteExecutionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  memoId: z.string().uuid(),
  previousSupplierId: z.string().uuid(),
  previousSupplierName: z.string(),
  newSupplierId: z.string().uuid(),
  newSupplierName: z.string(),
  avoidedScope3Tco2e: z.number(),
  updatedDAG: z.any(),
});
export type RerouteExecutionResponse = z.infer<typeof RerouteExecutionResponseSchema>;

export interface CountrySpendBreakdown {
  country: string;
  countryCode: string;
  spendUSD: number;
  supplierCount: number;
  atRiskSpendUSD: number;
  highestRiskScore: number;
  status: SupplierStatus;
}

export interface TierSpendBreakdown {
  tier: number;
  tierLabel: string;
  spendUSD: number;
  supplierCount: number;
  atRiskSpendUSD: number;
}

export interface ESGComplianceMetrics {
  totalSuppliers: number;
  certifiedSuppliersCount: number;
  compliancePercentage: number;
  laborStandardsCertifiedCount: number;
  environmentalCertifiedCount: number;
}

export interface PortfolioBreakdownResponse {
  orgId: string;
  timestamp: string;
  byCountry: CountrySpendBreakdown[];
  byTier: TierSpendBreakdown[];
  esgCompliance: ESGComplianceMetrics;
}
