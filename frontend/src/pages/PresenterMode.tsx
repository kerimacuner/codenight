import { useEffect, useState, useCallback, useRef } from 'react';
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
  WifiOff,
  Radio,
  Square,
  Gauge
} from 'lucide-react';
import { eventsApi, usersApi, dashboardApi, simulationApi, configApi } from '../services/api';
import type { DashboardSummary, UserState, Event, Decision, SimulationConfig, Scenario } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ActionBadge } from '../components/ActionBadge';
import { useRealtimeUpdates } from '../hooks/useSignalR';

export function PresenterMode() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [userStates, setUserStates] = useState<UserState[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>('');
  
  // Scenarios from API
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  // Simulation states
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(3);
  const [eventCount, setEventCount] = useState(0);
  const simulationRef = useRef<number | null>(null);

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

  // Load simulation config
  const loadSimulationConfig = useCallback(async () => {
    try {
      const config = await simulationApi.getConfig();
      setSimulationConfig(config);
      setSimulationSpeed(config.defaultIntervalSeconds);
    } catch (err) {
      console.error('Failed to load simulation config:', err);
    }
  }, []);

  // Load scenarios from API
  const loadScenarios = useCallback(async () => {
    try {
      const response = await configApi.getScenarios();
      setScenarios(response.scenarios);
    } catch (err) {
      console.error('Failed to load scenarios:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadSimulationConfig();
    loadScenarios();
  }, [loadData, loadSimulationConfig, loadScenarios]);

  // Generate random event based on config
  const generateRandomEvent = useCallback(async () => {
    if (!simulationConfig || userStates.length === 0) return;
    
    // Filter out admin/presenter users
    const regularUsers = userStates.filter(u => !['admin', 'presenter'].includes(u.userId));
    if (regularUsers.length === 0) return;
    
    // Random user
    const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    
    // Random service from config
    const service = simulationConfig.services[
      Math.floor(Math.random() * simulationConfig.services.length)
    ];
    
    // Mixed intensity: aggressive or normal based on probability
    const isAggressive = Math.random() < simulationConfig.aggressiveProbability;
    const min = isAggressive ? service.aggressiveMin : service.normalMin;
    const max = isAggressive ? service.aggressiveMax : service.normalMax;
    const value = min + Math.random() * (max - min);
    
    try {
      const result = await eventsApi.create({
        userId: user.userId,
        service: service.name,
        eventType: service.eventType,
        value: Math.round(value * 10) / 10,
        unit: service.unit,
      });
      
      setEventCount(prev => prev + 1);
      
      if (result.decision) {
        setLastAction(result.decision.selectedAction);
      }
    } catch (err) {
      console.error('Failed to generate event:', err);
    }
  }, [simulationConfig, userStates]);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (simulationRef.current) return;
    
    setIsSimulating(true);
    setEventCount(0);
    
    // Generate first event immediately
    generateRandomEvent();
    
    // Set up interval
    simulationRef.current = window.setInterval(() => {
      generateRandomEvent();
    }, simulationSpeed * 1000);
  }, [generateRandomEvent, simulationSpeed]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // Update interval when speed changes during simulation
  useEffect(() => {
    if (isSimulating && simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = window.setInterval(() => {
        generateRandomEvent();
      }, simulationSpeed * 1000);
    }
  }, [simulationSpeed, isSimulating, generateRandomEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

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
          {scenarios.map((scenario) => (
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

      {/* Auto Simulation Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Radio className={`w-5 h-5 ${isSimulating ? 'text-red-400 animate-pulse' : 'text-turkcell-yellow'}`} />
          Otomatik Simülasyon
          {isSimulating && (
            <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
              CANLI
            </span>
          )}
        </h3>
        
        {simulationConfig ? (
          <div className="space-y-4">
            {/* Speed Slider */}
            <div className="flex items-center gap-4">
              <Gauge className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Event Aralığı</span>
                  <span className="text-sm text-turkcell-yellow font-mono">{simulationSpeed} saniye</span>
                </div>
                <input
                  type="range"
                  min={simulationConfig.minIntervalSeconds}
                  max={simulationConfig.maxIntervalSeconds}
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-turkcell-yellow"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>{simulationConfig.minIntervalSeconds}s (Hızlı)</span>
                  <span>{simulationConfig.maxIntervalSeconds}s (Yavaş)</span>
                </div>
              </div>
            </div>

            {/* Simulation Info */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div>
                <span className="text-slate-500">Servisler:</span>{' '}
                <span className="text-white">{simulationConfig.services.map(s => s.name).join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500">Agresif Olasılık:</span>{' '}
                <span className="text-orange-400">{(simulationConfig.aggressiveProbability * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!isSimulating ? (
                <button
                  onClick={startSimulation}
                  disabled={loading || runningScenario !== null}
                  className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Play className="w-4 h-4" />
                  Simülasyonu Başlat
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Square className="w-4 h-4" />
                  Simülasyonu Durdur
                </button>
              )}
              
              {isSimulating && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-sm font-medium">Çalışıyor</span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    | Gönderilen Event: <span className="text-turkcell-yellow font-mono">{eventCount}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">Simülasyon konfigürasyonu yükleniyor...</div>
        )}
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
