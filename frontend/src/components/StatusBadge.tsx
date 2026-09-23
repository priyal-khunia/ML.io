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
      colorClasses = 'bg-[#E76F6F]/15 text-[#E76F6F] border-[#E76F6F]/30';
      Icon = ArrowUpRight;
      label = 'SCALE UP';
      break;
    case 'SCALE_DOWN':
      colorClasses = 'bg-[#5B9CF6]/15 text-[#5B9CF6] border-[#5B9CF6]/30';
      Icon = ArrowDownRight;
      label = 'SCALE DOWN';
      break;
    case 'MAINTAIN':
      colorClasses = 'bg-[#35B99A]/15 text-[#35B99A] border-[#35B99A]/30';
      Icon = CheckCircle2;
      label = 'MAINTAIN';
      break;
    default:
      colorClasses = 'bg-[#E7A83B]/15 text-[#E7A83B] border-[#E7A83B]/30';
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
