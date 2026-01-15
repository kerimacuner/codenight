import { useConfig } from '../contexts/ConfigContext';

interface ActionBadgeProps {
  action: string;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function ActionBadge({ action }: ActionBadgeProps) {
  const { getActionLabel } = useConfig();
  const config = getActionLabel(action);
  const className = colorClasses[config.color] || colorClasses.slate;
  
  return (
    <span className={`badge border ${className}`}>
      {config.label}
    </span>
  );
}
