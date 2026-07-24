import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export default function StudentWidget({ onBack }) {
  const [alumnos, setAlumnos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumnoId, setSelectedAlumnoId] = useState(
    localStorage.getItem('nexo_selected_student') || ''
  );
  
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeStudentRoutine, setActiveStudentRoutine] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial search list and exercises list
  useEffect(() => {
    async function loadInitialData() {
      setSearchLoading(true);
      try {
        const dataAlumnos = await apiClient.get('/api/alumnos/search');
        setAlumnos(dataAlumnos);
        
        const dataEjercicios = await apiClient.get('/api/ejercicios');
        setEjercicios(dataEjercicios);
      } catch (err) {
        console.error('Error loading search list:', err);
      } finally {
        setSearchLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Load routine and student details when selected student ID changes
  useEffect(() => {
    if (!selectedAlumnoId) {
      localStorage.removeItem('nexo_selected_student');
      setActiveStudent(null);
      setActiveStudentRoutine([]);
      setCompletedExercises({});
      setActiveTab('');
      return;
    }

    async function loadStudentRoutine() {
      setLoading(true);
      try {
        localStorage.setItem('nexo_selected_student', selectedAlumnoId);
        
        const data = await apiClient.get(`/api/alumnos/${selectedAlumnoId}/routine`);
        setActiveStudent(data.student);
        setActiveStudentRoutine(data.routine);
        
        const savedCompleted = localStorage.getItem(`nexo_completed_${selectedAlumnoId}`);
        if (savedCompleted) {
          setCompletedExercises(JSON.parse(savedCompleted));
        } else {
          setCompletedExercises({});
        }

        if (data.routine.length > 0) {
          const uniqueDays = [...new Set(data.routine.map(r => r.Dia))].sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
          });
          setActiveTab(uniqueDays[0] || '');
        } else {
          setActiveTab('');
        }
      } catch (err) {
        console.error('Error loading routine:', err);
        setSelectedAlumnoId('');
      } finally {
        setLoading(false);
      }
    }

    loadStudentRoutine();
  }, [selectedAlumnoId]);

  // Filter students based on search query
  const filteredAlumnos = alumnos.filter(a => {
    const fullName = `${a.Nombre} ${a.Apellido}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Get unique days from routine
  const routineDays = [...new Set(activeStudentRoutine.map(r => r.Dia))].sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Get exercises for selected day
  const exercisesForActiveDay = activeStudentRoutine
    .filter(r => r.Dia === activeTab)
    .sort((a, b) => (Number(a.Orden) || 0) - (Number(b.Orden) || 0));

  // Toggle exercise completion
  const handleToggleExercise = (exerciseId) => {
    const updated = {
      ...completedExercises,
      [exerciseId]: !completedExercises[exerciseId]
    };
    setCompletedExercises(updated);
    localStorage.setItem(`nexo_completed_${selectedAlumnoId}`, JSON.stringify(updated));
  };

  // Find exercise details (like muscle group) from catalog
  const getExerciseGroup = (exerciseName) => {
    const match = ejercicios.find(e => e.Nombre === exerciseName);
    return match ? match.GrupoMuscular : 'General';
  };

  return (
    <div className="container">
      {/* Header (Hidden during printing) */}
      <header className="app-header glass-panel screen-only">
        <div 
          className="logo-container" 
          onClick={onBack}
          style={{ cursor: 'pointer' }}
          title="Volver al Inicio"
        >
          <img 
            src="/logo.jpg" 
            alt="Logo Nexo Gym" 
            className="logo-image" 
            style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <span className="logo-text" style={{ fontSize: '1.4rem' }}>Nexo Gym</span>
          <span className="badge badge-student">Alumnos</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selectedAlumnoId && (
            <>
              <button 
                className="btn btn-success" 
                onClick={() => window.print()} 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                title="Descargar Rutina Completa en PDF"
              >
                📥 PDF
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedAlumnoId('')} 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Cambiar Alumno
              </button>
            </>
          )}
          {!selectedAlumnoId && (
            <button className="btn btn-secondary" onClick={onBack} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              Volver
            </button>
          )}
        </div>
      </header>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }} className="screen-only">
          <h3>Cargando rutina...</h3>
        </div>
      )}

      {/* Student Selection Screen */}
      {!loading && !activeStudent && (
        <div className="glass-panel fade-in screen-only" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>
            Busca tu Ficha de Entrenamiento
          </h2>
          
          <div className="form-group">
            <label htmlFor="search-student">Escribe tu nombre y apellido</label>
            <input
              id="search-student"
              type="text"
              className="input-control"
              placeholder="Ej: Pamela Gómez..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              {searchQuery ? 'Resultados de búsqueda:' : 'Alumnos activos:'}
            </h3>
            
            <div className="scroll-panel space-y" style={{ maxHeight: '300px' }}>
              {searchLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                  Buscando alumnos...
                </div>
              ) : filteredAlumnos.length > 0 ? (
                filteredAlumnos.map(student => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedAlumnoId(student.id)}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{student.Nombre} {student.Apellido}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Nexo Gym - Alumno Activo
                      </div>
                    </div>
                    <span className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Ver Rutina
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No se encontraron alumnos activos con ese nombre.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Routine View Screen (Interactive) */}
      {!loading && activeStudent && (
        <div className="space-y fade-in screen-only">
          {/* Student Profile Info Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
                  Hola, {activeStudent.Nombre}!
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Objetivo: <strong style={{ color: 'var(--primary)' }}>{activeStudent.Objetivo}</strong> | Nivel: {activeStudent.Nivel}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-student" style={{ display: 'inline-block', marginBottom: '0.4rem' }}>
                  {activeStudent.DiasEntrenamiento}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                  Horario: {activeStudent.Horario}
                </span>
              </div>
            </div>
            
            {/* Medical Warnings/Injuries Alert */}
            {activeStudent.Lesionado === 'Sí' && (
              <div className="alert alert-danger fade-in" style={{ marginTop: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <strong>Atención - Registro de Lesión:</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {activeStudent.DetalleLesion && <div><strong>Detalle:</strong> {activeStudent.DetalleLesion}</div>}
                    {activeStudent.RestriccionesMedicas && <div style={{ marginTop: '0.2rem' }}><strong>Restricciones Médicas:</strong> {activeStudent.RestriccionesMedicas}</div>}
                    {activeStudent.Enfermedades && <div style={{ marginTop: '0.2rem' }}><strong>Observaciones:</strong> {activeStudent.Enfermedades}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Routine Navigation Tabs */}
          {routineDays.length > 0 ? (
            <div className="space-y">
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {routineDays.map(day => (
                  <button
                    key={day}
                    onClick={() => setActiveTab(day)}
                    className="btn"
                    style={{
                      whiteSpace: 'nowrap',
                      background: activeTab === day ? 'var(--primary)' : 'var(--bg-card)',
                      color: activeTab === day ? 'var(--primary-text)' : 'var(--text-primary)',
                      border: activeTab === day ? '1px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '30px',
                      padding: '0.6rem 1.5rem',
                      boxShadow: 'none'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Progress Tracker Card */}
              <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Progreso de hoy ({activeTab}):</span>
                {(() => {
                  const dayExercises = exercisesForActiveDay.map(e => e.id);
                  const completedCount = dayExercises.filter(id => completedExercises[id]).length;
                  const totalCount = dayExercises.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>
                        {completedCount}/{totalCount} ({percent}%)
                      </strong>
                      <div style={{ width: '100px', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Exercises List */}
              <div className="space-y" style={{ marginTop: '0.5rem' }}>
                {exercisesForActiveDay.map(item => {
                  const isChecked = !!completedExercises[item.id];
                  const muscleGroup = getExerciseGroup(item.Ejercicio);
                  
                  return (
                    <div
                      key={item.id}
                      className={`checkbox-container ${isChecked ? 'checked' : ''} fade-in`}
                      onClick={() => handleToggleExercise(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <div className="checkmark"></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.2rem' }}>
                          <strong className="exercise-name" style={{ fontSize: '1.15rem', color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {item.Ejercicio}
                          </strong>
                          <span
                            className="badge badge-student"
                            style={{
                              fontSize: '0.65rem',
                              padding: '0.1rem 0.4rem',
                              borderColor: isChecked ? 'var(--border)' : 'var(--primary)',
                              color: isChecked ? 'var(--text-muted)' : 'var(--primary)'
                            }}
                          >
                            {muscleGroup}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.9rem', color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                          <span>Series/Reps: <strong style={{ color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>{item.Series_Repeticiones}</strong></span>
                          {item.Notas && (
                            <span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>
                              💡 {item.Notas}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>Aún no tienes rutinas asignadas</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Tus profesores pronto cargarán tu rutina personalizada en el sistema. ¡Consúltale en tu próxima visita al gimnasio!
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- PRINT-ONLY ENTIRE ROUTINE SHEET --- */}
      {!loading && activeStudent && (
        <div className="print-only" style={{ padding: '2rem', background: '#ffffff', color: '#111111' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            borderBottom: '3px solid #1b4d3e',
            paddingBottom: '1.5rem',
            marginBottom: '2rem'
          }}>
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <h1 style={{ fontSize: '2.2rem', color: '#1b4d3e', margin: 0, fontWeight: '800', letterSpacing: '1px' }}>
                NEXO GYM
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#495057', margin: '0.2rem 0 0 0', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Ficha Técnica de Entrenamiento
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            background: '#f8f9fa',
            padding: '1.25rem',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Alumno:</strong> {activeStudent.Nombre} {activeStudent.Apellido}</p>
              <p style={{ margin: 0 }}><strong>Nivel:</strong> {activeStudent.Nivel}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Objetivo Principal:</strong> {activeStudent.Objetivo}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Frecuencia:</strong> {activeStudent.DiasEntrenamiento}</p>
              <p style={{ margin: 0 }}><strong>Horario preferido:</strong> {activeStudent.Horario}</p>
            </div>
          </div>

          {activeStudent.Lesionado === 'Sí' && (
            <div style={{
              border: '1px solid #c92a2a',
              background: '#fff5f5',
              padding: '1rem',
              borderRadius: '6px',
              color: '#c92a2a',
              marginBottom: '2rem',
              fontSize: '0.9rem'
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⚠️ RESTRICCIONES MÉDICAS / REGISTRO DE LESIONES:</strong>
              {activeStudent.DetalleLesion && <p style={{ margin: '0 0 0.25rem 0' }}><strong>Detalle:</strong> {activeStudent.DetalleLesion}</p>}
              {activeStudent.RestriccionesMedicas && <p style={{ margin: '0 0 0.25rem 0' }}><strong>Restricciones:</strong> {activeStudent.RestriccionesMedicas}</p>}
              {activeStudent.Enfermedades && <p style={{ margin: 0 }}><strong>Observaciones:</strong> {activeStudent.Enfermedades}</p>}
            </div>
          )}

          {routineDays.length > 0 ? (
            routineDays.map(day => {
              const dayExercises = activeStudentRoutine
                .filter(r => r.Dia === day)
                .sort((a, b) => (Number(a.Orden) || 0) - (Number(b.Orden) || 0));

              return (
                <div key={day} style={{ marginBottom: '2.5rem', pageBreakInside: 'avoid' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    color: '#1b4d3e',
                    borderBottom: '2px solid #1b4d3e',
                    paddingBottom: '0.4rem',
                    marginBottom: '1rem',
                    fontWeight: '700'
                  }}>
                    {day}
                  </h3>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}>
                    <thead>
                      <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '0.6rem 0.8rem', width: '40%' }}>Ejercicio</th>
                        <th style={{ padding: '0.6rem 0.8rem', width: '15%' }}>Grupo</th>
                        <th style={{ padding: '0.6rem 0.8rem', width: '20%' }}>Series / Reps</th>
                        <th style={{ padding: '0.6rem 0.8rem', width: '25%' }}>Notas / Indicaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayExercises.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6', background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                          <td style={{ padding: '0.6rem 0.8rem' }}><strong>{item.Ejercicio}</strong></td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>{getExerciseGroup(item.Ejercicio)}</td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>{item.Series_Repeticiones}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: item.Notas ? '#d9480f' : '#868e96' }}>
                            {item.Notas || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#868e96' }}>No hay ejercicios registrados en esta rutina.</p>
          )}

          <div style={{
            marginTop: '3rem',
            borderTop: '1px solid #dee2e6',
            paddingTop: '1rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#868e96'
          }}>
            Rutina generada digitalmente por el Sistema Nexo Gym. Entrena seguro y respeta las cargas indicadas por tu profesor.
          </div>
        </div>
      )}
    </div>
  );
}
