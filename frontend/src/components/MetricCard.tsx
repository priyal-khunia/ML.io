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
    emerald: 'group-hover:border-[#6C63FF]/50',
    amber: 'group-hover:border-[#E7A83B]/50',
    rose: 'group-hover:border-[#E76F6F]/50',
    cyan: 'group-hover:border-[#5B9CF6]/50',
    slate: 'group-hover:border-[#D1D5DB]',
  }[accentColor] || 'group-hover:border-[#6C63FF]/50';

  const badgeStyles = {
    emerald: 'bg-[#35B99A]/15 text-[#35B99A] border-[#35B99A]/30',
    amber: 'bg-[#E7A83B]/15 text-[#E7A83B] border-[#E7A83B]/30',
    rose: 'bg-[#E76F6F]/15 text-[#E76F6F] border-[#E76F6F]/30',
    cyan: 'bg-[#5B9CF6]/15 text-[#5B9CF6] border-[#5B9CF6]/30',
    slate: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
  }[badgeColor] || 'bg-[#35B99A]/15 text-[#35B99A] border-[#35B99A]/30';

  const iconColor = {
    emerald: 'text-[#6C63FF] bg-[#6C63FF]/10 border-[#6C63FF]/20',
    amber: 'text-[#E7A83B] bg-[#E7A83B]/10 border-[#E7A83B]/20',
    rose: 'text-[#E76F6F] bg-[#E76F6F]/10 border-[#E76F6F]/20',
    cyan: 'text-[#5B9CF6] bg-[#5B9CF6]/10 border-[#5B9CF6]/20',
    slate: 'text-[#6B7280] bg-[#F3F4F6] border-[#E5E7EB]',
  }[accentColor] || 'text-[#6C63FF] bg-[#6C63FF]/10 border-[#6C63FF]/20';

  return (
    <div
      className={`relative group overflow-hidden bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 ${accentGlow}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold tracking-tight text-[#252936] font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[#6B7280]">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E5E7EB]">
        {subtitle ? (
          <span className="text-xs text-[#6B7280] truncate">
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
