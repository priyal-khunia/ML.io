import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';
  accentColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'emerald',
  accentColor = 'emerald',
}) => {
  const accentGlow = {
    emerald: 'group-hover:border-emerald-500/40',
    amber: 'group-hover:border-amber-500/40',
    rose: 'group-hover:border-rose-500/40',
    cyan: 'group-hover:border-cyan-500/40',
    slate: 'group-hover:border-slate-500/40',
  }[accentColor] || 'group-hover:border-emerald-500/40';

  const badgeStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    slate: 'bg-dark-800 text-slate-400 border-dark-700',
  }[badgeColor] || 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

  const iconColor = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    slate: 'text-slate-400 bg-dark-800 border-dark-700',
  }[accentColor] || 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div
      className={`relative group overflow-hidden bg-dark-900 border border-dark-700 rounded-2xl p-5 shadow-lg transition-all duration-200 ${accentGlow}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-dark-700/60">
        {subtitle ? (
          <span className="text-xs text-slate-400 truncate">
            {subtitle}
          </span>
        ) : (
          <span />
        )}
        {badge && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
