import React, { useState, useEffect } from 'react';
import StudentWidget from './StudentWidget';
import AdminWidget from './AdminWidget';
import Login from './components/Login';
import { apiClient } from './apiClient';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [user, setUser] = useState(apiClient.getUser());

  // Listen to popstate event (browser back/forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);

    // Auth events listener
    const handleAuthChange = () => {
      setIsAuthenticated(apiClient.isAuthenticated());
      setUser(apiClient.getUser());
      
      const newPath = apiClient.isAuthenticated() ? '/admin' : '/login';
      navigate(newPath);
    };

    window.addEventListener('api-unauthorized', handleAuthChange);
    window.addEventListener('api-logout', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
      window.removeEventListener('api-unauthorized', handleAuthChange);
      window.removeEventListener('api-logout', handleAuthChange);
    };
  }, []);

  // Navigation helper
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('navigate'));
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setIsAuthenticated(true);
    setUser(loggedInUser);
    navigate('/admin');
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // Simple client-side router
  const renderRoute = () => {
    if (currentPath.startsWith('/admin')) {
      if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
      }
      return <AdminWidget onLogout={handleLogout} />;
    }

    if (currentPath === '/login') {
      if (isAuthenticated) {
        return <AdminWidget onLogout={handleLogout} />;
      }
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Default route: Student View
    return <StudentWidget />;
  };

  return (
    <div>
      {/* Floating navigation options for convenience */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '30px',
        padding: '0.4rem 0.8rem',
        display: 'flex',
        gap: '0.5rem',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.75rem'
      }}>
        <button 
          onClick={() => navigate('/')} 
          style={{
            background: currentPath === '/' ? 'var(--primary)' : 'transparent',
            color: currentPath === '/' ? 'var(--primary-text)' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '20px',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Alumno
        </button>
        <button 
          onClick={() => navigate('/admin')} 
          style={{
            background: currentPath.startsWith('/admin') ? 'var(--primary)' : 'transparent',
            color: currentPath.startsWith('/admin') ? 'var(--primary-text)' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '20px',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Profesor
        </button>
      </div>

      {renderRoute()}
    </div>
  );
}
