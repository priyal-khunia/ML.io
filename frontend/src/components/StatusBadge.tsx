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
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = ArrowUpRight;
      label = 'SCALE UP';
      break;
    case 'SCALE_DOWN':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      Icon = ArrowDownRight;
      label = 'SCALE DOWN';
      break;
    case 'MAINTAIN':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      label = 'MAINTAIN';
      break;
    default:
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = AlertTriangle;
      label = action;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border font-mono ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
