import { useEffect, useState } from 'react';
import { Shield, UserPlus, Trash2, Edit, RefreshCw, X } from 'lucide-react';
import { usersApi } from '../services/api';
import type { User, CreateUserDto } from '../types';

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    userId: '',
    name: '',
    city: '',
    email: '',
    password: '',
    role: 'User',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getList();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.userId, {
          name: formData.name,
          city: formData.city,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
        });
        setSuccess('Kullanıcı güncellendi');
      } else {
        await usersApi.create(formData);
        setSuccess('Kullanıcı oluşturuldu');
      }
      
      await loadUsers();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await usersApi.delete(userId);
      setSuccess('Kullanıcı silindi');
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      userId: user.userId,
      name: user.name,
      city: user.city,
      email: user.email || '',
      password: '',
      role: user.role || 'User',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      userId: '',
      name: '',
      city: '',
      email: '',
      password: '',
      role: 'User',
    });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Presenter':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-turkcell-yellow" />
            Admin Panel
          </h1>
          <p className="text-slate-400">Kullanıcı yönetimi ve sistem ayarları</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadUsers} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
          {success}
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Kullanıcı ID</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input w-full"
                  disabled={!!editingUser}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Şehir</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  {editingUser ? 'Yeni Şifre (boş bırakılabilir)' : 'Şifre'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="User">User</option>
                  <option value="Presenter">Presenter</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  İptal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingUser ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Kullanıcı Listesi ({users.length})</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turkcell-yellow"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Ad Soyad</th>
                  <th className="pb-3 pr-4">Şehir</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Rol</th>
                  <th className="pb-3">İşlemler</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((user) => (
                  <tr key={user.userId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="py-3 pr-4 text-turkcell-yellow font-mono">{user.userId}</td>
                    <td className="py-3 pr-4 text-white">{user.name}</td>
                    <td className="py-3 pr-4 text-slate-300">{user.city}</td>
                    <td className="py-3 pr-4 text-slate-400">{user.email || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge border ${getRoleBadge(user.role)}`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.userId)}
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
        )}
      </div>
    </div>
  );
}
