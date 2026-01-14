import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, RefreshCw, Filter, Wifi, WifiOff } from 'lucide-react';
import { decisionsApi } from '../services/api';
import type { Decision } from '../types';
import { ActionBadge } from '../components/ActionBadge';
import { useRealtimeUpdates } from '../hooks/useSignalR';

export function Decisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>('');

  const loadDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await decisionsApi.getAll(100);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  // Real-time updates via SignalR
  const { isConnected } = useRealtimeUpdates({
    onDecisionMade: (decision: Decision) => {
      setDecisions((prev) => [decision, ...prev.slice(0, 99)]);
    },
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredDecisions = filterUser
    ? decisions.filter((d) => d.userId.toLowerCase().includes(filterUser.toLowerCase()) ||
        d.userName?.toLowerCase().includes(filterUser.toLowerCase()))
    : decisions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Karar Logları</h1>
          <p className="text-slate-400">Sistem tarafından alınan kararları ve tetiklenen kuralları izle</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button onClick={loadDecisions} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Kullanıcı ID veya isim ile filtrele..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="input flex-1"
          />
        </div>
      </div>

      {/* Decisions List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-turkcell-yellow" />
          Karar Geçmişi ({filteredDecisions.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turkcell-yellow"></div>
          </div>
        ) : filteredDecisions.length > 0 ? (
          <div className="space-y-4">
            {filteredDecisions.map((decision) => (
              <div
                key={decision.decisionId}
                className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 font-mono">{decision.decisionId}</span>
                    </div>
                    <h4 className="text-white font-medium">{decision.userName || decision.userId}</h4>
                  </div>
                  <div className="text-right">
                    <ActionBadge action={decision.selectedAction} />
                    <p className="text-xs text-slate-500 mt-1">{formatTime(decision.timestamp)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Tetiklenen Kurallar</p>
                    <div className="flex flex-wrap gap-2">
                      {decision.triggeredRules.map((rule) => (
                        <span
                          key={rule}
                          className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded"
                        >
                          {rule}
                        </span>
                      ))}
                    </div>
                  </div>

                  {decision.suppressedActions.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Bastırılan Aksiyonlar</p>
                      <div className="flex flex-wrap gap-2">
                        {decision.suppressedActions.map((action, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded line-through"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">
            {filterUser ? 'Filtreye uygun karar bulunamadı' : 'Henüz karar yok'}
          </p>
        )}
      </div>
    </div>
  );
}
