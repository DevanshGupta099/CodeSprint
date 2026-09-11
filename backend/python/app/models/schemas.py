from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID


class SupplierStatus(str, Enum):
    NOMINAL = "NOMINAL"
    ELEVATED = "ELEVATED"
    CRITICAL = "CRITICAL"


class DisruptionType(str, Enum):
    GEOPOLITICAL_BLOCKADE = "GEOPOLITICAL_BLOCKADE"
    NATURAL_DISASTER = "NATURAL_DISASTER"
    SANCTIONS_FORCED_LABOR = "SANCTIONS_FORCED_LABOR"
    PORT_CLOSURE = "PORT_CLOSURE"


class Supplier(BaseModel):
    id: str
    orgId: str
    name: str
    code: str
    country: str
    countryCode: str
    tier: int = Field(ge=0, le=4)
    materialCategory: str
    certifications: List[str] = []
    lat: Optional[float] = None
    lng: Optional[float] = None
    spend: float
    leadTimeDays: int
    status: SupplierStatus = SupplierStatus.NOMINAL
    riskScore: float = Field(default=0.0, ge=0.0, le=1.0)
    isSPOF: bool = False


class SupplierEdge(BaseModel):
    id: str
    parentSupplierId: str  # Downstream consumer
    childSupplierId: str   # Upstream supplier
    componentName: str
    spendUsd: float
    leadTimeDays: int
    shippingRoute: Optional[str] = None


class DisruptionEvent(BaseModel):
    id: str
    supplierId: str
    type: DisruptionType
    severity: float = Field(ge=0.0, le=1.0)
    sourceSummary: str
    sourceUrl: Optional[str] = None
    triggeredAt: str


class RiskScore(BaseModel):
    id: Optional[str] = None
    supplierId: str
    probability: float = Field(ge=0.0, le=1.0)
    severity: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    computedAt: str


class AlternateSupplier(BaseModel):
    id: str
    replacesSupplierId: str
    name: str
    country: str
    countryCode: str
    priceIndex: float
    leadTimeDays: int
    emissionsFactor: float
    certifications: List[str] = []


class MitigationMemo(BaseModel):
    id: str
    disruptedSupplierId: str
    alternateSupplierId: str
    alternateName: str
    priceVariancePct: float
    leadTimeDeltaDays: int
    avoidedScope3Tco2e: float
    complianceRationale: str
    executiveSummary: str
    generatedAt: str


class Organization(BaseModel):
    id: str
    name: str
    industry: str


class SupplyChainDAGResponse(BaseModel):
    organization: Organization
    nodes: List[Supplier]
    edges: List[SupplierEdge]


class RiskNodeTelemetry(BaseModel):
    supplierId: str
    status: SupplierStatus
    riskScore: float
    isSPOF: bool


class PortfolioMetrics(BaseModel):
    totalSpendAtRiskUSD: float
    avoidedScope3Tco2e: float
    activeDisruptionsCount: int


class RiskStateResponse(BaseModel):
    orgId: str
    timestamp: str
    nodes: List[RiskNodeTelemetry]
    portfolioMetrics: PortfolioMetrics


class TriggerDisruptionRequest(BaseModel):
    supplierId: Optional[str] = None
    type: DisruptionType = DisruptionType.GEOPOLITICAL_BLOCKADE
    severity: float = Field(default=0.90, ge=0.0, le=1.0)
    sourceSummary: Optional[str] = None
    sourceUrl: Optional[str] = None


class SPOFAnalysisResponse(BaseModel):
    orgId: str
    singlePointsOfFailure: List[dict]
    bridgeEdges: List[dict]
    betweennessCentrality: dict
