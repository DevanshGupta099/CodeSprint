export interface AICopilotResponse {
  query: string;
  headline: string;
  summary: string;
  rootCauseDiagnosis: string;
  affectedTiers: string[];
  affectedSupplierNames: string[];
  riskMetrics: {
    probability: number;
    severity: number;
    confidence: number;
    financialExposureUSD: string;
    sdgImpact: {
      sdg8ForcedLabor: string;
      sdg12AvoidedCarbon: string;
    };
  };
  recommendations: {
    action: string;
    targetSupplierId?: string;
    alternateSupplierId?: string;
    alternateName?: string;
    priceVariancePct?: number;
    leadTimeDeltaDays?: number;
    avoidedScope3Tco2e?: number;
  };
  suggestedAction?: 'SIMULATE_DISRUPTION' | 'EXECUTE_REROUTE' | 'FILTER_TIER' | 'INSPECT_SUPPLIER';
  suggestedActionLabel?: string;
  suggestedPayload?: any;
}

export interface SupplierAIAudit {
  supplierId: string;
  supplierName: string;
  auditTimestamp: string;
  compositeRiskScore: number;
  uflpaSanctionStatus: 'CLEARED' | 'HIGH_RISK' | 'UNDER_REVIEW';
  forcedLaborRiskRationale: string;
  scope3DecarbonizationRating: 'A+' | 'A' | 'B' | 'C' | 'CRITICAL';
  estimatedAnnualEmissionsTco2e: number;
  spofVulnerabilityAnalysis: string;
  recommendedMitigationStrategy: string;
}
