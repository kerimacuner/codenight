import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ userId, password });
      
      // Redirect based on role
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (response.role) {
          case 'Admin':
            navigate('/admin', { replace: true });
            break;
          case 'Presenter':
            navigate('/presenter', { replace: true });
            break;
          default:
            navigate('/portal', { replace: true });
        }
      }
    } catch (err) {
      setError('Geçersiz kullanıcı adı veya şifre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-turkcell-yellow rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Turkcell</h1>
          <p className="text-slate-400">Decision Engine</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Giriş Yap</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Kullanıcı ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="input w-full"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-slate-900"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-500 text-center mb-3">Demo Hesapları</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Admin:</span>
                <span className="font-mono">admin / admin123</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Presenter:</span>
                <span className="font-mono">presenter / presenter123</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>User:</span>
                <span className="font-mono">U1 / 123456</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          Codenight 2026
        </p>
      </div>
    </div>
  );
}
