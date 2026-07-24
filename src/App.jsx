import React, { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
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
      navigate('/');
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
    navigate('/');
  };

  // Simple client-side router
  const renderRoute = () => {
    if (currentPath === '/alumnos') {
      return <StudentWidget onBack={() => navigate('/')} />;
    }

    if (currentPath === '/admin') {
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

    // Default route: Welcome Screen
    return <Welcome onSelectRole={(role) => navigate(role === 'student' ? '/alumnos' : '/admin')} />;
  };

  return (
    <div>
      {renderRoute()}
    </div>
  );
}
