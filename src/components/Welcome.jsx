import React from 'react';

export default function Welcome({ onSelectRole }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-main)'
    }}>
      {/* Subtle aesthetic gym background image overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/gym_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.06, // subtle high-end watermark
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }} className="fade-in">
        
        {/* Header Logo */}
        <div style={{ marginBottom: '2.5rem' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo Nexo Gym" 
            style={{
              height: '110px',
              width: '110px',
              borderRadius: '50%',
              border: '3px solid var(--primary)',
              objectFit: 'cover',
              padding: '3px',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)'
            }} 
          />
          <h1 style={{ 
            fontSize: '2.6rem', 
            fontWeight: '900', 
            color: 'var(--primary)', 
            marginTop: '1.25rem',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            Nexo Gym
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1rem', 
            maxWidth: '520px', 
            margin: '0.5rem auto 3rem auto',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            Bienvenido al sistema de entrenamiento y gestión de Nexo Gym. Selecciona tu portal para comenzar.
          </p>
        </div>

        {/* 2 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          margin: '0 auto',
          maxWidth: '700px'
        }}>
          {/* Card 1: Alumno */}
          <div 
            onClick={() => onSelectRole('student')}
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.75rem 2rem',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="welcome-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              fontSize: '3.2rem',
              marginBottom: '1rem',
              lineHeight: '1'
            }}>
              💪
            </div>
            <h3 style={{
              fontSize: '1.45rem',
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              fontWeight: '800'
            }}>
              Portal de Alumnos
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              Busca tu nombre, consulta tu rutina diaria, observa las indicaciones del profesor y descarga tu PDF para entrenar.
            </p>
          </div>

          {/* Card 2: Profesor */}
          <div 
            onClick={() => onSelectRole('admin')}
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.75rem 2rem',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="welcome-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              fontSize: '3.2rem',
              marginBottom: '1rem',
              lineHeight: '1'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '1.45rem',
              color: 'var(--primary)',
              marginBottom: '0.75rem',
              fontWeight: '800'
            }}>
              Portal de Profesores
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              Registra alumnos, gestiona datos de contacto, diseña rutinas personalizadas a medida y edita el catálogo de ejercicios.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          Nexo Gym © {new Date().getFullYear()} - Entrena Seguro, Entrena Fuerte.
        </div>
      </div>
    </div>
  );
}
