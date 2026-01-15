import { useEffect, useState } from 'react';
import { Bell, X, AlertTriangle, Wifi, CreditCard, Tv, Zap } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface NotificationToastProps {
  action: string;
  message?: string; // Kuraldan gelen özel mesaj
  show: boolean;
  onClose: () => void;
  duration?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DATA_USAGE_WARNING: Wifi,
  DATA_USAGE_NUDGE: Wifi,
  SPEND_ALERT: CreditCard,
  SPEND_NUDGE: CreditCard,
  CONTENT_SUGGESTION: Tv,
  CONTENT_COOLDOWN_SUGGESTION: Tv,
  CRITICAL_ALERT: AlertTriangle,
};

const colorClasses: Record<string, { container: string; icon: string }> = {
  blue: { 
    container: 'bg-blue-500/20 border-blue-500/50 text-blue-400', 
    icon: 'text-blue-400' 
  },
  cyan: { 
    container: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400', 
    icon: 'text-cyan-400' 
  },
  orange: { 
    container: 'bg-orange-500/20 border-orange-500/50 text-orange-400', 
    icon: 'text-orange-400' 
  },
  amber: { 
    container: 'bg-amber-500/20 border-amber-500/50 text-amber-400', 
    icon: 'text-amber-400' 
  },
  green: { 
    container: 'bg-green-500/20 border-green-500/50 text-green-400', 
    icon: 'text-green-400' 
  },
  purple: { 
    container: 'bg-purple-500/20 border-purple-500/50 text-purple-400', 
    icon: 'text-purple-400' 
  },
  pink: { 
    container: 'bg-pink-500/20 border-pink-500/50 text-pink-400', 
    icon: 'text-pink-400' 
  },
  red: { 
    container: 'bg-red-500/20 border-red-500/50 text-red-400', 
    icon: 'text-red-400' 
  },
  yellow: { 
    container: 'bg-turkcell-yellow/20 border-turkcell-yellow/50 text-turkcell-yellow', 
    icon: 'text-turkcell-yellow' 
  },
  slate: { 
    container: 'bg-slate-500/20 border-slate-500/50 text-slate-400', 
    icon: 'text-slate-400' 
  },
};

export function NotificationToast({ action, message, show, onClose, duration = 5000 }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { getActionLabel, uiConfig } = useConfig();

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsLeaving(false);

      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible || !action) return null;

  const config = getActionLabel(action);
  const Icon = iconMap[action] || Bell;
  const colors = colorClasses[config.color] || colorClasses.yellow;
  
  // Kuraldan gelen mesaj varsa onu kullan, yoksa config'den al
  const displayMessage = message && message.trim() !== '' 
    ? message 
    : config.defaultMessage || uiConfig?.fallbackMessage || 'Hesabınızla ilgili bir güncelleme var.';

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${colors.container}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white/10 ${colors.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">{config.title}</h4>
              <button
                onClick={() => {
                  setIsLeaving(true);
                  setTimeout(() => {
                    setIsVisible(false);
                    onClose();
                  }, 300);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 mt-1">{displayMessage}</p>
            <div className="flex items-center gap-2 mt-2">
              <Zap className="w-3 h-3 text-turkcell-yellow" />
              <span className="text-xs text-slate-400">Az önce</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
