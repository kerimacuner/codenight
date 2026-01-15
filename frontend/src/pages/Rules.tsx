import { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Save, RefreshCw } from 'lucide-react';
import { rulesApi } from '../services/api';
import type { Rule, CreateRuleDto } from '../types';
import { ActionBadge } from '../components/ActionBadge';

const actionTypes = ['DATA_USAGE_WARNING', 'SPEND_ALERT', 'CONTENT_SUGGESTION', 'CRITICAL_ALERT', 'DATA_USAGE_NUDGE', 'SPEND_NUDGE', 'CONTENT_COOLDOWN_SUGGESTION'];

interface RuleFormData {
  ruleId?: string;
  condition: string;
  action: string;
  message: string;
  priority: number;
  isActive: boolean;
}

const initialFormData: RuleFormData = {
  condition: '',
  action: 'DATA_USAGE_WARNING',
  message: '',
  priority: 1,
  isActive: true,
};

export function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await rulesApi.getAll();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      ruleId: rule.ruleId,
      condition: rule.condition,
      action: rule.action,
      message: rule.message || '',
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingRule) {
        await rulesApi.update(editingRule.ruleId, formData);
      } else {
        await rulesApi.create(formData as CreateRuleDto);
      }
      await loadRules();
      closeModal();
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Bu kuralı silmek istediğinize emin misiniz?')) return;
    
    try {
      await rulesApi.delete(ruleId);
      await loadRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleToggle = async (ruleId: string) => {
    try {
      await rulesApi.toggle(ruleId);
      await loadRules();
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kural Yönetimi</h1>
          <p className="text-slate-400">Karar motorunun kurallarını yönet</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadRules} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Kural
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-turkcell-yellow" />
          Tanımlı Kurallar ({rules.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turkcell-yellow"></div>
          </div>
        ) : rules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="pb-3 pr-4">Kural ID</th>
                  <th className="pb-3 pr-4">Koşul</th>
                  <th className="pb-3 pr-4">Aksiyon</th>
                  <th className="pb-3 pr-4">Kullanıcı Mesajı</th>
                  <th className="pb-3 pr-4">Öncelik</th>
                  <th className="pb-3 pr-4">Durum</th>
                  <th className="pb-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rules.map((rule) => (
                  <tr key={rule.ruleId} className={`border-b border-slate-800/50 ${!rule.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-4 pr-4">
                      <span className="text-turkcell-yellow font-mono">{rule.ruleId}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <code className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                        {rule.condition}
                      </code>
                    </td>
                    <td className="py-4 pr-4">
                      <ActionBadge action={rule.action} />
                    </td>
                    <td className="py-4 pr-4 max-w-xs">
                      <p className="text-slate-300 text-xs truncate" title={rule.message || 'Mesaj tanımlanmamış'}>
                        {rule.message || <span className="text-slate-500 italic">Mesaj yok</span>}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        rule.priority === 1 ? 'bg-red-500/20 text-red-400' :
                        rule.priority === 2 ? 'bg-orange-500/20 text-orange-400' :
                        rule.priority === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {rule.priority}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <button
                        onClick={() => handleToggle(rule.ruleId)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        {rule.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-emerald-400" />
                            <span className="text-emerald-400">Aktif</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-slate-500" />
                            <span className="text-slate-500">Pasif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.ruleId)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Henüz kural tanımlanmamış</p>
        )}
      </div>

      {/* Condition Help */}
      <div className="card bg-slate-800/30">
        <h4 className="text-white font-medium mb-3">Koşul Yazım Yardımı</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-2">Kullanılabilir Değişkenler:</p>
            <ul className="space-y-1 text-slate-300">
              <li><code className="text-turkcell-yellow">internet_today_gb</code> - Günlük internet (GB)</li>
              <li><code className="text-turkcell-yellow">spend_today_try</code> - Günlük harcama (TRY)</li>
              <li><code className="text-turkcell-yellow">content_minutes_today</code> - İçerik süresi (dk)</li>
            </ul>
          </div>
          <div>
            <p className="text-slate-400 mb-2">Örnek Koşullar:</p>
            <ul className="space-y-1 text-slate-300">
              <li><code className="text-xs bg-slate-700 px-2 py-1 rounded">internet_today_gb {'>'} 10</code></li>
              <li><code className="text-xs bg-slate-700 px-2 py-1 rounded">spend_today_try {'>'} 200</code></li>
              <li><code className="text-xs bg-slate-700 px-2 py-1 rounded">internet_today_gb {'>'} 15 && spend_today_try {'>'} 300</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingRule ? 'Kuralı Düzenle' : 'Yeni Kural'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!editingRule && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Kural ID (opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.ruleId || ''}
                    onChange={(e) => setFormData({ ...formData, ruleId: e.target.value })}
                    placeholder="R-XX (boş bırakılırsa otomatik)"
                    className="input w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">Koşul *</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="örn: internet_today_gb > 10"
                  className="input w-full font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Aksiyon *</label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="input w-full"
                >
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Kullanıcı Mesajı *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Bu kural tetiklendiğinde kullanıcıya gösterilecek mesaj"
                  rows={3}
                  className="input w-full resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">Bu mesaj kullanıcı portalında gösterilecektir.</p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Öncelik (1 = en yüksek)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="input w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-turkcell-yellow focus:ring-turkcell-yellow"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">Aktif</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-700">
              <button onClick={closeModal} className="btn-secondary">
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.condition || !formData.message}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
