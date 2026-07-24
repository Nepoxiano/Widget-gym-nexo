import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export default function AdminWidget({ onLogout }) {
  const [alumnos, setAlumnos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [rutinasPredefinidas, setRutinasPredefinidas] = useState([]);
  const [rutinasAlumnos, setRutinasAlumnos] = useState([]);
  
  // Navigation State
  const [activeMenu, setActiveMenu] = useState('rutinas'); // 'rutinas' | 'alumnos' | 'ejercicios'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Routine planner states
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Alta');
  const [filterInjured, setFilterInjured] = useState('Todos');
  
  // Catalog exercise states
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [newCatalogExercise, setNewCatalogExercise] = useState({ Nombre: '', GrupoMuscular: 'Pecho' });
  const [editingCatalogId, setEditingCatalogId] = useState(null);
  const [editCatalogForm, setEditCatalogForm] = useState({ Nombre: '', GrupoMuscular: 'Pecho' });

  // Directorio Alumnos search
  const [dirSearch, setDirSearch] = useState('');

  // Modals / Dialogs states
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudentModal, setIsEditingStudentModal] = useState(false);
  const [viewingMedicalDetails, setViewingMedicalDetails] = useState(null); // student object

  // Form states
  const [editForm, setEditForm] = useState({});
  const [newStudentForm, setNewStudentForm] = useState({
    Nombre: '', Apellido: '', Edad: '', Nivel: 'Principiante',
    DiasEntrenamiento: '3 días', Horario: 'Turno mañana',
    Objetivo: 'Hipertrofia', Estado: 'Alta', Lesionado: 'No',
    DetalleLesion: '', Enfermedades: '', RestriccionesMedicas: '', Deportes: '',
    Dni: '', Celular: '', Direccion: '', Mail: ''
  });
  
  // Custom routine exercise adding states
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isCustomDay, setIsCustomDay] = useState(false);
  const [customDayName, setCustomDayName] = useState('');
  const [newExerciseForm, setNewExerciseForm] = useState({
    Dia: 'Día 1', Ejercicio: '', Series_Repeticiones: '3x10', Notas: ''
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
    }
  }, [selectedAlumno]);

  // Filter student list FOR ROUTINE VIEW (limited to max 5 results)
  const filteredAlumnos = alumnos.filter(student => {
    const fullName = `${student.Nombre} ${student.Apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'Todos' || student.Nivel === filterLevel;
    const matchesStatus = filterStatus === 'Todos' || student.Estado === filterStatus;
    const matchesInjured = filterInjured === 'Todos' || 
      (filterInjured === 'Lesionados' && student.Lesionado === 'Sí') ||
      (filterInjured === 'Sanos' && student.Lesionado === 'No');
      
    return matchesSearch && matchesLevel && matchesStatus && matchesInjured;
  }).slice(0, 5); // Limit the list to maximum of 5 people

  // Filter exercises in Catalog
  const filteredCatalogEjercicios = ejercicios.filter(e => 
    e.Nombre.toLowerCase().includes(exerciseSearch.toLowerCase()) || 
    e.GrupoMuscular.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // Filter students in Directorio
  const filteredDirAlumnos = alumnos.filter(student => {
    const term = dirSearch.toLowerCase();
    const fullName = `${student.Nombre} ${student.Apellido}`.toLowerCase();
    const dni = (student.Dni || '').toLowerCase();
    return fullName.includes(term) || dni.includes(term);
  });

  // Handle profile update
  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedStudent = await apiClient.put(`/api/admin/alumnos/${editForm.id}`, editForm);
      setIsEditingStudentModal(false);
      
      // Update local state
      setAlumnos(prev => prev.map(a => a.id === updatedStudent.id ? updatedStudent : a));
      alert('Ficha de alumno actualizada.');
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
        DetalleLesion: '', Enfermedades: '', RestriccionesMedicas: '', Deportes: '',
        Dni: '', Celular: '', Direccion: '', Mail: ''
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
      
      setRutinasAlumnos(prev => [...prev, addedExercise]);
      setIsAddingExercise(false);
      setIsCustomDay(false);
      setCustomDayName('');
      setNewExerciseForm(prev => ({
        ...prev,
        Dia: 'Día 1',
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
        setRutinasAlumnos(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('Error al borrar el ejercicio: ' + err.message);
      }
    }
  };

  // Delete student completely
  const handleDeleteStudent = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar permanentemente a este alumno y todas sus rutinas?')) {
      try {
        await apiClient.delete(`/api/admin/alumnos/${id}`);
        setAlumnos(prev => prev.filter(a => a.id !== id));
        if (String(selectedAlumnoId) === String(id)) {
          setSelectedAlumnoId('');
        }
        alert('Alumno eliminado.');
      } catch (err) {
        alert('Error al eliminar alumno: ' + err.message);
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
      
      setRutinasAlumnos(prev => prev.map(r => r.id === editingExerciseId ? updated : r));
      setEditingExerciseId(null);
    } catch (err) {
      alert('Error al actualizar el ejercicio: ' + err.message);
    }
  };

  // --- CATALOG EXERCISES ABM METHODS ---
  const handleAddCatalogExercise = async (e) => {
    e.preventDefault();
    if (!newCatalogExercise.Nombre) return;
    try {
      const added = await apiClient.post('/api/admin/ejercicios', newCatalogExercise);
      setEjercicios(prev => [...prev, added].sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
      setNewCatalogExercise({ Nombre: '', GrupoMuscular: 'Pecho' });
      alert('Ejercicio agregado al catálogo.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCatalogEdit = async (id) => {
    if (!editCatalogForm.Nombre) return;
    try {
      const updated = await apiClient.put(`/api/admin/ejercicios/${id}`, editCatalogForm);
      setEjercicios(prev => prev.map(e => e.id === id ? updated : e));
      setEditingCatalogId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCatalogExercise = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este ejercicio del catálogo? Se quitará de la lista de opciones para rutinas.')) {
      try {
        await apiClient.delete(`/api/admin/ejercicios/${id}`);
        setEjercicios(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Group active student's routine by day
  const studentRoutine = selectedAlumno
    ? rutinasAlumnos.filter(r => String(r.AlumnoID) === String(selectedAlumno.id))
    : [];

  const uniqueDays = [...new Set(studentRoutine.map(r => r.Dia))].sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  // --- RENDER COMPONENT VIEWS ---

  // 1. ROUTINES PLANNING VIEW (Dashboard Principal)
  const renderRutinasView = () => (
    <div className="grid-cols-2 fade-in">
      {/* Left Side: Students List */}
      <div className="glass-panel space-y" style={{ padding: '1.25rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Rutinas de Alumnos</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lista rápida (Máx. 5)</span>
        </div>
        
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
            {/* Profile Details Card (Quick Read) */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: 'var(--primary)' }}>Ficha de {selectedAlumno.Nombre}</h2>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                  onClick={() => {
                    setEditForm({ ...selectedAlumno });
                    setIsEditingStudentModal(true);
                  }}
                >
                  Editar Ficha Completa
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>EDAD</p>
                  <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Edad || 'No especificado'} años</p>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>HORARIO DE PREFERENCIA</p>
                  <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Horario}</p>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DÍAS A LA SEMANA</p>
                  <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.DiasEntrenamiento}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ENFERMEDADES O PATOLOGÍAS</p>
                  <p style={{ fontWeight: '600', color: selectedAlumno.Enfermedades ? 'var(--warning)' : 'var(--text-primary)', marginBottom: '0.8rem' }}>
                    {selectedAlumno.Enfermedades || 'Ninguna'}
                  </p>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>RESTRICCIONES MÉDICAS</p>
                  <p style={{ fontWeight: '600', color: selectedAlumno.RestriccionesMedicas ? 'var(--danger)' : 'var(--text-primary)', marginBottom: '0.8rem' }}>
                    {selectedAlumno.RestriccionesMedicas || 'Ninguna'}
                  </p>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DEPORTES EXTRAS</p>
                  <p style={{ fontWeight: '600', marginBottom: '0.8rem' }}>{selectedAlumno.Deportes || 'Ninguno'}</p>
                </div>
              </div>
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
                      <select 
                        className="input-control" 
                        value={isCustomDay ? 'custom' : newExerciseForm.Dia} 
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setIsCustomDay(true);
                            setNewExerciseForm({...newExerciseForm, Dia: customDayName || 'Día Personalizado'});
                          } else {
                            setIsCustomDay(false);
                            setNewExerciseForm({...newExerciseForm, Dia: val});
                          }
                        }}
                      >
                        <option value="Día 1">Día 1</option>
                        <option value="Día 2">Día 2</option>
                        <option value="Día 3">Día 3</option>
                        <option value="Día 4">Día 4</option>
                        <option value="Día 5">Día 5</option>
                        <option value="Día 6">Día 6</option>
                        <option value="Día 1 - Piernas (Cuádriceps)">Día 1 - Piernas (Cuádriceps)</option>
                        <option value="Día 2 - Espalda + Bíceps">Día 2 - Espalda + Bíceps</option>
                        <option value="Día 3 - Hombros + Pecho">Día 3 - Hombros + Pecho</option>
                        <option value="Día 4 - Piernas (Posteriores)">Día 4 - Piernas (Posteriores)</option>
                        <option value="Día 5 - Full Body">Día 5 - Full Body</option>
                        <option value="Día 1 - Pecho + hombros + tríceps">Día 1 - Pecho + hombros + tríceps</option>
                        <option value="Día 2 - Espalda + hombros + bíceps">Día 2 - Espalda + hombros + bíceps</option>
                        <option value="Día 3 - Cuádriceps + femorales">Día 3 - Cuádriceps + femorales</option>
                        <option value="custom">Otro (Día Personalizado...)</option>
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

                  {isCustomDay && (
                    <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                      <label>Nombre del Día Personalizado</label>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Ej: Día 6 - Cardio o Día 4 - HIIT" 
                        value={customDayName}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomDayName(val);
                          setNewExerciseForm({...newExerciseForm, Dia: val});
                        }}
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem', marginTop: '0.75rem' }}>
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
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--primary)' }}>Gestión de Fichas y Rutinas</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Selecciona un alumno de la lista rápida para configurar su rutina de ejercicios.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // 2. DIRECTORIO COMPLETO DE ALUMNOS (ABM Alumnos completo con campos nuevos)
  const renderAlumnosView = () => (
    <div className="glass-panel space-y fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Directorio de Alumnos Registrados</h2>
        <button className="btn btn-success" onClick={() => setIsAddingStudent(true)}>
          + Nuevo Alumno
        </button>
      </div>

      <input
        type="text"
        className="input-control"
        placeholder="Buscar por nombre, apellido o DNI..."
        value={dirSearch}
        onChange={e => setDirSearch(e.target.value)}
        style={{ maxWidth: '400px' }}
      />

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>DNI</th>
              <th>Celular</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Horario</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Ficha Médica</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDirAlumnos.length > 0 ? (
              filteredDirAlumnos.map(student => (
                <tr key={student.id}>
                  <td><strong>{student.Nombre} {student.Apellido}</strong></td>
                  <td>{student.Dni || '-'}</td>
                  <td>{student.Celular || '-'}</td>
                  <td><span style={{ fontSize: '0.8rem' }}>{student.Mail || '-'}</span></td>
                  <td><span style={{ fontSize: '0.8rem' }}>{student.Direccion || '-'}</span></td>
                  <td>{student.Horario}</td>
                  <td>{student.Nivel}</td>
                  <td>
                    <span className={`badge ${student.Estado === 'Alta' ? 'badge-admin' : 'badge-student'}`}>
                      {student.Estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', textTransform: 'none' }}
                      onClick={() => setViewingMedicalDetails(student)}
                    >
                      Ver Ficha
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setEditForm({ ...student });
                          setIsEditingStudentModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron alumnos registrados en el directorio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 3. EXERCISES CATALOG VIEW (ABM de catálogo de ejercicios)
  const renderEjerciciosView = () => (
    <div className="grid-cols-2 fade-in">
      {/* Left side: Add new exercise to catalog */}
      <div className="glass-panel space-y" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h2>Registrar Nuevo Ejercicio</h2>
        <form onSubmit={handleAddCatalogExercise} className="space-y">
          <div className="form-group">
            <label>Nombre del Ejercicio</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="Ej: Press de Pecho Inclinado" 
              value={newCatalogExercise.Nombre}
              onChange={e => setNewCatalogExercise({...newCatalogExercise, Nombre: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Grupo Muscular / Categoría</label>
            <select 
              className="input-control" 
              value={newCatalogExercise.GrupoMuscular}
              onChange={e => setNewCatalogExercise({...newCatalogExercise, GrupoMuscular: e.target.value})}
            >
              <option value="Pecho">Pecho</option>
              <option value="Espalda">Espalda</option>
              <option value="Hombros">Hombros</option>
              <option value="Bíceps">Bíceps</option>
              <option value="Tríceps">Tríceps</option>
              <option value="Piernas (Cuádriceps)">Piernas (Cuádriceps)</option>
              <option value="Piernas (Posteriores)">Piernas (Posteriores)</option>
              <option value="Piernas (Glúteos)">Piernas (Glúteos)</option>
              <option value="Gemelos">Gemelos</option>
              <option value="Core">Core</option>
              <option value="Cardio">Cardio</option>
              <option value="General">General</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Añadir al Catálogo
          </button>
        </form>
      </div>

      {/* Right side: Catalog List */}
      <div className="glass-panel space-y" style={{ padding: '1.5rem' }}>
        <h2>Catálogo de Ejercicios del Gym</h2>
        
        <input 
          type="text" 
          className="input-control" 
          placeholder="Buscar ejercicio o grupo..." 
          value={exerciseSearch}
          onChange={e => setExerciseSearch(e.target.value)}
        />

        <div className="scroll-panel" style={{ maxHeight: '500px', marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th>Grupo Muscular</th>
                <th style={{ textAlign: 'center', width: '110px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalogEjercicios.length > 0 ? (
                filteredCatalogEjercicios.map(ex => {
                  const isEditingThis = editingCatalogId === ex.id;
                  return (
                    <tr key={ex.id}>
                      {isEditingThis ? (
                        <>
                          <td>
                            <input 
                              type="text" 
                              className="input-control" 
                              value={editCatalogForm.Nombre}
                              onChange={e => setEditCatalogForm({...editCatalogForm, Nombre: e.target.value})}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                              required
                            />
                          </td>
                          <td>
                            <select 
                              className="input-control" 
                              value={editCatalogForm.GrupoMuscular}
                              onChange={e => setEditCatalogForm({...editCatalogForm, GrupoMuscular: e.target.value})}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                            >
                              <option value="Pecho">Pecho</option>
                              <option value="Espalda">Espalda</option>
                              <option value="Hombros">Hombros</option>
                              <option value="Bíceps">Bíceps</option>
                              <option value="Tríceps">Tríceps</option>
                              <option value="Piernas (Cuádriceps)">Piernas (Cuádriceps)</option>
                              <option value="Piernas (Posteriores)">Piernas (Posteriores)</option>
                              <option value="Piernas (Glúteos)">Piernas (Glúteos)</option>
                              <option value="Gemelos">Gemelos</option>
                              <option value="Core">Core</option>
                              <option value="Cardio">Cardio</option>
                              <option value="General">General</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                              <button 
                                className="btn btn-success" 
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => handleSaveCatalogEdit(ex.id)}
                              >
                                ✔️
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => setEditingCatalogId(null)}
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td><strong>{ex.Nombre}</strong></td>
                          <td>{ex.GrupoMuscular}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  setEditingCatalogId(ex.id);
                                  setEditCatalogForm({ Nombre: ex.Nombre, GrupoMuscular: ex.GrupoMuscular });
                                }}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => handleDeleteCatalogExercise(ex.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No hay ejercicios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Modal: Agregar Alumno
  const renderAddStudentModal = () => (
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
              <label>DNI</label>
              <input type="text" className="input-control" placeholder="Ej: 38123456" value={newStudentForm.Dni} onChange={e => setNewStudentForm({...newStudentForm, Dni: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Celular</label>
              <input type="text" className="input-control" placeholder="Ej: 1123456789" value={newStudentForm.Celular} onChange={e => setNewStudentForm({...newStudentForm, Celular: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Edad</label>
              <input type="number" className="input-control" value={newStudentForm.Edad} onChange={e => setNewStudentForm({...newStudentForm, Edad: Number(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Dirección</label>
              <input type="text" className="input-control" placeholder="Dirección completa" value={newStudentForm.Direccion} onChange={e => setNewStudentForm({...newStudentForm, Direccion: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email de contacto</label>
              <input type="email" className="input-control" placeholder="ejemplo@correo.com" value={newStudentForm.Mail} onChange={e => setNewStudentForm({...newStudentForm, Mail: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                <option value="1 día">1 día</option>
                <option value="2 días">2 días</option>
                <option value="3 días">3 días</option>
                <option value="4 días">4 días</option>
                <option value="5 días">5 días</option>
                <option value="6 días">6 días</option>
              </select>
            </div>
            <div className="form-group">
              <label>Horario</label>
              <select className="input-control" value={newStudentForm.Horario} onChange={e => setNewStudentForm({...newStudentForm, Horario: e.target.value})}>
                <option value="Turno mañana">Turno mañana</option>
                <option value="Turno tarde">Turno tarde</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            <div className="form-group">
              <label>¿Lesionado?</label>
              <select className="input-control" value={newStudentForm.Lesionado} onChange={e => setNewStudentForm({...newStudentForm, Lesionado: e.target.value})}>
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
          </div>

          {newStudentForm.Lesionado === 'Sí' && (
            <div className="form-group">
              <label>Detalle de lesión o molestias</label>
              <textarea className="input-control" placeholder="Describir lesión..." value={newStudentForm.DetalleLesion} onChange={e => setNewStudentForm({...newStudentForm, DetalleLesion: e.target.value})} rows="2" />
            </div>
          )}

          <div className="form-group">
            <label>Enfermedades o patologías generales</label>
            <input type="text" className="input-control" placeholder="Ej: Asma, Hipertensión..." value={newStudentForm.Enfermedades} onChange={e => setNewStudentForm({...newStudentForm, Enfermedades: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Restricciones médicas específicas</label>
            <input type="text" className="input-control" placeholder="Ej: Evitar saltos..." value={newStudentForm.RestriccionesMedicas} onChange={e => setNewStudentForm({...newStudentForm, RestriccionesMedicas: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Deportes que practica además del gym</label>
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
  );

  // Modal: Editar Alumno Completo
  const renderEditStudentModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Editar Ficha del Alumno</h2>
        
        <form onSubmit={handleUpdateProfileSubmit} className="space-y">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre *</label>
              <input type="text" className="input-control" value={editForm.Nombre || ''} onChange={e => setEditForm({...editForm, Nombre: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input type="text" className="input-control" value={editForm.Apellido || ''} onChange={e => setEditForm({...editForm, Apellido: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>DNI</label>
              <input type="text" className="input-control" value={editForm.Dni || ''} onChange={e => setEditForm({...editForm, Dni: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Celular</label>
              <input type="text" className="input-control" value={editForm.Celular || ''} onChange={e => setEditForm({...editForm, Celular: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Edad</label>
              <input type="number" className="input-control" value={editForm.Edad || ''} onChange={e => setEditForm({...editForm, Edad: Number(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Dirección</label>
              <input type="text" className="input-control" value={editForm.Direccion || ''} onChange={e => setEditForm({...editForm, Direccion: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email de contacto</label>
              <input type="email" className="input-control" value={editForm.Mail || ''} onChange={e => setEditForm({...editForm, Mail: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nivel</label>
              <select className="input-control" value={editForm.Nivel || 'Principiante'} onChange={e => setEditForm({...editForm, Nivel: e.target.value})}>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Días entrena</label>
              <select className="input-control" value={editForm.DiasEntrenamiento || '3 días'} onChange={e => setEditForm({...editForm, DiasEntrenamiento: e.target.value})}>
                <option value="1 día">1 día</option>
                <option value="2 días">2 días</option>
                <option value="3 días">3 días</option>
                <option value="4 días">4 días</option>
                <option value="5 días">5 días</option>
                <option value="6 días">6 días</option>
              </select>
            </div>
            <div className="form-group">
              <label>Horario</label>
              <select className="input-control" value={editForm.Horario || 'Turno mañana'} onChange={e => setEditForm({...editForm, Horario: e.target.value})}>
                <option value="Turno mañana">Turno mañana</option>
                <option value="Turno tarde">Turno tarde</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Objetivo Principal</label>
              <select className="input-control" value={editForm.Objetivo || 'Hipertrofia'} onChange={e => setEditForm({...editForm, Objetivo: e.target.value})}>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Tonificación">Tonificación</option>
                <option value="Mejor resistencia">Mejor resistencia</option>
                <option value="Aumentar fuerza">Aumentar fuerza</option>
                <option value="Perder peso">Perder peso</option>
                <option value="Rehabilitación">Rehabilitación</option>
                <option value="Rendimiento deportivo">Rendimiento deportivo</option>
              </select>
            </div>
            <div className="form-group">
              <label>¿Lesionado?</label>
              <select className="input-control" value={editForm.Lesionado || 'No'} onChange={e => setEditForm({...editForm, Lesionado: e.target.value})}>
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
            <label>Enfermedades o patologías generales</label>
            <input type="text" className="input-control" value={editForm.Enfermedades || ''} onChange={e => setEditForm({...editForm, Enfermedades: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Restricciones médicas específicas</label>
            <input type="text" className="input-control" value={editForm.RestriccionesMedicas || ''} onChange={e => setEditForm({...editForm, RestriccionesMedicas: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Deportes que practica además del gym</label>
            <input type="text" className="input-control" value={editForm.Deportes || ''} onChange={e => setEditForm({...editForm, Deportes: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Estado de Cuenta</label>
              <select className="input-control" value={editForm.Estado || 'Alta'} onChange={e => setEditForm({...editForm, Estado: e.target.value})}>
                <option value="Alta">Alta (Activo)</option>
                <option value="Baja">Baja (Inactivo)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditingStudentModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal: Ficha Médica Completa
  const renderMedicalDetailsModal = () => {
    if (!viewingMedicalDetails) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>
            Ficha Médica: {viewingMedicalDetails.Nombre} {viewingMedicalDetails.Apellido}
          </h2>
          
          <div className="space-y" style={{ fontSize: '0.95rem', margin: '1.5rem 0' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>¿Tiene lesiones activas?</p>
              <p style={{ fontWeight: 'bold', color: viewingMedicalDetails.Lesionado === 'Sí' ? 'var(--danger)' : 'var(--success)' }}>
                {viewingMedicalDetails.Lesionado === 'Sí' ? 'Sí' : 'No'}
              </p>
            </div>
            {viewingMedicalDetails.Lesionado === 'Sí' && (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Detalle de lesión</p>
                <p style={{ fontWeight: '500' }}>{viewingMedicalDetails.DetalleLesion || 'Sin detalle cargado'}</p>
              </div>
            )}
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Restricciones Médicas</p>
              <p style={{ fontWeight: '500', color: viewingMedicalDetails.RestriccionesMedicas ? 'var(--danger)' : 'var(--text-primary)' }}>
                {viewingMedicalDetails.RestriccionesMedicas || 'Ninguna'}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Enfermedades o Patologías</p>
              <p style={{ fontWeight: '500', color: viewingMedicalDetails.Enfermedades ? 'var(--warning)' : 'var(--text-primary)' }}>
                {viewingMedicalDetails.Enfermedades || 'Ninguna'}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Otros Deportes Practicados</p>
              <p style={{ fontWeight: '500' }}>{viewingMedicalDetails.Deportes || 'Ninguno'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => setViewingMedicalDetails(null)}>
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN LAYOUT RENDER ---
  return (
    <div className="admin-layout">
      {/* Mobile Top Bar (Hidden on Desktop) */}
      <header className="mobile-admin-header screen-only">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.75rem',
            color: 'var(--primary)',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1
          }}
          title="Abrir Menú"
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: '30px', width: '30px', borderRadius: '50%', objectFit: 'cover' }} />
          <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', letterSpacing: '0.5px' }}>NEXO GYM</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
          Prof. Talia
        </div>
      </header>

      {/* Sidebar Backdrop overlay on mobile when open */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop screen-only" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Mobile-only close button header */}
        <div className="sidebar-mobile-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            title="Cerrar Menú"
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }} className="sidebar-logo-area">
          <img 
            src="/logo.jpg" 
            alt="Logo Nexo Gym" 
            style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
          />
          <span style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--primary)' }}>
            NEXO GYM
          </span>
        </div>
        
        <div style={{ marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }} className="sidebar-user-area">
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
            Profesor Activo
          </span>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Talia Peralta</strong>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeMenu === 'rutinas' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('rutinas'); setIsSidebarOpen(false); }}
          >
            📋 Planificación de Rutinas
          </button>
          <button 
            className={`sidebar-nav-item ${activeMenu === 'alumnos' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('alumnos'); setIsSidebarOpen(false); }}
          >
            👥 Directorio de Alumnos
          </button>
          <button 
            className={`sidebar-nav-item ${activeMenu === 'ejercicios' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('ejercicios'); setIsSidebarOpen(false); }}
          >
            🏋️ Catálogo de Ejercicios
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => { onLogout(); setIsSidebarOpen(false); }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeMenu === 'rutinas' && renderRutinasView()}
        {activeMenu === 'alumnos' && renderAlumnosView()}
        {activeMenu === 'ejercicios' && renderEjerciciosView()}
      </main>
      
      {/* Overlays / Modals */}
      {isAddingStudent && renderAddStudentModal()}
      {isEditingStudentModal && renderEditStudentModal()}
      {viewingMedicalDetails && renderMedicalDetailsModal()}
    </div>
  );
}
