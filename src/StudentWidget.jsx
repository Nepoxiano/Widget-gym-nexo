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
  const [pdfDownloadingId, setPdfDownloadingId] = useState(null);

  const loadHtml2Pdf = () => {
    return new Promise((resolve) => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve(window.html2pdf);
      document.head.appendChild(script);
    });
  };

  const handleDownloadPDFDirectly = async (studentId, studentFullName) => {
    setPdfDownloadingId(studentId);
    try {
      const data = await apiClient.get(`/api/alumnos/${studentId}/routine`);
      const { student, routine } = data;
      
      const element = document.createElement('div');
      element.style.padding = '25px';
      element.style.color = '#333333';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.fontSize = '12px';
      element.style.lineHeight = '1.4';
      
      element.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #2e7d32; padding-bottom: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="color: #2e7d32; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">NEXO GYM</h1>
            <p style="margin: 3px 0 0 0; font-size: 13px; color: #666; font-weight: bold;">Rutina de Entrenamiento Personalizada</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #888;">
            Fecha de descarga: ${new Date().toLocaleDateString('es-AR')}
          </div>
        </div>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 14px; border-bottom: 1px solid #e9ecef; padding-bottom: 5px;">Datos del Alumno</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>Nombre Completo:</strong> ${student.Nombre} ${student.Apellido || ''}</div>
            <div><strong>Nivel:</strong> ${student.Nivel || '-'}</div>
            <div><strong>Edad:</strong> ${student.Edad ? `${student.Edad} años` : '-'}</div>
            <div><strong>Frecuencia:</strong> ${student.DiasEntrenamiento || '-'}</div>
            <div><strong>Objetivo Principal:</strong> ${student.Objetivo || '-'}</div>
            <div><strong>Horario de Preferencia:</strong> ${student.Horario || '-'}</div>
            ${student.Lesionado === 'Sí' ? `
              <div style="grid-column: span 2; background: #fff5f5; border: 1px solid #ffcdd2; color: #c62828; padding: 8px 10px; border-radius: 4px; margin-top: 5px;">
                <strong>⚠️ Lesión / Limitación Médica:</strong> ${student.DetalleLesion || 'Sí'}
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      const days = [...new Set(routine.map(r => r.Dia))].sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });
      
      if (days.length === 0) {
        element.innerHTML += `
          <div style="text-align: center; padding: 40px; color: #888; border: 1px dashed #ccc; border-radius: 6px;">
            No hay ejercicios cargados en esta rutina por el momento.
          </div>
        `;
      } else {
        for (const day of days) {
          const dayExercises = routine
            .filter(r => r.Dia === day)
            .sort((a, b) => (Number(a.Orden) || 0) - (Number(b.Orden) || 0));
            
          element.innerHTML += `
            <div style="margin-top: 25px; page-break-inside: avoid;">
              <h3 style="background: #2e7d32; color: white; padding: 8px 12px; margin: 0 0 10px 0; border-radius: 4px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                ${day}
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
                <thead>
                  <tr style="border-bottom: 2px solid #2e7d32; background: #f1f3f5; text-align: left; font-weight: bold;">
                    <th style="padding: 8px; width: 60px; text-align: center;">Orden</th>
                    <th style="padding: 8px;">Ejercicio</th>
                    <th style="padding: 8px; width: 140px;">Series x Repeticiones</th>
                    <th style="padding: 8px;">Notas / Indicaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${dayExercises.map(ex => `
                    <tr style="border-bottom: 1px solid #dee2e6;">
                      <td style="padding: 8px; text-align: center; font-weight: bold; color: #2e7d32;">${ex.Orden}</td>
                      <td style="padding: 8px; font-weight: 600;">${ex.Ejercicio}</td>
                      <td style="padding: 8px; color: #212529;">${ex.Series_Repeticiones}</td>
                      <td style="padding: 8px; color: #6c757d; font-style: italic;">${ex.Notas || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }
      
      const html2pdf = await loadHtml2Pdf();
      const opt = {
        margin: 10,
        filename: `Rutina_${student.Nombre.replace(/\s+/g, '_')}_${(student.Apellido || '').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al descargar el PDF de la rutina.');
    } finally {
      setPdfDownloadingId(null);
    }
  };

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
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', height: 'fit-content' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDFDirectly(student.id, `${student.Nombre} ${student.Apellido}`);
                        }}
                        disabled={pdfDownloadingId === student.id}
                        title="Descargar Rutina en PDF directamente"
                      >
                        {pdfDownloadingId === student.id ? '⏳' : '📥'} PDF
                      </button>
                      <span className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Ver Rutina
                      </span>
                    </div>
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
