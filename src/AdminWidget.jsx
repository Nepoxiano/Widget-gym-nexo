import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export default function AdminWidget({ onLogout }) {
  const [alumnos, setAlumnos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [rutinasPredefinidas, setRutinasPredefinidas] = useState([]);
  const [rutinasAlumnos, setRutinasAlumnos] = useState([]);
  
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterLevel, setFilterLevel] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Alta');
  const [filterInjured, setFilterInjured] = useState('Todos');
  
  // Forms states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    Nombre: '', Apellido: '', Edad: '', Nivel: 'Principiante',
    DiasEntrenamiento: '3 días', Horario: 'Turno mañana',
    Objetivo: 'Hipertrofia', Estado: 'Alta', Lesionado: 'No',
    DetalleLesion: '', Enfermedades: '', RestriccionesMedicas: '', Deportes: ''
  });
  
  // Exercise editing states
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    Dia: 'Día 1 - Pecho + hombros + tríceps', Ejercicio: '', Series_Repeticiones: '3x10', Notas: ''
  });
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editExerciseForm, setEditExerciseForm] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const dataAlumnos = await apiClient.get('/api/admin/alumnos');
      setAlumnos(dataAlumnos);

      const dataEjercicios = await apiClient.get('/api/ejercicios');
      setEjercicios(dataEjercicios);

      const dataTemplates = await apiClient.get('/api/admin/rutinas-predefinidas');
      setRutinasPredefinidas(dataTemplates);

      const dataRutinas = await apiClient.get('/api/admin/rutinas-alumnos');
      setRutinasAlumnos(dataRutinas);
      
      // Default the exercise dropdown to the first exercise if available
      if (dataEjercicios.length > 0) {
        setNewExerciseForm(prev => ({ ...prev, Ejercicio: dataEjercicios[0].Nombre }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  const selectedAlumno = alumnos.find(a => String(a.ID) === String(selectedAlumnoId));

  // Initialize edit profile form
  useEffect(() => {
    if (selectedAlumno) {
      setEditForm({ ...selectedAlumno });
      setIsEditingProfile(false);
    }
  }, [selectedAlumno]);

  // Filter student list
  const filteredAlumnos = alumnos.filter(student => {
    const fullName = `${student.Nombre} ${student.Apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'Todos' || student.Nivel === filterLevel;
    const matchesStatus = filterStatus === 'Todos' || student.Estado === filterStatus;
    const matchesInjured = filterInjured === 'Todos' || 
      (filterInjured === 'Lesionados' && student.Lesionado === 'Sí') ||
      (filterInjured === 'Sanos' && student.Lesionado === 'No');
      
    return matchesSearch && matchesLevel && matchesStatus && matchesInjured;
  });

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedStudent = await apiClient.put(`/api/admin/alumnos/${selectedAlumno.id}`, editForm);
      setIsEditingProfile(false);
      
      // Update local state
      setAlumnos(prev => prev.map(a => a.id === updatedStudent.id ? updatedStudent : a));
      alert('Cambios guardados con éxito.');
    } catch (err) {
      alert('Error al guardar los cambios: ' + err.message);
    }
  };

  // Handle adding a student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentForm.Nombre || !newStudentForm.Apellido) {
      alert('Nombre y Apellido son requeridos.');
      return;
    }
    
    try {
      const addedStudent = await apiClient.post('/api/admin/alumnos', newStudentForm);
      setIsAddingStudent(false);
      setNewStudentForm({
        Nombre: '', Apellido: '', Edad: '', Nivel: 'Principiante',
        DiasEntrenamiento: '3 días', Horario: 'Turno mañana',
        Objetivo: 'Hipertrofia', Estado: 'Alta', Lesionado: 'No',
        DetalleLesion: '', Enfermedades: '', RestriccionesMedicas: '', Deportes: ''
      });
      
      // Update local state
      setAlumnos(prev => [...prev, addedStudent].sort((a, b) => a.Apellido.localeCompare(b.Apellido)));
      setSelectedAlumnoId(addedStudent.id);
      alert('Alumno registrado correctamente.');
    } catch (err) {
      alert('Error al agregar el alumno: ' + err.message);
    }
  };

  // Pre-defined routine templates applicator
  const handleApplyTemplate = async (templateName) => {
    if (!selectedAlumno) return;
    
    const confirmApply = window.confirm(
      `¿Estás seguro de que quieres cargar el "${templateName}" para ${selectedAlumno.Nombre}? ` +
      `Esto agregará los ejercicios de la plantilla a su rutina actual.`
    );
    if (!confirmApply) return;

    try {
      await apiClient.post(`/api/admin/alumnos/${selectedAlumno.id}/routine/template`, { templateName });
      
      // Reload routines
      const dataRutinas = await apiClient.get('/api/admin/rutinas-alumnos');
      setRutinasAlumnos(dataRutinas);
      
      alert('Plantilla cargada correctamente.');
    } catch (err) {
      alert('Error al cargar plantilla: ' + err.message);
    }
  };

  // Clear routine for selected student
  const handleClearRoutine = async () => {
    if (!selectedAlumno) return;
    
    const studentExercises = rutinasAlumnos.filter(
      r => String(r.AlumnoID) === String(selectedAlumno.id)
    );
    
    if (studentExercises.length === 0) {
      alert('El alumno no tiene ejercicios asignados.');
      return;
    }
    
    const confirmClear = window.confirm(
      `¿Estás seguro de borrar COMPLETAMENTE la rutina de ${selectedAlumno.Nombre}? Esto no se puede deshacer.`
    );
    if (!confirmClear) return;
    
    try {
      await apiClient.delete(`/api/admin/alumnos/${selectedAlumno.id}/routine`);
      
      // Update local state
      setRutinasAlumnos(prev => prev.filter(r => String(r.AlumnoID) !== String(selectedAlumno.id)));
      alert('Rutina eliminada.');
    } catch (err) {
      alert('Error al eliminar rutina: ' + err.message);
    }
  };

  // Add exercise to custom routine
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!selectedAlumno) return;
    
    // Find next order number for this day
    const dayExercises = rutinasAlumnos.filter(
      r => String(r.AlumnoID) === String(selectedAlumno.id) && r.Dia === newExerciseForm.Dia
    );
    const nextOrder = dayExercises.length > 0 ? Math.max(...dayExercises.map(de => Number(de.Orden) || 0)) + 1 : 1;

    try {
      const newRecord = {
        Dia: newExerciseForm.Dia,
        Ejercicio: newExerciseForm.Ejercicio,
        Series_Repeticiones: newExerciseForm.Series_Repeticiones,
        Orden: nextOrder,
        Notas: newExerciseForm.Notas
      };

      const addedExercise = await apiClient.post(`/api/admin/alumnos/${selectedAlumno.id}/routine`, newRecord);
      
      // Update local state
      setRutinasAlumnos(prev => [...prev, addedExercise]);
      setIsAddingExercise(false);
      setNewExerciseForm(prev => ({
        ...prev,
        Series_Repeticiones: '3x10',
        Notas: ''
      }));
    } catch (err) {
      alert('Error al agregar ejercicio: ' + err.message);
    }
  };

  // Delete exercise from custom routine
  const handleDeleteExercise = async (id) => {
    if (window.confirm('¿Borrar este ejercicio de la rutina?')) {
      try {
        await apiClient.delete(`/api/admin/routine/${id}`);
        // Update local state
        setRutinasAlumnos(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('Error al borrar el ejercicio: ' + err.message);
      }
    }
  };

  // Save edited exercise
  const handleSaveExerciseEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiClient.put(`/api/admin/routine/${editingExerciseId}`, {
        Series_Repeticiones: editExerciseForm.Series_Repeticiones,
        Notas: editExerciseForm.Notas
      });
      
      // Update local state
      setRutinasAlumnos(prev => prev.map(r => r.id === editingExerciseId ? updated : r));
      setEditingExerciseId(null);
    } catch (err) {
      alert('Error al actualizar el ejercicio: ' + err.message);
    }
  };

  // Group active student's routine by day
  const studentRoutine = selectedAlumno
    ? rutinasAlumnos.filter(r => String(r.AlumnoID) === String(selectedAlumno.id))
    : [];

  const uniqueDays = [...new Set(studentRoutine.map(r => r.Dia))].sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="logo-container">
          <img 
            src="/logo.jpg" 
            alt="Logo Nexo Gym" 
            className="logo-image" 
            style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <span className="logo-text" style={{ fontSize: '1.4rem' }}>Nexo Gym</span>
          <span className="badge badge-admin">Profesor</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-success" style={{ fontSize: '0.8rem' }} onClick={() => setIsAddingStudent(true)}>
            + Nuevo Alumno
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <h3>Cargando panel de administración...</h3>
        </div>
      )}

      {/* Main Panel Grid */}
      {!loading && (
        <div className="grid-cols-2">
          {/* Left Side: Students List */}
          <div className="glass-panel space-y fade-in" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <h2>Alumnos Registrados</h2>
            
            {/* Search & Filters */}
            <input
              type="text"
              className="input-control"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel</label>
                <select
                  className="input-control"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{ padding: '0.4rem', marginTop: '0.2rem' }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estado</label>
                <select
                  className="input-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.4rem', marginTop: '0.2rem' }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Alta">Alta</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lesiones</label>
                <select
                  className="input-control"
                  value={filterInjured}
                  onChange={(e) => setFilterInjured(e.target.value)}
                  style={{ padding: '0.4rem', marginTop: '0.2rem' }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Lesionados">Lesionados</option>
                  <option value="Sanos">Sanos</option>
                </select>
              </div>
            </div>

            {/* List display */}
            <div className="scroll-panel space-y" style={{ maxHeight: '600px', marginTop: '1rem' }}>
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map(student => {
                  const isSelected = String(student.id) === String(selectedAlumnoId);
                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedAlumnoId(student.id)}
                      style={{
                        padding: '1rem',
                        background: isSelected ? 'rgba(27, 77, 62, 0.08)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {student.Nombre} {student.Apellido}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Nivel: {student.Nivel} | Objetivo: {student.Objetivo}
                        </div>
                        {student.Lesionado === 'Sí' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--danger)', background: 'var(--danger-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            ⚠️ Lesión: {student.DetalleLesion || 'Sí'}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                        <span className={`badge ${student.Estado === 'Alta' ? 'badge-admin' : 'badge-student'}`}>
                          {student.Estado}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {student.DiasEntrenamiento}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No se encontraron alumnos.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Detail & Routine Management */}
          <div className="space-y">
            {selectedAlumno ? (
              <div className="space-y fade-in">
                {/* Profile Details Card */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--primary)' }}>Ficha de {selectedAlumno.Nombre}</h2>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setIsEditingProfile(!isEditingProfile)}>
                      {isEditingProfile ? 'Cancelar' : 'Editar Ficha'}
                    </button>
                  </div>

                  {!isEditingProfile ? (
                    /* Read Mode */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)' }}>EDAD</p>
                        <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Edad || 'No especificado'} años</p>
                        
                        <p style={{ color: 'var(--text-muted)' }}>HORARIO</p>
                        <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Horario}</p>

                        <p style={{ color: 'var(--text-muted)' }}>DEPORTES QUE PRACTICA</p>
                        <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Deportes || 'Ninguno'}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)' }}>ENFERMEDADES O PATOLOGÍAS</p>
                        <p style={{ fontWeight: '600', color: selectedAlumno.Enfermedades ? 'var(--warning)' : 'var(--text-primary)', marginBottom: '0.8rem' }}>
                          {selectedAlumno.Enfermedades || 'Ninguna'}
                        </p>

                        <p style={{ color: 'var(--text-muted)' }}>RESTRICCIONES MÉDICAS</p>
                        <p style={{ fontWeight: '600', color: selectedAlumno.RestriccionesMedicas ? 'var(--danger)' : 'var(--text-primary)', marginBottom: '0.8rem' }}>
                          {selectedAlumno.RestriccionesMedicas || 'Ninguna'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode Form */
                    <form onSubmit={handleUpdateProfile} className="space-y">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Nombre</label>
                          <input type="text" className="input-control" value={editForm.Nombre || ''} onChange={e => setEditForm({...editForm, Nombre: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label>Apellido</label>
                          <input type="text" className="input-control" value={editForm.Apellido || ''} onChange={e => setEditForm({...editForm, Apellido: e.target.value})} required />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Edad</label>
                          <input type="number" className="input-control" value={editForm.Edad || ''} onChange={e => setEditForm({...editForm, Edad: Number(e.target.value)})} />
                        </div>
                        <div className="form-group">
                          <label>Nivel</label>
                          <select className="input-control" value={editForm.Nivel || ''} onChange={e => setEditForm({...editForm, Nivel: e.target.value})}>
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Días entrena</label>
                          <select className="input-control" value={editForm.DiasEntrenamiento || ''} onChange={e => setEditForm({...editForm, DiasEntrenamiento: e.target.value})}>
                            <option value="3 días">3 días</option>
                            <option value="4 días">4 días</option>
                            <option value="5 días">5 días</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Horario</label>
                          <select className="input-control" value={editForm.Horario || ''} onChange={e => setEditForm({...editForm, Horario: e.target.value})}>
                            <option value="Turno mañana">Turno mañana</option>
                            <option value="Turno tarde">Turno tarde</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Objetivo Principal</label>
                          <select className="input-control" value={editForm.Objetivo || ''} onChange={e => setEditForm({...editForm, Objetivo: e.target.value})}>
                            <option value="Hipertrofia">Hipertrofia</option>
                            <option value="Tonificación">Tonificación</option>
                            <option value="Mejor resistencia">Mejor resistencia</option>
                            <option value="Aumentar fuerza">Aumentar fuerza</option>
                            <option value="Perder peso">Perder peso</option>
                            <option value="Rehabilitación">Rehabilitación</option>
                            <option value="Rendimiento deportivo">Rendimiento deportivo</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Estado</label>
                          <select className="input-control" value={editForm.Estado || ''} onChange={e => setEditForm({...editForm, Estado: e.target.value})}>
                            <option value="Alta">Alta</option>
                            <option value="Baja">Baja</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>¿Lesionado?</label>
                          <select className="input-control" value={editForm.Lesionado || ''} onChange={e => setEditForm({...editForm, Lesionado: e.target.value})}>
                            <option value="No">No</option>
                            <option value="Sí">Sí</option>
                          </select>
                        </div>
                      </div>

                      {editForm.Lesionado === 'Sí' && (
                        <div className="form-group">
                          <label>Detalle de lesión o molestias</label>
                          <textarea className="input-control" value={editForm.DetalleLesion || ''} onChange={e => setEditForm({...editForm, DetalleLesion: e.target.value})} rows="2" />
                        </div>
                      )}

                      <div className="form-group">
                        <label>Enfermedades o patologías</label>
                        <input type="text" className="input-control" value={editForm.Enfermedades || ''} onChange={e => setEditForm({...editForm, Enfermedades: e.target.value})} />
                      </div>

                      <div className="form-group">
                        <label>Restricciones médicas</label>
                        <input type="text" className="input-control" value={editForm.RestriccionesMedicas || ''} onChange={e => setEditForm({...editForm, RestriccionesMedicas: e.target.value})} />
                      </div>

                      <div className="form-group">
                        <label>Deportes que practica</label>
                        <input type="text" className="input-control" value={editForm.Deportes || ''} onChange={e => setEditForm({...editForm, Deportes: e.target.value})} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary">
                          Guardar Ficha
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Routine Management Card */}
                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ color: 'var(--primary)' }}>Rutina del Alumno</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setIsAddingExercise(!isAddingExercise)}>
                        {isAddingExercise ? 'Cancelar' : '+ Ejercicio'}
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleClearRoutine}>
                        Borrar Todo
                      </button>
                    </div>
                  </div>

                  {/* Apply templates section if routine is empty */}
                  {studentRoutine.length === 0 && !isAddingExercise && (
                    <div style={{ background: 'var(--bg-main)', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                        Este alumno no tiene ejercicios cargados en su rutina. Carga una plantilla predefinida para empezar rápidamente:
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => handleApplyTemplate('Plan 3 Días')}>
                          Cargar Plan 3 Días
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleApplyTemplate('Plan 5 Días')}>
                          Cargar Plan 5 Días (Pame)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Exercise Inline Form */}
                  {isAddingExercise && (
                    <form onSubmit={handleAddExercise} className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--primary)' }}>Agregar Ejercicio</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Día</label>
                          <select className="input-control" value={newExerciseForm.Dia} onChange={e => setNewExerciseForm({...newExerciseForm, Dia: e.target.value})}>
                            <option value="Día 1 - Piernas (Cuádriceps)">Día 1 - Piernas (Cuádriceps)</option>
                            <option value="Día 2 - Espalda + Bíceps">Día 2 - Espalda + Bíceps</option>
                            <option value="Día 3 - Hombros + Pecho">Día 3 - Hombros + Pecho</option>
                            <option value="Día 4 - Piernas (Posteriores)">Día 4 - Piernas (Posteriores)</option>
                            <option value="Día 5 - Full Body">Día 5 - Full Body</option>
                            <option value="Día 1 - Pecho + hombros + tríceps">Día 1 - Pecho + hombros + tríceps</option>
                            <option value="Día 2 - Espalda + hombros + bíceps">Día 2 - Espalda + hombros + bíceps</option>
                            <option value="Día 3 - Cuádriceps + femorales">Día 3 - Cuádriceps + femorales</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Ejercicio</label>
                          <select className="input-control" value={newExerciseForm.Ejercicio} onChange={e => setNewExerciseForm({...newExerciseForm, Ejercicio: e.target.value})}>
                            {ejercicios.map(e => (
                              <option key={e.id} value={e.Nombre}>{e.Nombre} ({e.GrupoMuscular})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Series / Repeticiones</label>
                          <input type="text" className="input-control" placeholder="Ej: 4x12, 3 series" value={newExerciseForm.Series_Repeticiones} onChange={e => setNewExerciseForm({...newExerciseForm, Series_Repeticiones: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Notas especiales</label>
                          <input type="text" className="input-control" placeholder="Ej: Peso ligero" value={newExerciseForm.Notas} onChange={e => setNewExerciseForm({...newExerciseForm, Notas: e.target.value})} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Añadir
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Display routine grouped by Day */}
                  <div className="space-y">
                    {uniqueDays.map(day => {
                      const dayExercises = studentRoutine
                        .filter(r => r.Dia === day)
                        .sort((a, b) => (Number(a.Orden) || 0) - (Number(b.Orden) || 0));
                        
                      return (
                        <div key={day} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.8rem', marginTop: '0.5rem' }}>
                            {day}
                          </h3>
                          <div className="space-y">
                            {dayExercises.map(item => {
                              const isEditing = editingExerciseId === item.id;
                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    background: 'var(--bg-main)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.6rem 0.8rem'
                                  }}
                                >
                                  {!isEditing ? (
                                    /* Normal Exercise Row */
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <strong style={{ fontSize: '1rem' }}>{item.Ejercicio}</strong>
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({item.Series_Repeticiones})</span>
                                        </div>
                                        {item.Notas && (
                                          <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'block', marginTop: '0.2rem' }}>
                                            💡 Nota: {item.Notas}
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                          className="btn btn-secondary"
                                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                          onClick={() => {
                                            setEditingExerciseId(item.id);
                                            setEditExerciseForm({ ...item });
                                          }}
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="btn btn-danger"
                                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                          onClick={() => handleDeleteExercise(item.id)}
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Inline Edit Exercise Form */
                                    <form onSubmit={handleSaveExerciseEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Series/Reps</label>
                                          <input type="text" className="input-control" style={{ padding: '0.3rem' }} value={editExerciseForm.Series_Repeticiones || ''} onChange={e => setEditExerciseForm({...editExerciseForm, Series_Repeticiones: e.target.value})} required />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Notas</label>
                                          <input type="text" className="input-control" style={{ padding: '0.3rem' }} value={editExerciseForm.Notas || ''} onChange={e => setEditExerciseForm({...editExerciseForm, Notas: e.target.value})} />
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn btn-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                          Guardar
                                        </button>
                                        <button type="button" className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setEditingExerciseId(null)}>
                                          Cancelar
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                    {studentRoutine.length > 0 && !isAddingExercise && (
                      <div style={{ marginTop: '1.5rem', background: 'var(--bg-main)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CARGAR MÁS DESDE PLANTILLA</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleApplyTemplate('Plan 3 Días')}>
                            + Plan 3 Días
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleApplyTemplate('Plan 5 Días')}>
                            + Plan 5 Días
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* No selected student display */
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ color: 'var(--primary)' }}>Gestión de Fichas y Rutinas</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Selecciona un alumno de la lista de la izquierda para ver su ficha, modificar sus observaciones médicas y configurar su rutina de ejercicios.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Student Overlay Modal */}
      {isAddingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Registrar Nuevo Alumno</h2>
            
            <form onSubmit={handleAddStudent} className="space-y">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input type="text" className="input-control" value={newStudentForm.Nombre} onChange={e => setNewStudentForm({...newStudentForm, Nombre: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input type="text" className="input-control" value={newStudentForm.Apellido} onChange={e => setNewStudentForm({...newStudentForm, Apellido: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Edad</label>
                  <input type="number" className="input-control" value={newStudentForm.Edad} onChange={e => setNewStudentForm({...newStudentForm, Edad: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Nivel</label>
                  <select className="input-control" value={newStudentForm.Nivel} onChange={e => setNewStudentForm({...newStudentForm, Nivel: e.target.value})}>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Días entrena</label>
                  <select className="input-control" value={newStudentForm.DiasEntrenamiento} onChange={e => setNewStudentForm({...newStudentForm, DiasEntrenamiento: e.target.value})}>
                    <option value="3 días">3 días</option>
                    <option value="4 días">4 días</option>
                    <option value="5 días">5 días</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Horario</label>
                  <select className="input-control" value={newStudentForm.Horario} onChange={e => setNewStudentForm({...newStudentForm, Horario: e.target.value})}>
                    <option value="Turno mañana">Turno mañana</option>
                    <option value="Turno tarde">Turno tarde</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Objetivo Principal</label>
                  <select className="input-control" value={newStudentForm.Objetivo} onChange={e => setNewStudentForm({...newStudentForm, Objetivo: e.target.value})}>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Tonificación">Tonificación</option>
                    <option value="Mejor resistencia">Mejor resistencia</option>
                    <option value="Aumentar fuerza">Aumentar fuerza</option>
                    <option value="Perder peso">Perder peso</option>
                    <option value="Rehabilitación">Rehabilitación</option>
                    <option value="Rendimiento deportivo">Rendimiento deportivo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Enfermedades o patologías</label>
                <input type="text" className="input-control" placeholder="Ej: Asma, Hipertensión..." value={newStudentForm.Enfermedades} onChange={e => setNewStudentForm({...newStudentForm, Enfermedades: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Restricciones médicas</label>
                <input type="text" className="input-control" placeholder="Ej: Evitar saltos..." value={newStudentForm.RestriccionesMedicas} onChange={e => setNewStudentForm({...newStudentForm, RestriccionesMedicas: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Deportes que practica</label>
                <input type="text" className="input-control" placeholder="Ej: Running, Ciclismo..." value={newStudentForm.Deportes} onChange={e => setNewStudentForm({...newStudentForm, Deportes: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddingStudent(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
