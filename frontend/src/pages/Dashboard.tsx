import { useEffect, useState, useCallback } from 'react';
import { Users, Activity, ClipboardList, BookOpen, TrendingUp, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardSummary, Event, Decision } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBadge } from '../components/ActionBadge';
import { useRealtimeUpdates } from '../hooks/useSignalR';

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError('Dashboard verileri yüklenemedi. Backend çalışıyor mu?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Real-time updates via SignalR
  const { isConnected } = useRealtimeUpdates({
    onEventCreated: (event: Event) => {
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalEventsToday: prev.totalEventsToday + 1,
          recentEvents: [event, ...prev.recentEvents.slice(0, 9)],
        };
      });
    },
    onDecisionMade: (decision: Decision) => {
      setSummary((prev) => {
        if (!prev) return prev;
        const newActionCounts = { ...prev.actionCountsToday };
        newActionCounts[decision.selectedAction] = (newActionCounts[decision.selectedAction] || 0) + 1;
        return {
          ...prev,
          totalDecisionsToday: prev.totalDecisionsToday + 1,
          actionCountsToday: newActionCounts,
          recentDecisions: [decision, ...prev.recentDecisions.slice(0, 9)],
        };
      });
    },
    onDashboardUpdate: () => {
      loadSummary();
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turkcell-yellow"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-500/10 border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Turkcell Decision Engine - Gerçek Zamanlı İzleme</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Wifi className="w-4 h-4" />
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={summary.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Bugünkü Event"
          value={summary.totalEventsToday}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Bugünkü Karar"
          value={summary.totalDecisionsToday}
          icon={ClipboardList}
          color="orange"
        />
        <StatCard
          title="Aktif Kural"
          value={summary.activeRules}
          icon={BookOpen}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-turkcell-yellow" />
            Risk Dağılımı
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.riskLevelDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <RiskBadge level={level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} />
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        level === 'LOW' ? 'bg-emerald-500' :
                        level === 'MEDIUM' ? 'bg-yellow-500' :
                        level === 'HIGH' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(count / summary.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Counts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-turkcell-yellow" />
            Bugünkü Aksiyonlar
          </h3>
          {Object.keys(summary.actionCountsToday).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(summary.actionCountsToday).map(([action, count]) => (
                <div key={action} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <ActionBadge action={action} />
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Bugün henüz aksiyon yok</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Son Eventler</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {summary.recentEvents.length > 0 ? (
              summary.recentEvents.map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-white font-medium">{event.userName || event.userId}</p>
                    <p className="text-sm text-slate-400">
                      {event.service} • {event.eventType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-turkcell-yellow font-semibold">{event.value} {event.unit}</p>
                    <p className="text-xs text-slate-500">{formatTime(event.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">Henüz event yok</p>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Son Kararlar</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {summary.recentDecisions.length > 0 ? (
              summary.recentDecisions.map((decision) => (
                <div key={decision.decisionId} className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{decision.userName || decision.userId}</p>
                    <p className="text-xs text-slate-500">{formatTime(decision.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionBadge action={decision.selectedAction} />
                    {decision.triggeredRules.map((rule) => (
                      <span key={rule} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">Henüz karar yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
