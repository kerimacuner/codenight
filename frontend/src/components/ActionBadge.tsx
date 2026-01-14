interface ActionBadgeProps {
  action: string;
}

const actionConfig: Record<string, { label: string; className: string }> = {
  DATA_USAGE_WARNING: { label: 'Veri Uyarısı', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  SPEND_ALERT: { label: 'Harcama Uyarısı', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  CONTENT_SUGGESTION: { label: 'İçerik Önerisi', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  CRITICAL_ALERT: { label: 'Kritik Uyarı', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  DATA_USAGE_NUDGE: { label: 'Veri Hatırlatması', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  SPEND_NUDGE: { label: 'Harcama Hatırlatması', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  CONTENT_COOLDOWN_SUGGESTION: { label: 'Mola Önerisi', className: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
};

export function ActionBadge({ action }: ActionBadgeProps) {
  const config = actionConfig[action] || { label: action, className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  
  return (
    <span className={`badge border ${config.className}`}>
      {config.label}
    </span>
  );
}
