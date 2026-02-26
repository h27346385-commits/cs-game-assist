import { useState, useEffect, useCallback } from 'react';
import { databaseService, isElectronAvailable } from '../services/electronApi';
import type { Match, Highlight } from '../types';

export function useDatabaseStatus() {
  const [status, setStatus] = useState<{ initialized: boolean; connected: boolean; path: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (!isElectronAvailable()) {
          setError('Electron API 不可用');
          setLoading(false);
          return;
        }
        const result = await databaseService.getStatus();
        setStatus(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  return { status, loading, error };
}

export function useDatabaseStats() {
  const [stats, setStats] = useState<{ totalMatches: number; totalKills: number; totalHighlights: number; mapsPlayed: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      if (!isElectronAvailable()) {
        setError('Electron API 不可用');
        return;
      }
      const result = await databaseService.getStats();
      setStats(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}

export function useMatches(limit?: number) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      if (!isElectronAvailable()) {
        setError('Electron API 不可用');
        return;
      }
      const result = await databaseService.getMatches(limit);
      setMatches(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveMatch = async (data: any) => {
    const result = await databaseService.saveMatch(data);
    await refresh();
    return result;
  };

  const deleteMatch = async (matchId: string) => {
    await databaseService.deleteMatch(matchId);
    await refresh();
  };

  return { matches, loading, error, refresh, saveMatch, deleteMatch };
}

export function useHighlights(matchId?: string, type?: string) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      if (!isElectronAvailable()) {
        setError('Electron API 不可用');
        return;
      }
      const result = await databaseService.getHighlights(matchId, type);
      setHighlights(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [matchId, type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { highlights, loading, error, refresh };
}
