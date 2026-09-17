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

  const poll = useCallback(async () => {
    try {
      setIsPolling(true);
      const state = await api.getRiskState(orgId);
      setLastPolledAt(new Date());
      setError(null);

      // Create a deterministic signature of critical state fields
      const signature = JSON.stringify({
        activeDisruptions: state.portfolioMetrics.activeDisruptionsCount,
        totalSpendAtRisk: state.portfolioMetrics.totalSpendAtRiskUSD,
        avoidedCarbon: state.portfolioMetrics.avoidedScope3Tco2e,
        nodes: state.nodes.map((n) => `${n.supplierId}:${n.status}:${n.riskScore}`),
      });

      if (signature !== prevSignatureRef.current) {
        prevSignatureRef.current = signature;
        setRiskState(state);
        if (callbackRef.current) {
          callbackRef.current(state);
        }
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsPolling(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!enabled) return;

    let interval: NodeJS.Timeout;
    // Defer initial poll slightly after hydration to ensure smooth, zero-contention FCP/LCP paint
    const timer = setTimeout(() => {
      poll();
      interval = setInterval(() => {
        poll();
      }, intervalMs);
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [enabled, intervalMs, poll]);

  return {
    riskState,
    lastPolledAt,
    isPolling,
    error,
    refreshNow: poll,
  };
}
