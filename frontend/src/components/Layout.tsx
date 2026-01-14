import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  BookOpen, 
  ClipboardList,
  Zap,
  LogOut,
  User,
  Presentation,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define nav items based on role
  const getNavItems = () => {
    const items = [];

    if (hasRole(['Admin', 'Presenter'])) {
      items.push(
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/events', label: 'Events', icon: Activity },
        { path: '/users', label: 'Kullanıcılar', icon: Users },
        { path: '/rules', label: 'Kurallar', icon: BookOpen },
        { path: '/decisions', label: 'Kararlar', icon: ClipboardList }
      );
    }

    if (hasRole('Admin')) {
      items.push({ path: '/admin', label: 'Admin Panel', icon: Shield });
    }

    if (hasRole(['Admin', 'Presenter'])) {
      items.push({ path: '/presenter', label: 'Sunum Modu', icon: Presentation });
    }

    if (hasRole('User')) {
      items.push({ path: '/portal', label: 'Portalım', icon: User });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-turkcell-yellow rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-turkcell-dark" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Turkcell</h1>
              <p className="text-xs text-slate-400">Decision Engine</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-turkcell-yellow text-turkcell-dark font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
          <div className="text-center mt-4">
            <p className="text-xs text-slate-500">Codenight 2026</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
