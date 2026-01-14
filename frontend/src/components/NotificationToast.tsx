import { useEffect, useState } from 'react';
import { Bell, X, AlertTriangle, Wifi, CreditCard, Tv, Zap } from 'lucide-react';

interface NotificationToastProps {
  action: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

const getActionConfig = (action: string) => {
  switch (action) {
    case 'DATA_USAGE_WARNING':
      return {
        icon: Wifi,
        color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        iconColor: 'text-blue-400',
        title: 'İnternet Kullanım Uyarısı',
        message: 'Günlük internet kullanımınız yüksek seviyeye ulaştı.',
      };
    case 'DATA_USAGE_NUDGE':
      return {
        icon: Wifi,
        color: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
        iconColor: 'text-blue-300',
        title: 'İnternet Kullanım Bildirimi',
        message: 'İnternet kullanımınız artıyor. Kotanızı takip etmeyi unutmayın.',
      };
    case 'SPEND_ALERT':
      return {
        icon: CreditCard,
        color: 'bg-green-500/20 border-green-500/50 text-green-400',
        iconColor: 'text-green-400',
        title: 'Harcama Uyarısı',
        message: 'Bugünkü harcamalarınız belirlenen limiti aştı.',
      };
    case 'SPEND_NUDGE':
      return {
        icon: CreditCard,
        color: 'bg-green-500/10 border-green-500/30 text-green-300',
        iconColor: 'text-green-300',
        title: 'Harcama Bildirimi',
        message: 'Harcamalarınız orta seviyede. Bütçenizi gözden geçirin.',
      };
    case 'CONTENT_SUGGESTION':
      return {
        icon: Tv,
        color: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
        iconColor: 'text-purple-400',
        title: 'İçerik Önerisi',
        message: 'Yoğun içerik tüketimi yaptınız. Ara vermenizi öneririz.',
      };
    case 'CONTENT_COOLDOWN_SUGGESTION':
      return {
        icon: Tv,
        color: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        iconColor: 'text-purple-300',
        title: 'Mola Önerisi',
        message: 'Uzun süredir içerik tüketiyorsunuz. Kısa bir mola verin.',
      };
    case 'CRITICAL_ALERT':
      return {
        icon: AlertTriangle,
        color: 'bg-red-500/20 border-red-500/50 text-red-400',
        iconColor: 'text-red-400',
        title: 'Kritik Uyarı!',
        message: 'Kullanımınız kritik seviyede. Limitlerinizi kontrol edin.',
      };
    default:
      return {
        icon: Bell,
        color: 'bg-turkcell-yellow/20 border-turkcell-yellow/50 text-turkcell-yellow',
        iconColor: 'text-turkcell-yellow',
        title: 'Bildirim',
        message: 'Turkcell size önemli bir bildirim gönderiyor.',
      };
  }
};

export function NotificationToast({ action, show, onClose, duration = 5000 }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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

  const config = getActionConfig(action);
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${config.color}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white/10 ${config.iconColor}`}>
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
            <p className="text-sm text-slate-300 mt-1">{config.message}</p>
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
