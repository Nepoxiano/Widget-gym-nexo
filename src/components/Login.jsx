import React, { useState } from 'react';
import { apiClient } from '../apiClient';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.post('/api/auth/login', { username, password });
      apiClient.setToken(data.token, data.user);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '1rem'
    }}>
      <div className="glass-panel fade-in" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        {/* Gym Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <img 
            src="/logo.jpg" 
            alt="Nexo Gym Logo" 
            style={{
              height: '90px',
              width: '90px',
              borderRadius: '50%',
              border: '2px solid var(--primary)',
              objectFit: 'cover',
              padding: '2px',
              background: '#ffffff'
            }} 
          />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
          NEXO GYM
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Panel de Administración de Profesores
        </p>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.75rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y" style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              className="input-control"
              placeholder="Ej: talia"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input-control"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
