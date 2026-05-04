'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  label: string;
  value: string;
  delta?: number;
  deltaInverted?: boolean; // for metrics where lower is better (rejection, processing time)
  hint?: string;
  index?: number;
};

export function KpiCard({ label, value, delta, deltaInverted = false, hint, index = 0 }: Props) {
  const hasDelta = delta !== undefined && !isNaN(delta);
  const isPositive = hasDelta && delta! > 0.001;
  const isNegative = hasDelta && delta! < -0.001;
  const isFlat = hasDelta && !isPositive && !isNegative;
  
  // Visual color: depends on whether positive movement is "good"
  const isGoodMovement = deltaInverted ? isNegative : isPositive;
  const isBadMovement = deltaInverted ? isPositive : isNegative;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="card p-6 group hover:border-ink-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-medium">
          {label}
        </div>
        {hasDelta && (
          <div
            className={clsx(
              'flex items-center gap-0.5 text-[11px] font-medium tabular px-1.5 py-0.5 rounded-full',
              isGoodMovement && 'text-ledger-green bg-ledger-green/8',
              isBadMovement && 'text-ledger-red bg-ledger-red/8',
              isFlat && 'text-ink-400 bg-ink-100',
            )}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />}
            {isNegative && <ArrowDownRight className="w-3 h-3" strokeWidth={2.5} />}
            {isFlat && <Minus className="w-3 h-3" strokeWidth={2.5} />}
            {Math.abs(delta! * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mt-4 font-display text-[2.5rem] leading-[1.05] tracking-tighter text-ink-900 tabular">
        {value}
      </div>

      {hint && (
        <div className="mt-2 text-xs text-ink-500">{hint}</div>
      )}
    </motion.div>
  );
}
