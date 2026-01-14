import { useEffect, useState, useCallback } from 'react';
import { 
  Presentation, 
  Play, 
  RotateCcw, 
  Zap, 
  Users,
  Activity,
  AlertTriangle,
  Maximize,
  Minimize,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { eventsApi, usersApi, dashboardApi } from '../services/api';
import type { DashboardSummary, CreateEventDto, UserState, Event, Decision } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBadge } from '../components/ActionBadge';
import { useRealtimeUpdates } from '../hooks/useSignalR';

interface Scenario {
  id: string;
  name: string;
  description: string;
  events: Omit<CreateEventDto, 'eventId' | 'timestamp'>[];
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'high-usage',
    name: 'Yüksek İnternet',
    description: 'Kullanıcının internet kotasını hızla tüketir',
    events: [
      { userId: 'U1', service: 'Superonline', eventType: 'DATA_USAGE', value: 5, unit: 'GB' },
      { userId: 'U1', service: 'Superonline', eventType: 'DATA_USAGE', value: 8, unit: 'GB' },
    ],
    color: 'blue',
  },
  {
    id: 'spending-spree',
    name: 'Yüksek Harcama',
    description: 'Kullanıcının harcama limitini aşar',
    events: [
      { userId: 'U2', service: 'Paycell', eventType: 'PAYMENT', value: 150, unit: 'TRY' },
      { userId: 'U2', service: 'Paycell', eventType: 'PAYMENT', value: 200, unit: 'TRY' },
    ],
    color: 'green',
  },
  {
    id: 'content-binge',
    name: 'İçerik Maratonu',
    description: 'Kullanıcının yoğun içerik tüketimi',
    events: [
      { userId: 'U3', service: 'TV+', eventType: 'STREAMING', value: 120, unit: 'MIN' },
      { userId: 'U3', service: 'Fizy', eventType: 'STREAMING', value: 90, unit: 'MIN' },
    ],
    color: 'purple',
  },
  {
    id: 'critical-user',
    name: 'Kritik Kullanıcı',
    description: 'Tüm limitleri aşan kritik senaryo',
    events: [
      { userId: 'U4', service: 'Superonline', eventType: 'DATA_USAGE', value: 18, unit: 'GB' },
      { userId: 'U4', service: 'Paycell', eventType: 'PAYMENT', value: 350, unit: 'TRY' },
      { userId: 'U4', service: 'TV+', eventType: 'STREAMING', value: 180, unit: 'MIN' },
    ],
    color: 'red',
  },
];

export function PresenterMode() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [userStates, setUserStates] = useState<UserState[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, usersData] = await Promise.all([
        dashboardApi.getSummary(),
        usersApi.getAll(),
      ]);
      setSummary(summaryData);
      setUserStates(usersData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setLastAction(decision.selectedAction);
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
    onUserStateChanged: (state: UserState) => {
      setUserStates((prev) => 
        prev.map((s) => (s.userId === state.userId ? { ...s, ...state } : s))
      );
    },
    onDashboardUpdate: () => {
      loadData();
    },
  });

  const runScenario = async (scenario: Scenario) => {
    setRunningScenario(scenario.id);
    setLoading(true);
    
    try {
      for (const event of scenario.events) {
        const result = await eventsApi.create({
          ...event,
          eventId: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
        
        if (result.decision) {
          setLastAction(result.decision.selectedAction);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      // Data will be updated via SignalR, no need to reload
    } catch (err) {
      console.error('Scenario failed:', err);
    } finally {
      setRunningScenario(null);
      setLoading(false);
    }
  };

  const handleResetDaily = async () => {
    setLoading(true);
    try {
      await usersApi.resetDaily();
      setLastAction('Günlük veriler sıfırlandı');
      // Data will be updated via SignalR
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getScenarioColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30';
      case 'green': return 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30';
      case 'purple': return 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30';
      case 'red': return 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30';
      default: return 'bg-slate-500/20 border-slate-500/30 hover:bg-slate-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Presentation className="w-8 h-8 text-turkcell-yellow" />
            Sunum Modu
          </h1>
          <p className="text-slate-400">Demo kontrol paneli ve canlı dashboard</p>
        </div>
        <div className="flex gap-3">
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
          <button onClick={toggleFullscreen} className="btn-secondary flex items-center gap-2">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            {isFullscreen ? 'Çıkış' : 'Tam Ekran'}
          </button>
        </div>
      </div>

      {/* Last Action Banner */}
      {lastAction && (
        <div className="p-4 bg-turkcell-yellow/20 border border-turkcell-yellow/30 rounded-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-turkcell-yellow" />
            <span className="text-white">Son Aksiyon:</span>
            <ActionBadge action={lastAction} />
          </div>
          <button onClick={() => setLastAction('')} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Demo Control Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-turkcell-yellow" />
          Demo Senaryoları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => runScenario(scenario)}
              disabled={loading || runningScenario !== null}
              className={`p-4 rounded-xl border transition-all text-left ${getScenarioColor(scenario.color)} ${
                runningScenario === scenario.id ? 'ring-2 ring-turkcell-yellow' : ''
              } disabled:opacity-50`}
            >
              <h4 className="font-semibold text-white mb-1">{scenario.name}</h4>
              <p className="text-sm text-slate-400">{scenario.description}</p>
              {runningScenario === scenario.id && (
                <div className="mt-2 flex items-center gap-2 text-turkcell-yellow">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-turkcell-yellow"></div>
                  <span className="text-sm">Çalışıyor...</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={handleResetDaily}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Günlük Verileri Sıfırla
          </button>
          <button onClick={loadData} disabled={loading} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-white">{summary?.totalUsers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Bugünkü Eventler</p>
              <p className="text-3xl font-bold text-white">{summary?.totalEventsToday || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Bugünkü Kararlar</p>
              <p className="text-3xl font-bold text-white">{summary?.totalDecisionsToday || 0}</p>
            </div>
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Aktif Kurallar</p>
              <p className="text-3xl font-bold text-white">{summary?.activeRules || 0}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* User States Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Kullanıcı Durumları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {userStates.map((state) => (
            <div
              key={state.userId}
              className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 transition-all hover:border-slate-600/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-turkcell-yellow">{state.userId}</span>
                <RiskBadge level={state.riskLevel} />
              </div>
              <p className="text-sm text-white mb-2">{state.userName}</p>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>İnternet:</span>
                  <span className="text-blue-400">{state.internetTodayGb.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Harcama:</span>
                  <span className="text-green-400">{state.spendTodayTry.toFixed(0)} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span>İçerik:</span>
                  <span className="text-purple-400">{state.contentMinutesToday} dk</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Son Eventler</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary?.recentEvents.map((event) => (
              <div key={event.eventId} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-turkcell-yellow font-mono text-sm">{event.userId}</span>
                  <span className="text-white">{event.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{event.value} {event.unit}</span>
                  <span className="text-xs text-slate-500">{formatTime(event.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Son Kararlar</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary?.recentDecisions.map((decision) => (
              <div key={decision.decisionId} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-turkcell-yellow font-mono text-sm">{decision.userId}</span>
                  <ActionBadge action={decision.selectedAction} />
                </div>
                <span className="text-xs text-slate-500">{formatTime(decision.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
