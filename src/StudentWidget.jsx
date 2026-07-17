import React, { useState, useEffect } from 'react';
import { connector } from './gristConnector';

export default function StudentWidget() {
  const [alumnos, setAlumnos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [rutinasAlumnos, setRutinasAlumnos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumnoId, setSelectedAlumnoId] = useState(
    localStorage.getItem('nexo_selected_student') || ''
  );
  
  // State for active day tab
  const [activeTab, setActiveTab] = useState('');
  
  // State for completed exercises: { [RA_id]: boolean }
  const [completedExercises, setCompletedExercises] = useState({});

  useEffect(() => {
    // Initialize Grist
    connector.ready({ requiredAccess: 'read table' });
    
    // Load all data
    async function loadData() {
      const dataAlumnos = await connector.fetchTable('Alumnos');
      const dataEjercicios = await connector.fetchTable('Ejercicios');
      const dataRutinasAlumnos = await connector.fetchTable('Rutinas_Alumnos');
      
      const formattedAlumnos = connector._formatRecords(dataAlumnos);
      const formattedEjercicios = connector._formatRecords(dataEjercicios);
      const formattedRutinasAlumnos = connector._formatRecords(dataRutinasAlumnos);
      
      setAlumnos(formattedAlumnos);
      setEjercicios(formattedEjercicios);
      setRutinasAlumnos(formattedRutinasAlumnos);
      
      // Auto-select tab if a student is active
      if (selectedAlumnoId) {
        const studentRoutine = formattedRutinasAlumnos.filter(
          r => String(r.AlumnoID) === String(selectedAlumnoId)
        );
        if (studentRoutine.length > 0) {
          // Sort unique days by their original order or alphabetical
          const uniqueDays = [...new Set(studentRoutine.map(r => r.Dia))];
          setActiveTab(uniqueDays[0] || '');
        }
      }
    }

    loadData();
  }, []);

  // Save selected student to local storage
  useEffect(() => {
    if (selectedAlumnoId) {
      localStorage.setItem('nexo_selected_student', selectedAlumnoId);
      // Load completed exercises for this student from local storage
      const savedCompleted = localStorage.getItem(`nexo_completed_${selectedAlumnoId}`);
      if (savedCompleted) {
        setCompletedExercises(JSON.parse(savedCompleted));
      } else {
        setCompletedExercises({});
      }
      
      // Select first day tab
      const studentRoutine = rutinasAlumnos.filter(
        r => String(r.AlumnoID) === String(selectedAlumnoId)
      );
      const uniqueDays = [...new Set(studentRoutine.map(r => r.Dia))];
      if (uniqueDays.length > 0 && !uniqueDays.includes(activeTab)) {
        setActiveTab(uniqueDays[0]);
      }
    } else {
      localStorage.removeItem('nexo_selected_student');
      setCompletedExercises({});
      setActiveTab('');
    }
  }, [selectedAlumnoId, rutinasAlumnos]);

  // Filter students based on search query
  const filteredAlumnos = alumnos.filter(a => {
    if (a.Estado !== 'Alta') return false; // Only active students can view their routine
    const fullName = `${a.Nombre} ${a.Apellido}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const activeStudent = alumnos.find(a => String(a.ID) === String(selectedAlumnoId));

  // Get active student's routine
  const activeStudentRoutine = rutinasAlumnos.filter(
    r => String(r.AlumnoID) === String(selectedAlumnoId)
  );

  // Get unique days from routine
  // We want to sort them so "Día 1" is before "Día 2"
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

  // Find exercise details (like muscle group) from Ejercicios table if available
  const getExerciseGroup = (exerciseName) => {
    const match = ejercicios.find(e => e.Nombre === exerciseName);
    return match ? match.GrupoMuscular : 'General';
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="logo-container">
          <span className="logo-text">Nexo Gym</span>
          <span className="badge badge-student">Alumnos</span>
        </div>
        {activeStudent && (
          <button className="btn btn-secondary" onClick={() => setSelectedAlumnoId('')}>
            Cambiar Alumno
          </button>
        )}
      </header>

      {/* Student Selection Screen */}
      {!activeStudent ? (
        <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Busca tu Ficha de Entrenamiento</h2>
          
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
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map(student => (
                  <div
                    key={student.ID}
                    onClick={() => setSelectedAlumnoId(student.ID)}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(138, 43, 226, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{student.Nombre} {student.Apellido}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Nivel: {student.Nivel} | Días: {student.DiasEntrenamiento}
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
      ) : (
        /* Routine View Screen */
        <div className="space-y fade-in">
          {/* Student Profile Info Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
                  Hola, {activeStudent.Nombre}!
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Objetivo: <strong style={{ color: 'var(--secondary)' }}>{activeStudent.Objetivo}</strong> | Nivel: {activeStudent.Nivel}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', display: 'block', marginBottom: '0.4rem' }}>
                  {activeStudent.DiasEntrenamiento}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
                    {activeStudent.RestriccionesMedicas && <div style={{ marginTop: '0.2rem' }}><strong>Restricciones:</strong> {activeStudent.RestriccionesMedicas}</div>}
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
                      background: activeTab === day ? 'var(--primary)' : 'rgba(255, 255, 255, 0.02)',
                      color: activeTab === day ? '#000000' : 'var(--text-primary)',
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
                  const dayExercises = exercisesForActiveDay.map(e => e.ID);
                  const completedCount = dayExercises.filter(id => completedExercises[id]).length;
                  const totalCount = dayExercises.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ color: '#ffffff' }}>
                        {completedCount}/{totalCount} ({percent}%)
                      </strong>
                      <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Exercises List */}
              <div className="space-y" style={{ marginTop: '0.5rem' }}>
                {exercisesForActiveDay.length > 0 ? (
                  exercisesForActiveDay.map(item => {
                    const isChecked = !!completedExercises[item.ID];
                    const muscleGroup = getExerciseGroup(item.Ejercicio);
                    
                    return (
                      <div
                        key={item.ID}
                        className={`checkbox-container ${isChecked ? 'checked' : ''} fade-in`}
                        onClick={() => handleToggleExercise(item.ID)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by click on container
                        />
                        <div className="checkmark"></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.2rem' }}>
                            <strong className="exercise-name" style={{ fontSize: '1.15rem' }}>
                              {item.Ejercicio}
                            </strong>
                            <span
                              className="badge"
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                background: isChecked ? 'rgba(255,255,255,0.02)' : 'rgba(0, 242, 254, 0.05)',
                                color: isChecked ? 'var(--text-muted)' : 'var(--secondary)',
                                border: `1px solid ${isChecked ? 'var(--border)' : 'rgba(0, 242, 254, 0.15)'}`
                              }}
                            >
                              {muscleGroup}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.9rem', color: isChecked ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
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
                  })
                ) : (
                  <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay ejercicios registrados para este día.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>Aún no tienes rutinas asignadas</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Tu profesor pronto cargará tu rutina personalizada. ¡Consúltale en tu próxima visita al gimnasio!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
