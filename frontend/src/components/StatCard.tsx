import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'yellow' | 'blue' | 'green' | 'red' | 'orange';
}

const colorClasses = {
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
};

const iconColorClasses = {
  yellow: 'text-yellow-400',
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  red: 'text-red-400',
  orange: 'text-orange-400',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'yellow' }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center ${iconColorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
