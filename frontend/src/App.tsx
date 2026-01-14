import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { Users } from './pages/Users';
import { Rules } from './pages/Rules';
import { Decisions } from './pages/Decisions';
import { UserPortal } from './pages/UserPortal';
import { AdminPanel } from './pages/AdminPanel';
import { PresenterMode } from './pages/PresenterMode';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Admin & Presenter */}
          <Route
            path="/"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <Events />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <Rules />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/decisions"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <Decisions />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['Admin']}>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Presenter Mode */}
          <Route
            path="/presenter"
            element={
              <ProtectedRoute roles={['Admin', 'Presenter']}>
                <Layout>
                  <PresenterMode />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* User Portal */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserPortal />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
