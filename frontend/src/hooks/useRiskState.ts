'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RiskStateResponse } from '../types/supply-chain';
import { api } from '../services/api';

interface UseRiskStateOptions {
  orgId?: string;
  intervalMs?: number;
  enabled?: boolean;
  onRiskStateChange?: (state: RiskStateResponse) => void;
}

export function useRiskState({
  orgId = '00000000-0000-0000-0000-000000000001',
  intervalMs = 4000,
  enabled = true,
  onRiskStateChange,
}: UseRiskStateOptions = {}) {
  const [riskState, setRiskState] = useState<RiskStateResponse | null>(null);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const prevSignatureRef = useRef<string>('');
  const callbackRef = useRef(onRiskStateChange);
  callbackRef.current = onRiskStateChange;

  return { riskState, lastPolledAt, isPolling, error };
}
