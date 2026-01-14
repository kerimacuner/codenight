import { useEffect, useState } from 'react';
import { Users as UsersIcon, RefreshCw, Wifi, CreditCard, Tv } from 'lucide-react';
import { usersApi } from '../services/api';
import type { UserState } from '../types';
import { RiskBadge } from '../components/RiskBadge';

export function Users() {
  const [users, setUsers] = useState<UserState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserState | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kullanıcılar</h1>
          <p className="text-slate-400">Kullanıcı durumlarını ve risk seviyelerini izle</p>
        </div>
        <button onClick={loadUsers} className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-turkcell-yellow" />
            Kullanıcı Listesi
          </h3>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turkcell-yellow"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedUser?.userId === user.userId
                      ? 'bg-turkcell-yellow/10 border-turkcell-yellow/50'
                      : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{user.userName || user.userId}</h4>
                      <p className="text-sm text-slate-400">{user.city || 'Bilinmiyor'}</p>
                    </div>
                    <RiskBadge level={user.riskLevel} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <p className="text-turkcell-yellow font-semibold">{user.internetTodayGb.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">GB</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <p className="text-turkcell-yellow font-semibold">{user.spendTodayTry.toFixed(0)}</p>
                      <p className="text-xs text-slate-500">TRY</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <p className="text-turkcell-yellow font-semibold">{user.contentMinutesToday}</p>
                      <p className="text-xs text-slate-500">dk</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Detail */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Kullanıcı Detayı</h3>
          
          {selectedUser ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-slate-700/50">
                <div className="w-16 h-16 bg-turkcell-yellow rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-turkcell-dark">
                    {selectedUser.userName?.charAt(0) || selectedUser.userId.charAt(0)}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-white">{selectedUser.userName || selectedUser.userId}</h4>
                <p className="text-slate-400">{selectedUser.city}</p>
                <div className="mt-2">
                  <RiskBadge level={selectedUser.riskLevel} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">İnternet Kullanımı</p>
                    <p className="text-lg font-semibold text-white">{selectedUser.internetTodayGb.toFixed(2)} GB</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">Günlük Harcama</p>
                    <p className="text-lg font-semibold text-white">{selectedUser.spendTodayTry.toFixed(2)} TRY</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <Tv className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">İçerik Tüketimi</p>
                    <p className="text-lg font-semibold text-white">{selectedUser.contentMinutesToday} dakika</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 text-center">
                <p className="text-xs text-slate-500">Son güncelleme</p>
                <p className="text-sm text-slate-400">{formatTime(selectedUser.lastUpdated)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Detay görüntülemek için bir kullanıcı seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
