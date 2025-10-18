import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/App.css';

// Component để kiểm tra có nên hiển thị Navigation hay không
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ẩn Navigation trên các trang đăng nhập và đăng ký
  const hideNavigation = ['/login', '/register'].includes(location.pathname);

  const handleLogin = (user) => {
    // Lưu user vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Chuyển sang dashboard
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="App">
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth onLogin={handleLogin} />} />
        <Route path="/register" element={<Auth onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/profile" element={<ProtectedRoute component={<Profile />} />} />
        <Route path="/settings" element={<ProtectedRoute component={<Settings />} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};


// Wrapper để lấy user từ localStorage và truyền vào Dashboard
function DashboardWrapper() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  return <Dashboard user={user} onNavigate={() => {}} onSuggestQuestion={() => {}} />;
}

// Generic protected route wrapper for simple pages
function ProtectedRoute({ component }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);
  if (!user) return null;
  return component;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
