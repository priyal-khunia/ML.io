import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate' | 'blue';
  accentColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  accentColor = 'blue',
}) => {
  const accentBorder = {
    blue: 'hover:border-blue-500/60',
    emerald: 'hover:border-emerald-500/60',
    amber: 'hover:border-amber-500/60',
    rose: 'hover:border-rose-500/60',
    cyan: 'hover:border-sky-500/60',
    slate: 'hover:border-slate-400',
  }[accentColor] || 'hover:border-blue-500/60';

  const badgeStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor] || 'bg-blue-50 text-blue-700 border-blue-200';

  const iconColor = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    cyan: 'text-sky-600 bg-sky-50 border-sky-200',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
  }[accentColor] || 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div
      className={`relative group bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors duration-150 ${accentBorder}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-semibold tracking-wider text-[#64748B] uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[#64748B]">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
        {subtitle ? (
          <span className="text-xs text-[#64748B] truncate">
            {subtitle}
          </span>
        ) : (
          <span />
        )}
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
