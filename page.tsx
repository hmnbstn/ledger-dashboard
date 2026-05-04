'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KpiCard } from '@/components/KpiCard';
import { FileUpload } from '@/components/FileUpload';
import { VolumeChart, HourlyChart, BarList } from '@/components/Charts';
import {
  computeKpis, generateMockData,
  formatCurrency, formatNumber, formatPercent, formatDuration,
} from '@/lib/metrics';
import type { Operation } from '@/lib/types';

export default function Dashboard() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [source, setSource] = useState<string>('Données de démonstration');
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  // Initialize with mock data on mount
  useEffect(() => {
    setOperations(generateMockData(30));
    setLoadedAt(new Date());
  }, []);

  const kpis = useMemo(() => computeKpis(operations), [operations]);

  const handleLoaded = (ops: Operation[], filename: string) => {
    setOperations(ops);
    setSource(filename);
    setLoadedAt(new Date());
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="hairline-b sticky top-0 bg-paper/85 backdrop-blur-xl z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <div className="font-display text-2xl tracking-tightest text-ink-900">
              Ledger
            </div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium">
              Operations · La Banque Postale
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-ink-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ledger-green animate-pulse" />
              <span>Live</span>
            </div>
            {loadedAt && (
              <div className="tabular">
                {format(loadedAt, "d MMMM yyyy · HH:mm", { locale: fr })}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        {/* ─── Title & file upload row ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-medium mb-3">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </div>
            <h1 className="font-display text-[3.5rem] leading-[1] tracking-tightest text-ink-900">
              Vue d'ensemble<br />
              <span className="italic text-ink-500">des opérations</span>
            </h1>
            <p className="mt-4 text-sm text-ink-500 max-w-md leading-relaxed">
              Source : <span className="text-ink-900 font-medium">{source}</span>
              {' · '}
              <span className="tabular">{formatNumber(operations.length)}</span> lignes traitées
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex items-end"
          >
            <div className="w-full">
              <FileUpload onLoaded={handleLoaded} />
            </div>
          </motion.div>
        </div>

        {/* ─── KPI Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            label="Volume traité"
            value={formatCurrency(kpis.totalVolume)}
            delta={kpis.volumeDelta}
            hint={`Ticket moyen ${formatCurrency(kpis.avgTicket)}`}
            index={0}
          />
          <KpiCard
            label="Opérations"
            value={formatNumber(kpis.totalCount)}
            delta={kpis.countDelta}
            hint={`${formatNumber(kpis.uniqueClients)} clients uniques`}
            index={1}
          />
          <KpiCard
            label="Taux de rejet"
            value={formatPercent(kpis.rejectionRate)}
            delta={kpis.rejectionDelta}
            deltaInverted
            hint="vs période précédente"
            index={2}
          />
          <KpiCard
            label="Temps moyen"
            value={formatDuration(kpis.avgProcessingTime)}
            delta={kpis.processingDelta}
            deltaInverted
            hint="par opération validée"
            index={3}
          />
        </div>

        {/* ─── Main charts grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6 lg:col-span-2"
          >
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
                  Volume quotidien
                </div>
                <div className="font-display text-2xl text-ink-900 mt-1">
                  Évolution sur la période
                </div>
              </div>
              <div className="text-xs text-ink-400">EUR</div>
            </div>
            <VolumeChart data={kpis.daily} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
              Par canal
            </div>
            <div className="font-display text-2xl text-ink-900 mt-1 mb-5">
              Mix de distribution
            </div>
            <BarList
              items={kpis.byCanal.map(c => ({
                label: c.canal,
                value: c.count,
                secondary: formatCurrency(c.volume),
              }))}
            />
          </motion.div>
        </div>

        {/* ─── Bottom grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
              Distribution horaire
            </div>
            <div className="font-display text-2xl text-ink-900 mt-1 mb-3">
              Pic d'activité
            </div>
            <HourlyChart data={kpis.hourly} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
              Par type d'opération
            </div>
            <div className="font-display text-2xl text-ink-900 mt-1 mb-5">
              Répartition
            </div>
            <BarList
              items={kpis.byType.map(t => ({
                label: t.type,
                value: t.volume,
                secondary: `${formatNumber(t.count)} opérations`,
              }))}
              formatValue={formatCurrency}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
              Top agences
            </div>
            <div className="font-display text-2xl text-ink-900 mt-1 mb-5">
              Performance
            </div>
            <BarList
              items={kpis.byAgence.slice(0, 6).map(a => ({
                label: a.agence,
                value: a.volume,
                secondary: `${formatNumber(a.count)} opérations`,
              }))}
              formatValue={formatCurrency}
            />
          </motion.div>
        </div>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer className="mt-16 pt-6 hairline-t flex items-center justify-between text-xs text-ink-500">
          <div>Ledger · v1.0 · Données traitées localement</div>
          <div className="font-display italic">Designed with care.</div>
        </footer>
      </main>
    </div>
  );
}
