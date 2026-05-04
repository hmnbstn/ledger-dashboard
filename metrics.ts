import type { Operation } from './types';
import { format, startOfDay, subDays, isWithinInterval, eachDayOfInterval } from 'date-fns';

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export type ComputedKpis = {
  totalVolume: number;
  totalCount: number;
  avgTicket: number;
  rejectionRate: number;
  avgProcessingTime: number;
  uniqueClients: number;
  // Trends (delta vs previous equivalent period)
  volumeDelta: number;
  countDelta: number;
  rejectionDelta: number;
  processingDelta: number;
  // Series
  daily: { date: string; volume: number; count: number }[];
  byCanal: { canal: string; count: number; volume: number }[];
  byType: { type: string; count: number; volume: number }[];
  byAgence: { agence: string; count: number; volume: number }[];
  hourly: { hour: number; count: number }[];
};

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return (current - previous) / previous;
}

export function computeKpis(operations: Operation[]): ComputedKpis {
  if (operations.length === 0) {
    return {
      totalVolume: 0, totalCount: 0, avgTicket: 0, rejectionRate: 0,
      avgProcessingTime: 0, uniqueClients: 0,
      volumeDelta: 0, countDelta: 0, rejectionDelta: 0, processingDelta: 0,
      daily: [], byCanal: [], byType: [], byAgence: [], hourly: [],
    };
  }

  // Determine date range
  const dates = operations.map(o => o.date.getTime());
  const maxDate = new Date(Math.max(...dates));
  const minDate = new Date(Math.min(...dates));
  const rangeDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Split current vs previous period for delta computation
  const halfPoint = subDays(maxDate, Math.floor(rangeDays / 2));
  const current = operations.filter(o => o.date >= halfPoint);
  const previous = operations.filter(o => o.date < halfPoint);

  const validated = (ops: Operation[]) => ops.filter(o => o.statut === 'Validée');
  const sumVol = (ops: Operation[]) => validated(ops).reduce((s, o) => s + o.montant, 0);
  const rejRate = (ops: Operation[]) => 
    ops.length === 0 ? 0 : ops.filter(o => o.statut === 'Rejetée').length / ops.length;
  const avgProc = (ops: Operation[]) => {
    const v = validated(ops);
    return v.length === 0 ? 0 : v.reduce((s, o) => s + o.duree_traitement, 0) / v.length;
  };

  const totalVolume = sumVol(operations);
  const totalCount = validated(operations).length;
  const avgTicket = totalCount === 0 ? 0 : totalVolume / totalCount;
  const rejectionRate = rejRate(operations);
  const avgProcessingTime = avgProc(operations);
  const uniqueClients = new Set(operations.map(o => o.client_id)).size;

  const volumeDelta = pctDelta(sumVol(current), sumVol(previous));
  const countDelta = pctDelta(validated(current).length, validated(previous).length);
  const rejectionDelta = rejRate(current) - rejRate(previous);
  const processingDelta = pctDelta(avgProc(current), avgProc(previous));

  // Daily series — fill gaps
  const days = eachDayOfInterval({ start: minDate, end: maxDate });
  const dailyMap = new Map<string, { volume: number; count: number }>();
  days.forEach(d => dailyMap.set(format(d, 'yyyy-MM-dd'), { volume: 0, count: 0 }));
  validated(operations).forEach(op => {
    const key = format(op.date, 'yyyy-MM-dd');
    const cur = dailyMap.get(key) ?? { volume: 0, count: 0 };
    cur.volume += op.montant;
    cur.count += 1;
    dailyMap.set(key, cur);
  });
  const daily = Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group helpers
  const groupBy = <K extends keyof Operation>(field: K) => {
    const m = new Map<string, { count: number; volume: number }>();
    validated(operations).forEach(op => {
      const k = String(op[field]);
      const cur = m.get(k) ?? { count: 0, volume: 0 };
      cur.count += 1;
      cur.volume += op.montant;
      m.set(k, cur);
    });
    return Array.from(m.entries())
      .map(([key, v]) => ({ [field]: key, ...v }))
      .sort((a, b) => b.volume - a.volume);
  };

  const byCanal = groupBy('canal') as { canal: string; count: number; volume: number }[];
  const byType = groupBy('type') as { type: string; count: number; volume: number }[];
  const byAgence = (groupBy('agence') as { agence: string; count: number; volume: number }[]).slice(0, 8);

  // Hourly distribution
  const hourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourMap.set(h, 0);
  operations.forEach(op => {
    const h = op.date.getHours();
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  });
  const hourly = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);

  return {
    totalVolume, totalCount, avgTicket, rejectionRate,
    avgProcessingTime, uniqueClients,
    volumeDelta, countDelta, rejectionDelta, processingDelta,
    daily, byCanal, byType, byAgence, hourly,
  };
}

/**
 * Generate realistic mock data for demo purposes — used when no file uploaded yet.
 */
export function generateMockData(days = 30): Operation[] {
  const ops: Operation[] = [];
  const agences = ['Paris 9e', 'Lyon Part-Dieu', 'Marseille Centre', 'Lille Grand Place', 'Bordeaux Lac', 'Nantes Centre', 'Toulouse Capitole', 'Nice Etoile'];
  const canaux: Operation['canal'][] = ['Guichet', 'En ligne', 'Mobile', 'ATM', 'Téléphone'];
  const types: Operation['type'][] = ['Virement', 'Prélèvement', 'Dépôt', 'Retrait', 'Carte', 'Crédit'];
  const statuts: Operation['statut'][] = ['Validée', 'Validée', 'Validée', 'Validée', 'Validée', 'Validée', 'Validée', 'Validée', 'En attente', 'Rejetée'];

  // Seeded pseudo-random for stable data
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const now = new Date();
  for (let d = 0; d < days; d++) {
    const dayDate = subDays(now, d);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const opsCount = Math.floor(isWeekend ? 80 + rand() * 60 : 200 + rand() * 150);

    for (let i = 0; i < opsCount; i++) {
      const date = new Date(dayDate);
      const hour = isWeekend ? 10 + Math.floor(rand() * 8) : 8 + Math.floor(rand() * 11);
      date.setHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60));
      
      const type = pick(types);
      let montant: number;
      switch (type) {
        case 'Virement': montant = 100 + rand() * 4900; break;
        case 'Prélèvement': montant = 20 + rand() * 480; break;
        case 'Dépôt': montant = 50 + rand() * 2950; break;
        case 'Retrait': montant = 20 + rand() * 480; break;
        case 'Carte': montant = 5 + rand() * 295; break;
        case 'Crédit': montant = 1000 + rand() * 49000; break;
      }

      ops.push({
        date,
        agence: pick(agences),
        canal: pick(canaux),
        type,
        montant: Math.round(montant * 100) / 100,
        statut: pick(statuts),
        duree_traitement: Math.round(30 + rand() * 270),
        client_id: `C${String(Math.floor(rand() * 5000)).padStart(5, '0')}`,
      });
    }
  }
  return ops;
}
