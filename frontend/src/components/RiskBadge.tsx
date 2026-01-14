interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const riskConfig = {
  LOW: { label: 'Düşük', className: 'badge-low' },
  MEDIUM: { label: 'Orta', className: 'badge-medium' },
  HIGH: { label: 'Yüksek', className: 'badge-high' },
  CRITICAL: { label: 'Kritik', className: 'badge-critical' },
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const config = riskConfig[level] || riskConfig.LOW;
  
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}
