import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import { db } from './db';
import { initDb } from './seeder';
import { compare } from 'bcrypt-ts';

const app = new Hono();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'nexo-gym-secret-key-2026';

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Initialize database schema and data
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

// Global middleware to verify DB initialization
app.use('*', async (c, next) => {
  await ensureDb();
  await next();
});

// Protected routes middleware
app.use('/api/admin/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// --- FIELD MAPPERS ---
const mapAlumno = (row: any) => ({
  id: Number(row.id),
  ID: String(row.id),
  Nombre: row.nombre,
  Apellido: row.apellido,
  Edad: row.edad ? Number(row.edad) : null,
  Nivel: row.nivel,
  DiasEntrenamiento: row.dias_entrenamiento,
  Horario: row.horario,
  Objetivo: row.objetivo,
  Estado: row.estado,
  Lesionado: row.lesionado,
  DetalleLesion: row.detalle_lesion || '',
  Enfermedades: row.enfermedades || '',
  RestriccionesMedicas: row.restricciones_medicas || '',
  Deportes: row.deportes || '',
  Dni: row.dni || '',
  Celular: row.celular || '',
  Direccion: row.direccion || '',
  Mail: row.mail || ''
});

const mapEjercicio = (row: any) => ({
  id: Number(row.id),
  ID: String(row.id),
  Nombre: row.nombre,
  GrupoMuscular: row.grupo_muscular
});

const mapRutinaPredefinida = (row: any) => ({
  id: Number(row.id),
  ID: String(row.id),
  Plan: row.plan,
  Dia: row.dia,
  Ejercicio: row.ejercicio,
  Series_Repeticiones: row.series_repeticiones,
  Orden: Number(row.orden)
});

const mapRutinaAlumno = (row: any) => ({
  id: Number(row.id),
  ID: String(row.id),
  AlumnoID: String(row.alumno_id),
  Dia: row.dia,
  Ejercicio: row.ejercicio,
  Series_Repeticiones: row.series_repeticiones,
  Orden: Number(row.orden),
  Notas: row.notas || ''
});

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: 'Usuario y contraseña son requeridos' }, 400);
    }

    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username.toLowerCase()]
    });

    if (res.rows.length === 0) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    const user = res.rows[0];
    const passwordMatch = await compare(password, String(user.password_hash));
    
    if (!passwordMatch) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Generate JWT token (expires in 24 hours)
    const token = await sign({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }, JWT_SECRET, 'HS256');

    return c.json({
      token,
      user: {
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- PUBLIC ENDPOINTS ---

// Search students (Returns simplified list for select dropdowns)
app.get('/api/alumnos/search', async (c) => {
  try {
    const res = await db.execute("SELECT id, nombre, apellido, estado FROM alumnos WHERE estado = 'Alta'");
    const alumnos = res.rows.map(row => ({
      id: Number(row.id),
      ID: String(row.id),
      Nombre: String(row.nombre),
      Apellido: String(row.apellido),
      Estado: String(row.estado)
    }));
    return c.json(alumnos);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get a specific student's info and routine
app.get('/api/alumnos/:id/routine', async (c) => {
  try {
    const id = c.req.param('id');
    const alumnoRes = await db.execute({
      sql: 'SELECT * FROM alumnos WHERE id = ?',
      args: [id]
    });

    if (alumnoRes.rows.length === 0) {
      return c.json({ error: 'Alumno no encontrado' }, 404);
    }

    const student = mapAlumno(alumnoRes.rows[0]);

    // Fetch custom routine exercises
    const routineRes = await db.execute({
      sql: 'SELECT * FROM rutinas_alumnos WHERE alumno_id = ? ORDER BY orden ASC',
      args: [id]
    });

    const routine = routineRes.rows.map(mapRutinaAlumno);

    return c.json({ student, routine });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get available exercises catalog
app.get('/api/ejercicios', async (c) => {
  try {
    const res = await db.execute('SELECT * FROM ejercicios ORDER BY grupo_muscular, nombre');
    return c.json(res.rows.map(mapEjercicio));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- PROTECTED ADMIN ENDPOINTS ---

// Get all students
app.get('/api/admin/alumnos', async (c) => {
  try {
    const res = await db.execute('SELECT * FROM alumnos ORDER BY apellido, nombre');
    return c.json(res.rows.map(mapAlumno));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Create student
app.post('/api/admin/alumnos', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.Nombre || !body.Apellido) {
      return c.json({ error: 'Nombre y apellido son obligatorios' }, 400);
    }

    const res = await db.execute({
      sql: `INSERT INTO alumnos (
        nombre, apellido, edad, nivel, dias_entrenamiento, horario, objetivo, estado, lesionado, detalle_lesion, enfermedades, restricciones_medicas, deportes, dni, celular, direccion, mail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        body.Nombre,
        body.Apellido,
        body.Edad ? Number(body.Edad) : null,
        body.Nivel || 'Principiante',
        body.DiasEntrenamiento || '3 días',
        body.Horario || 'Turno mañana',
        body.Objetivo || 'Hipertrofia',
        body.Estado || 'Alta',
        body.Lesionado || 'No',
        body.DetalleLesion || '',
        body.Enfermedades || '',
        body.RestriccionesMedicas || '',
        body.Deportes || '',
        body.Dni || '',
        body.Celular || '',
        body.Direccion || '',
        body.Mail || ''
      ]
    });

    const newId = Number(res.lastInsertRowid);
    const newStudentRes = await db.execute({
      sql: 'SELECT * FROM alumnos WHERE id = ?',
      args: [newId]
    });

    return c.json(mapAlumno(newStudentRes.rows[0]), 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Update student
app.put('/api/admin/alumnos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    await db.execute({
      sql: `UPDATE alumnos SET 
        nombre = ?, apellido = ?, edad = ?, nivel = ?, dias_entrenamiento = ?, horario = ?, objetivo = ?, estado = ?, lesionado = ?, detalle_lesion = ?, enfermedades = ?, restricciones_medicas = ?, deportes = ?, dni = ?, celular = ?, direccion = ?, mail = ?
        WHERE id = ?`,
      args: [
        body.Nombre,
        body.Apellido,
        body.Edad ? Number(body.Edad) : null,
        body.Nivel,
        body.DiasEntrenamiento,
        body.Horario,
        body.Objetivo,
        body.Estado,
        body.Lesionado,
        body.DetalleLesion || '',
        body.Enfermedades || '',
        body.RestriccionesMedicas || '',
        body.Deportes || '',
        body.Dni || '',
        body.Celular || '',
        body.Direccion || '',
        body.Mail || '',
        id
      ]
    });

    const updatedRes = await db.execute({
      sql: 'SELECT * FROM alumnos WHERE id = ?',
      args: [id]
    });

    return c.json(mapAlumno(updatedRes.rows[0]));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
      sql: 'SELECT * FROM alumnos WHERE id = ?',
      args: [id]
    });

    return c.json(mapAlumno(updatedRes.rows[0]));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete student
app.delete('/api/admin/alumnos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await db.execute({
      sql: 'DELETE FROM alumnos WHERE id = ?',
      args: [id]
    });
    // Cascade delete custom routine
    await db.execute({
      sql: 'DELETE FROM rutinas_alumnos WHERE alumno_id = ?',
      args: [id]
    });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get predefined routines catalog
app.get('/api/admin/rutinas-predefinidas', async (c) => {
  try {
    const res = await db.execute('SELECT * FROM rutinas_predefinidas ORDER BY plan, orden');
    return c.json(res.rows.map(mapRutinaPredefinida));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get all routines (bulk query)
app.get('/api/admin/rutinas-alumnos', async (c) => {
  try {
    const res = await db.execute('SELECT * FROM rutinas_alumnos ORDER BY alumno_id, orden');
    return c.json(res.rows.map(mapRutinaAlumno));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Add exercise to student's routine
app.post('/api/admin/alumnos/:id/routine', async (c) => {
  try {
    const alumnoId = c.req.param('id');
    const body = await c.req.json();

    if (!body.Dia || !body.Ejercicio || !body.Series_Repeticiones) {
      return c.json({ error: 'Dia, Ejercicio y Series_Repeticiones son requeridos' }, 400);
    }

    const res = await db.execute({
      sql: 'INSERT INTO rutinas_alumnos (alumno_id, dia, ejercicio, series_repeticiones, orden, notas) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        alumnoId,
        body.Dia,
        body.Ejercicio,
        body.Series_Repeticiones,
        body.Orden ? Number(body.Orden) : 1,
        body.Notas || ''
      ]
    });

    const newId = Number(res.lastInsertRowid);
    const newRoutineRes = await db.execute({
      sql: 'SELECT * FROM rutinas_alumnos WHERE id = ?',
      args: [newId]
    });

    return c.json(mapRutinaAlumno(newRoutineRes.rows[0]), 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Edit exercise in custom routine
app.put('/api/admin/routine/:exerciseId', async (c) => {
  try {
    const exerciseId = c.req.param('exerciseId');
    const body = await c.req.json();

    await db.execute({
      sql: 'UPDATE rutinas_alumnos SET series_repeticiones = ?, notas = ? WHERE id = ?',
      args: [
        body.Series_Repeticiones,
        body.Notas || '',
        exerciseId
      ]
    });

    const updatedRes = await db.execute({
      sql: 'SELECT * FROM rutinas_alumnos WHERE id = ?',
      args: [exerciseId]
    });

    return c.json(mapRutinaAlumno(updatedRes.rows[0]));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete exercise from custom routine
app.delete('/api/admin/routine/:exerciseId', async (c) => {
  try {
    const exerciseId = c.req.param('exerciseId');
    await db.execute({
      sql: 'DELETE FROM rutinas_alumnos WHERE id = ?',
      args: [exerciseId]
    });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Apply pre-defined template to student's routine
app.post('/api/admin/alumnos/:id/routine/template', async (c) => {
  try {
    const alumnoId = c.req.param('id');
    const { templateName } = await c.req.json();

    if (!templateName) {
      return c.json({ error: 'templateName es requerido' }, 400);
    }

    // Fetch template exercises
    const templateRes = await db.execute({
      sql: 'SELECT * FROM rutinas_predefinidas WHERE plan = ? ORDER BY orden ASC',
      args: [templateName]
    });

    if (templateRes.rows.length === 0) {
      return c.json({ error: 'Plantilla no encontrada o vacía' }, 404);
    }

    // Bulk insert exercises into student's routine
    for (const row of templateRes.rows) {
      await db.execute({
        sql: 'INSERT INTO rutinas_alumnos (alumno_id, dia, ejercicio, series_repeticiones, orden, notas) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
          alumnoId,
          row.dia,
          row.ejercicio,
          row.series_repeticiones,
          row.orden,
          ''
        ]
      });
    }

    return c.json({ success: true, count: templateRes.rows.length });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Clear routine completely for student
app.delete('/api/admin/alumnos/:id/routine', async (c) => {
  try {
    const alumnoId = c.req.param('id');
    await db.execute({
      sql: 'DELETE FROM rutinas_alumnos WHERE alumno_id = ?',
      args: [alumnoId]
    });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- PROTECTED ADMIN ENDPOINTS FOR EXERCISES (ABM) ---

// Create exercise
app.post('/api/admin/ejercicios', async (c) => {
  try {
    const { Nombre, GrupoMuscular } = await c.req.json();
    if (!Nombre || !GrupoMuscular) {
      return c.json({ error: 'Nombre y Grupo muscular son obligatorios' }, 400);
    }
    const res = await db.execute({
      sql: 'INSERT INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)',
      args: [Nombre, GrupoMuscular]
    });
    const newId = Number(res.lastInsertRowid);
    return c.json({ id: newId, ID: String(newId), Nombre, GrupoMuscular }, 201);
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Ya existe un ejercicio registrado con ese nombre.' }, 409);
    }
    return c.json({ error: err.message }, 500);
  }
});

// Edit exercise
app.put('/api/admin/ejercicios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { Nombre, GrupoMuscular } = await c.req.json();
    if (!Nombre || !GrupoMuscular) {
      return c.json({ error: 'Nombre y Grupo muscular son obligatorios' }, 400);
    }
    await db.execute({
      sql: 'UPDATE ejercicios SET nombre = ?, grupo_muscular = ? WHERE id = ?',
      args: [Nombre, GrupoMuscular, id]
    });
    return c.json({ id: Number(id), ID: String(id), Nombre, GrupoMuscular });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete exercise
app.delete('/api/admin/ejercicios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await db.execute({
      sql: 'DELETE FROM ejercicios WHERE id = ?',
      args: [id]
    });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
