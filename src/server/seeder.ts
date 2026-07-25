import { db } from './db';
import { hash } from 'bcrypt-ts';

export async function initDb() {
  console.log('Initializing database tables...');
  try {
    // 1. Create tables if they do not exist
    
    // Users Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        name TEXT,
        role TEXT
      )
    `);

    // Alumnos Table (including new contact columns)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        apellido TEXT,
        edad INTEGER,
        nivel TEXT,
        dias_entrenamiento TEXT,
        horario TEXT,
        objetivo TEXT,
        estado TEXT,
        lesionado TEXT,
        detalle_lesion TEXT,
        enfermedades TEXT,
        restricciones_medicas TEXT,
        deportes TEXT,
        dni TEXT,
        celular TEXT,
        direccion TEXT,
        mail TEXT
      )
    `);

    // Safely apply migrations for existing databases that were created without the new columns
    const columnsToMigrate = [
      { name: 'dni', type: 'TEXT' },
      { name: 'celular', type: 'TEXT' },
      { name: 'direccion', type: 'TEXT' },
      { name: 'mail', type: 'TEXT' }
    ];

    for (const col of columnsToMigrate) {
      try {
        await db.execute(`ALTER TABLE alumnos ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Column '${col.name}' added to table 'alumnos' successfully.`);
      } catch (e: any) {
        // SQLite will throw an error if the column already exists, which we safely ignore
        if (!e.message.includes('duplicate column name') && !e.message.includes('already exists')) {
          console.warn(`Attempted to add column '${col.name}':`, e.message);
        }
      }
    }

    // Ejercicios Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ejercicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        grupo_muscular TEXT
      )
    `);

    // Rutinas Predefinidas Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS rutinas_predefinidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan TEXT,
        dia TEXT,
        ejercicio TEXT,
        series_repeticiones TEXT,
        orden INTEGER
      )
    `);

    // Rutinas Alumnos Table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS rutinas_alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alumno_id INTEGER,
        dia TEXT,
        ejercicio TEXT,
        series_repeticiones TEXT,
        orden INTEGER,
        notas TEXT
      )
    `);

    console.log('Tables initialized. Seeding initial data...');

    // 2. Seed Users if empty
    const userCheck = await db.execute('SELECT COUNT(*) as count FROM users');
    const userCount = Number(userCheck.rows[0].count);
    if (userCount === 0) {
      console.log('Seeding user: talia');
      const passHash = await hash('nexo2026', 10);
      await db.execute({
        sql: 'INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
        args: ['talia', passHash, 'Talia Peralta', 'professor']
      });
    }

    // 3. Seed Ejercicios if empty
    const ejercicioCheck = await db.execute('SELECT COUNT(*) as count FROM ejercicios');
    const ejercicioCount = Number(ejercicioCheck.rows[0].count);
    if (ejercicioCount === 0) {
      console.log('Seeding exercises...');
      const defaultEjercicios = [
        // Pecho
        ["Press banca plano", "Pecho"],
        ["Press inclinado (mancuernas)", "Pecho"],
        ["Cruces en polea alta", "Pecho"],
        ["Aperturas con mancuernas", "Pecho"],
        ["Press pecho maquina", "Pecho"],
        ["Aperturas peck deck", "Pecho"],
        ["Pullover", "Pecho"],
        // Hombros
        ["Press Militar con mancuernas", "Hombros"],
        ["Vuelos laterales en maquina", "Hombros"],
        ["Vuelos posteriores", "Hombros"],
        ["Press militar", "Hombros"],
        ["Elevaciones laterales", "Hombros"],
        ["Deltoides posteriores", "Hombros"],
        ["Face pull", "Hombros"],
        // Tríceps
        ["Fondos en máquina", "Tríceps"],
        ["Press Francés", "Tríceps"],
        // Espalda
        ["Remo con barra", "Espalda"],
        ["Jalón al pecho", "Espalda"],
        ["Remo bajo (agarre amplio)", "Espalda"],
        ["Remo bajo", "Espalda"],
        ["Remo unilateral", "Espalda"],
        ["Encogimientos con barra", "Espalda"],
        // Bíceps
        ["Curl de Bíceps unilateral", "Bíceps"],
        ["Curl Martillo", "Bíceps"],
        ["Curl de bíceps con barra", "Bíceps"],
        ["Curl martillo", "Bíceps"],
        // Piernas
        ["Sentadilla libre con barra", "Piernas (Cuádriceps)"],
        ["Prensa", "Piernas (Cuádriceps)"],
        ["Extensión de cuádriceps", "Piernas (Cuádriceps)"],
        ["Hack squat", "Piernas (Cuádriceps)"],
        ["Búlgara", "Piernas (Cuádriceps)"],
        ["Peso muerto Rumano con barra", "Piernas (Posteriores)"],
        ["Peso muerto rumano", "Piernas (Posteriores)"],
        ["Curl femoral", "Piernas (Posteriores)"],
        ["Hip thrust", "Piernas (Glúteos)"],
        ["Abducción de cadera", "Piernas (Glúteos)"],
        // Gemelos & Core
        ["Gemelos", "Gemelos"],
        ["Abdominales", "Core"],
        ["Plancha", "Core"]
      ];
      for (const [nombre, grupo] of defaultEjercicios) {
        await db.execute({
          sql: 'INSERT INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)',
          args: [nombre, grupo]
        });
      }
    }

    // 4. Wipe old mock database entries if they are present (Pamela, Juan, etc.)
    const oldCheck = await db.execute("SELECT COUNT(*) as count FROM alumnos WHERE nombre = 'Pamela' AND apellido = 'Gómez'");
    if (Number(oldCheck.rows[0].count) > 0) {
      console.log('Old sample students found. Wiping tables for clean real data seed...');
      await db.execute('DELETE FROM rutinas_alumnos');
      await db.execute('DELETE FROM alumnos');
    }

    // Seed Alumnos if empty
    const alumnoCheck = await db.execute('SELECT COUNT(*) as count FROM alumnos');
    const alumnoCount = Number(alumnoCheck.rows[0].count);
    if (alumnoCount === 0) {
      console.log('Seeding real students from list...');
      const defaultAlumnos = [
        ["Maite", "", 17, "Principiante", "3 días", "Turno mañana", "Tonificación", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""],
        ["Sabrina", "Pages", 43, "Avanzado", "3 días", "Turno mañana", "Hipertrofia", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Belen", "Di Benedetto", 31, "Principiante", "3 días", "Turno mañana", "Hipertrofia", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Maria", "Gonzalez", 44, "Principiante", "3 días", "Turno mañana", "Perder peso", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Stefania", "Aspetia", 26, "Intermedio", "3 días", "Turno mañana", "Tonificación", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""],
        ["Saniuk", "Nahir", 21, "Principiante", "3 días", "Turno mañana", "Hipertrofia", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Natalia", "Laplace", 45, "Principiante", "3 días", "Turno mañana", "Tonificación", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""],
        ["Lucia", "Zarandona", 22, "Principiante", "3 días", "Turno mañana", "Tonificación", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Facundo", "Rodriguez", 23, "Principiante", "3 días", "Turno mañana", "Hipertrofia", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Ludmila", "Alvarez", 25, "Intermedio", "3 días", "Turno mañana", "Tonificación", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Gloria", "Rios", 51, "Avanzado", "3 días", "Turno mañana", "Perder peso", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Ayelen", "Candia", 26, "Intermedio", "3 días", "Turno mañana", "Tonificación", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""],
        ["Romagnoli", "Gonzalo", 32, "Principiante", "3 días", "Turno mañana", "Hipertrofia", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""],
        ["Stefania", "Pogger", 39, "Intermedio", "3 días", "Turno mañana", "Hipertrofia", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Buzeta", "Graciela", 47, "Intermedio", "3 días", "Turno mañana", "Tonificación", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Trentini", "Graciela", 47, "Intermedio", "3 días", "Turno mañana", "Tonificación", "Alta", "No", "", "", "", "", "", "", "", ""],
        ["Ledesma", "Camila", 22, "Principiante", "3 días", "Turno mañana", "Tonificación", "Alta", "Sí", "Detalle de lesión pendiente", "", "", "", "", "", "", ""]
      ];

      for (const row of defaultAlumnos) {
        await db.execute({
          sql: `INSERT INTO alumnos (
            nombre, apellido, edad, nivel, dias_entrenamiento, horario, objetivo, estado, lesionado, detalle_lesion, enfermedades, restricciones_medicas, deportes, dni, celular, direccion, mail
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: row
        });
      }

      // 5. Seed basic custom routine for Sabrina Pages
      console.log('Seeding custom student routine for Sabrina Pages...');
      
      const sabrinaRes = await db.execute("SELECT id FROM alumnos WHERE nombre = 'Sabrina' AND apellido = 'Pages'");
      if (sabrinaRes.rows.length > 0) {
        const sabrinaId = sabrinaRes.rows[0].id;
        const customRoutines = [
          [sabrinaId, "Día 1 - Piernas (Cuádriceps)", "Hack squat", "4x8-10", 1, "Calentar bien"],
          [sabrinaId, "Día 1 - Piernas (Cuádriceps)", "Prensa", "3x10-12", 2, ""],
          [sabrinaId, "Día 2 - Espalda + Bíceps", "Jalón al pecho", "4x8-10", 1, "Controlar bajada"]
        ];

        for (const row of customRoutines) {
          await db.execute({
            sql: `INSERT INTO rutinas_alumnos (
              alumno_id, dia, ejercicio, series_repeticiones, orden, notas
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            args: row
          });
        }
      }
    }

    // 6. Seed Rutinas Predefinidas if empty
    const predefCheck = await db.execute('SELECT COUNT(*) as count FROM rutinas_predefinidas');
    const predefCount = Number(predefCheck.rows[0].count);
    if (predefCount === 0) {
      console.log('Seeding predefined template routines...');
      const templates = [
        // Plan 3 Días - Día 1: Pecho + hombros + tríceps
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Press banca plano", "4x12", 1],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Press inclinado (mancuernas)", "4x12", 2],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Cruces en polea alta", "4x15", 3],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Aperturas con mancuernas", "3x15", 4],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Press Militar con mancuernas", "4x12", 5],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Vuelos laterales en maquina", "4x15", 6],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Fondos en máquina", "4x15", 7],
        ["Plan 3 Días", "Día 1 - Pecho + hombros + tríceps", "Press Francés", "4x12", 8],
        
        // Plan 3 Días - Día 2: Espalda + hombros + bíceps
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Remo con barra", "4x12", 1],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Jalón al pecho", "4x10", 2],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Remo bajo (agarre amplio)", "4x15", 3],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Remo unilateral", "3x10", 4],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Vuelos posteriores", "4x10", 5],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Encogimientos con barra", "4x12", 6],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Curl de Bíceps unilateral", "4x12", 7],
        ["Plan 3 Días", "Día 2 - Espalda + hombros + bíceps", "Curl Martillo", "4x12", 8],
        
        // Plan 3 Días - Día 3: Cuádriceps + femorales
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Sentadilla libre con barra", "4x10", 1],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Peso muerto Rumano con barra", "4x12", 2],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Prensa", "4x15", 3],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Curl femoral", "3x12", 4],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Extensión de cuádriceps", "3x12", 5],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Elevación de talón", "4x15", 6],
        ["Plan 3 Días", "Día 3 - Cuádriceps + femorales", "Abdominales", "3 series", 7],

        // Plan 5 Días (Rutina Pame) - Día 1: Piernas (Cuádriceps)
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Hack squat", "4x8-10", 1],
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Prensa", "3x10-12", 2],
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Extensión de cuádriceps", "3x12-15", 3],
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Hip thrust", "3x10-12", 4],
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Gemelos", "4x15-20", 5],
        ["Plan 5 Días", "Día 1 - Piernas (Cuádriceps)", "Abdominales", "3 series", 6],
        
        // Plan 5 Días (Rutina Pame) - Día 2: Espalda + Bíceps
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Jalón al pecho", "4x8-10", 1],
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Remo bajo", "4x10", 2],
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Remo unilateral", "3x10-12", 3],
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Face pull", "3x15", 4],
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Curl de bíceps con barra", "3x10-12", 5],
        ["Plan 5 Días", "Día 2 - Espalda + Bíceps", "Curl martillo", "3x12", 6],
        
        // Plan 5 Días (Rutina Pame) - Día 3: Hombros + Pecho
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Press militar", "4x8-10", 1],
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Elevaciones laterales", "4x15", 2],
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Deltoides posteriores", "3x15", 3],
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Press pecho maquina", "3x10", 4],
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Aperturas peck deck", "3x12", 5],
        ["Plan 5 Días", "Día 3 - Hombros + Pecho", "Plancha", "3x45-60 seg", 6],
        
        // Plan 5 Días (Rutina Pame) - Día 4: Piernas (Posteriores)
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Peso muerto rumano", "4x8-10", 1],
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Curl femoral", "4x10-12", 2],
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Búlgara", "3x10", 3],
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Abducción de cadera", "3x15-20", 4],
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Gemelos", "4x15-20", 5],
        ["Plan 5 Días", "Día 4 - Piernas (Posteriores)", "Abdominales", "3 series", 6],
        
        // Plan 5 Días (Rutina Pame) - Día 5: Full Body
        ["Plan 5 Días", "Día 5 - Full Body", "Hip thrust", "3x10", 1],
        ["Plan 5 Días", "Día 5 - Full Body", "Pullover", "3x12-15", 2],
        ["Plan 5 Días", "Día 5 - Full Body", "Press pecho", "3x10", 3],
        ["Plan 5 Días", "Día 5 - Full Body", "Remo unilateral", "3x10-12", 4],
        ["Plan 5 Días", "Día 5 - Full Body", "Elevaciones laterales", "3x15", 5]
      ];
      for (const row of templates) {
        await db.execute({
          sql: `INSERT INTO rutinas_predefinidas (plan, dia, ejercicio, series_repeticiones, orden) VALUES (?, ?, ?, ?, ?)`,
          args: row
        });
      }
    }

    console.log('Database initialization & seeding completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}
