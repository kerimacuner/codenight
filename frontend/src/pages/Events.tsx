import { useEffect, useState } from 'react';
import { Activity, Send, RefreshCw } from 'lucide-react';
import { eventsApi } from '../services/api';
import type { Event, CreateEventDto, ProcessEventResult } from '../types';
import { ActionBadge } from '../components/ActionBadge';

const services = ['Superonline', 'Paycell', 'TV+', 'Fizy', 'Game+'];
const eventTypes = ['USAGE', 'PAYMENT', 'CONTENT_CONSUMPTION'];
const units: Record<string, string[]> = {
  Superonline: ['GB', 'MB'],
  Paycell: ['TRY'],
  'TV+': ['MIN'],
  Fizy: ['MIN'],
  'Game+': ['MIN'],
};

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<ProcessEventResult | null>(null);
  
  const [formData, setFormData] = useState<CreateEventDto>({
    userId: 'U1',
    service: 'Superonline',
    eventType: 'USAGE',
    value: 1,
    unit: 'GB',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getRecent(50);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const result = await eventsApi.create(formData);
      setLastResult(result);
      await loadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      Superonline: 'text-blue-400',
      Paycell: 'text-green-400',
      'TV+': 'text-purple-400',
      Fizy: 'text-pink-400',
      'Game+': 'text-orange-400',
    };
    return colors[service] || 'text-slate-300';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Yönetimi</h1>
          <p className="text-slate-400">Yeni event gönder ve event geçmişini izle</p>
        </div>
        <button onClick={loadEvents} className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-turkcell-yellow" />
            Yeni Event Gönder
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Kullanıcı ID</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="input w-full"
              >
                {['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10'].map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Servis</label>
              <select
                value={formData.service}
                onChange={(e) => {
                  const service = e.target.value;
                  setFormData({
                    ...formData,
                    service,
                    unit: units[service]?.[0] || 'GB',
                  });
                }}
                className="input w-full"
              >
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Event Türü</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="input w-full"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Değer</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Birim</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input w-full"
                >
                  {(units[formData.service] || ['GB']).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Event Gönder
            </button>
          </form>

          {/* Last Result */}
          {lastResult && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Son İşlem Sonucu</h4>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  <span className="text-slate-400">Risk:</span>{' '}
                  <span className={
                    lastResult.userState.riskLevel === 'CRITICAL' ? 'text-red-400' :
                    lastResult.userState.riskLevel === 'HIGH' ? 'text-orange-400' :
                    lastResult.userState.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                  }>
                    {lastResult.userState.riskLevel}
                  </span>
                </p>
                {lastResult.decision && (
                  <div>
                    <p className="text-slate-400 mb-1">Tetiklenen Aksiyon:</p>
                    <ActionBadge action={lastResult.decision.selectedAction} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-turkcell-yellow" />
            Event Geçmişi
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turkcell-yellow"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                    <th className="pb-3 pr-4">Kullanıcı</th>
                    <th className="pb-3 pr-4">Servis</th>
                    <th className="pb-3 pr-4">Tür</th>
                    <th className="pb-3 pr-4">Değer</th>
                    <th className="pb-3">Zaman</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {events.map((event) => (
                    <tr key={event.eventId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 pr-4 text-white">{event.userName || event.userId}</td>
                      <td className={`py-3 pr-4 font-medium ${getServiceColor(event.service)}`}>{event.service}</td>
                      <td className="py-3 pr-4 text-slate-300">{event.eventType}</td>
                      <td className="py-3 pr-4 text-turkcell-yellow font-medium">{event.value} {event.unit}</td>
                      <td className="py-3 text-slate-500">{formatTime(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Henüz event yok</p>
          )}
        </div>
      </div>
    </div>
  );
}
