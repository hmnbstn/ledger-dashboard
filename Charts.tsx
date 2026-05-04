'use client';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency, formatNumber } from '@/lib/metrics';

const INK = '#0A0A0A';
const INK_MUTED = '#9A9A9A';
const HAIRLINE = 'rgba(10, 10, 10, 0.06)';

const tooltipStyle = {
  backgroundColor: '#0A0A0A',
  border: 'none',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '12px',
  color: '#FBFAF7',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
};

// ─── Volume daily area chart ──────────────────────────────────────
type DailyProps = {
  data: { date: string; volume: number; count: number }[];
};

export function VolumeChart({ data }: DailyProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INK} stopOpacity={0.18} />
            <stop offset="100%" stopColor={INK} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={HAIRLINE} vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: INK_MUTED, fontSize: 11, fontFamily: 'Inter' }}
          tickFormatter={(d) => format(parseISO(d), 'd MMM', { locale: fr })}
          minTickGap={40}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: INK_MUTED, fontSize: 11, fontFamily: 'Inter' }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
          width={55}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: INK, strokeWidth: 1, strokeDasharray: '3 3' }}
          formatter={(value: number) => [formatCurrency(value), 'Volume']}
          labelFormatter={(d) => format(parseISO(d as string), 'EEEE d MMMM', { locale: fr })}
        />
        <Area
          type="monotone"
          dataKey="volume"
          stroke={INK}
          strokeWidth={1.5}
          fill="url(#volGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Hourly distribution bar chart ────────────────────────────────
type HourlyProps = {
  data: { hour: number; count: number }[];
};

export function HourlyChart({ data }: HourlyProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={HAIRLINE} vertical={false} />
        <XAxis
          dataKey="hour"
          axisLine={false}
          tickLine={false}
          tick={{ fill: INK_MUTED, fontSize: 11, fontFamily: 'Inter' }}
          tickFormatter={(h) => `${h}h`}
          interval={2}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: INK_MUTED, fontSize: 11, fontFamily: 'Inter' }}
          width={40}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'rgba(10,10,10,0.04)' }}
          formatter={(v: number) => [formatNumber(v), 'Opérations']}
          labelFormatter={(h) => `${h}h00 — ${h}h59`}
        />
        <Bar dataKey="count" fill={INK} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Horizontal bar list — used for canal / type / agence breakdowns ──
type BarListItem = { label: string; value: number; secondary?: string };

export function BarList({ items, formatValue }: { 
  items: BarListItem[]; 
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={item.label} className="group">
          <div className="flex items-baseline justify-between text-sm mb-1">
            <span className="text-ink-700 font-medium">{item.label}</span>
            <span className="tabular text-ink-900 font-medium">
              {formatValue ? formatValue(item.value) : formatNumber(item.value)}
            </span>
          </div>
          <div className="relative h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-ink-900 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${(item.value / max) * 100}%`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
          {item.secondary && (
            <div className="text-[11px] text-ink-500 mt-0.5">{item.secondary}</div>
          )}
        </div>
      ))}
    </div>
  );
}
