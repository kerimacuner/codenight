import { useEffect, useState, useCallback } from 'react';
import { Wifi, CreditCard, Tv, AlertTriangle, Bell, Activity, WifiIcon, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, eventsApi, decisionsApi } from '../services/api';
import type { UserState, Event, Decision } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBadge } from '../components/ActionBadge';
import { useUserRealtimeUpdates } from '../hooks/useSignalR';
import { NotificationToast } from '../components/NotificationToast';

export function UserPortal() {
  const { user } = useAuth();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ action: string; show: boolean }>({ action: '', show: false });

  const loadData = useCallback(async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      const [stateData, eventsData, decisionsData] = await Promise.all([
        usersApi.getState(user.userId),
        eventsApi.getMy(),
        decisionsApi.getMy(),
      ]);
      setUserState(stateData);
      setEvents(eventsData);
      setDecisions(decisionsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
  }, [user?.userId, loadData]);

  // Real-time updates via SignalR for this user only
  const { isConnected } = useUserRealtimeUpdates(user?.userId, {
    onStateChanged: (state: UserState) => {
      setUserState(state);
    },
    onDecisionMade: (decision: Decision) => {
      setDecisions((prev) => [decision, ...prev.slice(0, 9)]);
      // Show notification toast
      setNotification({ action: decision.selectedAction, show: true });
    },
    onEventCreated: (event: Event) => {
      setEvents((prev) => [event, ...prev.slice(0, 9)]);
    },
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-400';
      case 'HIGH': return 'text-orange-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-emerald-400';
    }
  };

  // Decision'dan gelen mesajı kullan, yoksa varsayılan mesaj göster
  const getDecisionMessage = (decision: Decision): string => {
    if (decision.message && decision.message.trim() !== '') {
      return decision.message;
    }
    // Fallback: Kural yönetiminde mesaj tanımlanmamışsa varsayılan mesaj
    return 'Hesabınızla ilgili bir güncelleme var.';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turkcell-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Toast */}
      <NotificationToast
        action={notification.action}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz, {user?.name}</h1>
          <p className="text-slate-400">Günlük kullanım durumunuz ve bildirimleriniz</p>
        </div>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <WifiIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Canlı</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-500/10 px-3 py-1.5 rounded-full">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Bağlanıyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Internet Usage */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Wifi className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{userState?.internetTodayGb.toFixed(1)} GB</span>
          </div>
          <p className="text-slate-400 text-sm">Bugünkü İnternet</p>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((userState?.internetTodayGb || 0) / 20 * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Spending */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{userState?.spendTodayTry.toFixed(0)} ₺</span>
          </div>
          <p className="text-slate-400 text-sm">Bugünkü Harcama</p>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((userState?.spendTodayTry || 0) / 500 * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Tv className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{userState?.contentMinutesToday} dk</span>
          </div>
          <p className="text-slate-400 text-sm">İçerik Tüketimi</p>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((userState?.contentMinutesToday || 0) / 300 * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className={`w-8 h-8 ${getRiskColor(userState?.riskLevel || 'LOW')}`} />
            <span className={`text-2xl font-bold ${getRiskColor(userState?.riskLevel || 'LOW')}`}>
              {userState?.riskLevel === 'CRITICAL' ? 'Kritik' :
               userState?.riskLevel === 'HIGH' ? 'Yüksek' :
               userState?.riskLevel === 'MEDIUM' ? 'Orta' : 'Düşük'}
            </span>
          </div>
          <p className="text-slate-400 text-sm">Risk Seviyesi</p>
          <div className="mt-2">
            <RiskBadge level={userState?.riskLevel || 'LOW'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-turkcell-yellow" />
            Son Bildirimler
          </h3>
          
          {decisions.length > 0 ? (
            <div className="space-y-3">
              {decisions.slice(0, 5).map((decision) => (
                <div key={decision.decisionId} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <ActionBadge action={decision.selectedAction} />
                    <span className="text-xs text-slate-500">{formatTime(decision.timestamp)}</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {getDecisionMessage(decision)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Henüz bildirim yok</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-turkcell-yellow" />
            Son Aktiviteler
          </h3>
          
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{event.service}</p>
                    <p className="text-sm text-slate-400">{event.eventType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-turkcell-yellow font-medium">{event.value} {event.unit}</p>
                    <p className="text-xs text-slate-500">{formatTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Henüz aktivite yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
