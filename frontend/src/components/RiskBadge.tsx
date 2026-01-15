import { useConfig } from '../contexts/ConfigContext';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const colorClasses: Record<string, string> = {
  green: 'badge-low',
  yellow: 'badge-medium',
  orange: 'badge-high',
  red: 'badge-critical',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const { getRiskLabel } = useConfig();
  const config = getRiskLabel(level);
  const className = colorClasses[config.color] || colorClasses.slate;
  
  return (
    <span className={`badge ${className}`}>
      {config.label}
    </span>
  );
}
