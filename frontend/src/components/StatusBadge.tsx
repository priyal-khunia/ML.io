import React from 'react';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  action: 'SCALE_UP' | 'MAINTAIN' | 'SCALE_DOWN' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ action, size = 'md', showIcon = true }) => {
  let colorClasses = '';
  let Icon = CheckCircle2;
  let label = action;

  switch (action) {
    case 'SCALE_UP':
      colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      Icon = ArrowUpRight;
      label = 'SCALE UP';
      break;
    case 'SCALE_DOWN':
      colorClasses = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      Icon = ArrowDownRight;
      label = 'SCALE DOWN';
      break;
    case 'MAINTAIN':
      colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      Icon = CheckCircle2;
      label = 'MAINTAIN';
      break;
    default:
      colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
      Icon = AlertTriangle;
      label = action;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-4 py-2 gap-2 font-bold tracking-wide'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      <span>{label}</span>
    </span>
  );
};
