export const MOCK_ALUMNOS = [
  {
    ID: "AL001",
    Nombre: "Pamela",
    Apellido: "Gómez",
    Edad: 28,
    Nivel: "Intermedio",
    DiasEntrenamiento: "5 días",
    Horario: "Turno mañana",
    Objetivo: "Tonificación",
    Estado: "Alta",
    Lesionado: "No",
    DetalleLesion: "",
    Enfermedades: "",
    RestriccionesMedicas: "",
    Deportes: "Pilates"
  },
  {
    ID: "AL002",
    Nombre: "Juan",
    Apellido: "Sánchez",
    Edad: 35,
    Nivel: "Principiante",
    DiasEntrenamiento: "3 días",
    Horario: "Turno tarde",
    Objetivo: "Aumentar fuerza",
    Estado: "Alta",
    Lesionado: "Sí",
    DetalleLesion: "Molestia en hombro derecho",
    Enfermedades: "Ninguna",
    RestriccionesMedicas: "No hacer press militar con cargas elevadas",
    Deportes: "Fútbol"
  },
  {
    ID: "AL003",
    Nombre: "María",
    Apellido: "López",
    Edad: 42,
    Nivel: "Avanzado",
    DiasEntrenamiento: "3 días",
    Horario: "Turno mañana",
    Objetivo: "Perder peso",
    Estado: "Baja",
    Lesionado: "No",
    DetalleLesion: "",
    Enfermedades: "",
    RestriccionesMedicas: "",
    Deportes: ""
  },
  {
    ID: "AL004",
    Nombre: "Carlos",
    Apellido: "Pérez",
    Edad: 21,
    Nivel: "Principiante",
    DiasEntrenamiento: "4 días",
    Horario: "Turno tarde",
    Objetivo: "Hipertrofia",
    Estado: "Alta",
    Lesionado: "No",
    DetalleLesion: "",
    Enfermedades: "",
    RestriccionesMedicas: "",
    Deportes: "Rugby"
  }
];

export const MOCK_EJERCICIOS = [
  // Pecho
  { ID: "EJ01", Nombre: "Press banca plano", GrupoMuscular: "Pecho" },
  { ID: "EJ02", Nombre: "Press inclinado (mancuernas)", GrupoMuscular: "Pecho" },
  { ID: "EJ03", Nombre: "Cruces en polea alta", GrupoMuscular: "Pecho" },
  { ID: "EJ04", Nombre: "Aperturas con mancuernas", GrupoMuscular: "Pecho" },
  { ID: "EJ05", Nombre: "Press pecho maquina", GrupoMuscular: "Pecho" },
  { ID: "EJ06", Nombre: "Aperturas peck deck", GrupoMuscular: "Pecho" },
  { ID: "EJ07", Nombre: "Pullover", GrupoMuscular: "Pecho" },
  // Hombros
  { ID: "EJ08", Nombre: "Press Militar con mancuernas", GrupoMuscular: "Hombros" },
  { ID: "EJ09", Nombre: "Vuelos laterales en maquina", GrupoMuscular: "Hombros" },
  { ID: "EJ10", Nombre: "Vuelos posteriores", GrupoMuscular: "Hombros" },
  { ID: "EJ11", Nombre: "Press militar", GrupoMuscular: "Hombros" },
  { ID: "EJ12", Nombre: "Elevaciones laterales", GrupoMuscular: "Hombros" },
  { ID: "EJ13", Nombre: "Deltoides posteriores", GrupoMuscular: "Hombros" },
  { ID: "EJ14", Nombre: "Face pull", GrupoMuscular: "Hombros" },
  // Triceps
  { ID: "EJ15", Nombre: "Fondos en máquina", GrupoMuscular: "Tríceps" },
  { ID: "EJ16", Nombre: "Press Francés", GrupoMuscular: "Tríceps" },
  // Espalda
  { ID: "EJ17", Nombre: "Remo con barra", GrupoMuscular: "Espalda" },
  { ID: "EJ18", Nombre: "Jalón al pecho", GrupoMuscular: "Espalda" },
  { ID: "EJ19", Nombre: "Remo bajo (agarre amplio)", GrupoMuscular: "Espalda" },
  { ID: "EJ20", Nombre: "Remo bajo", GrupoMuscular: "Espalda" },
  { ID: "EJ21", Nombre: "Remo unilateral", GrupoMuscular: "Espalda" },
  { ID: "EJ22", Nombre: "Encogimientos con barra", GrupoMuscular: "Espalda" },
  // Biceps
  { ID: "EJ23", Nombre: "Curl de Bíceps unilateral", GrupoMuscular: "Bíceps" },
  { ID: "EJ24", Nombre: "Curl Martillo", GrupoMuscular: "Bíceps" },
  { ID: "EJ25", Nombre: "Curl de bíceps con barra", GrupoMuscular: "Bíceps" },
  { ID: "EJ26", Nombre: "Curl martillo", GrupoMuscular: "Bíceps" },
  // Piernas Cuadriceps
  { ID: "EJ27", Nombre: "Sentadilla libre con barra", GrupoMuscular: "Piernas (Cuádriceps)" },
  { ID: "EJ28", Nombre: "Prensa", GrupoMuscular: "Piernas (Cuádriceps)" },
  { ID: "EJ29", Nombre: "Extensión de cuádriceps", GrupoMuscular: "Piernas (Cuádriceps)" },
  { ID: "EJ30", Nombre: "Hack squat", GrupoMuscular: "Piernas (Cuádriceps)" },
  { ID: "EJ31", Nombre: "Búlgara", GrupoMuscular: "Piernas (Cuádriceps)" },
  // Piernas Posteriores
  { ID: "EJ32", Nombre: "Peso muerto Rumano con barra", GrupoMuscular: "Piernas (Posteriores)" },
  { ID: "EJ33", Nombre: "Peso muerto rumano", GrupoMuscular: "Piernas (Posteriores)" },
  { ID: "EJ34", Nombre: "Curl femoral", GrupoMuscular: "Piernas (Posteriores)" },
  { ID: "EJ35", Nombre: "Hip thrust", GrupoMuscular: "Piernas (Glúteos)" },
  { ID: "EJ36", Nombre: "Abducción de cadera", GrupoMuscular: "Piernas (Glúteos)" },
  // Gemelos
  { ID: "EJ37", Nombre: "Elevación de talón", GrupoMuscular: "Gemelos" },
  { ID: "EJ38", Nombre: "Gemelos", GrupoMuscular: "Gemelos" },
  // Core
  { ID: "EJ39", Nombre: "Abdominales", GrupoMuscular: "Core" },
  { ID: "EJ40", Nombre: "Plancha", GrupoMuscular: "Core" }
];

export const MOCK_RUTINAS_PREDEFINIDAS = [
  // Plan 3 Días
  { ID: "P3D01", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press banca plano", Series_Repeticiones: "4x12", Orden: 1 },
  { ID: "P3D02", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press inclinado (mancuernas)", Series_Repeticiones: "4x12", Orden: 2 },
  { ID: "P3D03", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Cruces en polea alta", Series_Repeticiones: "4x15", Orden: 3 },
  { ID: "P3D04", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Aperturas con mancuernas", Series_Repeticiones: "3x15", Orden: 4 },
  { ID: "P3D05", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press Militar con mancuernas", Series_Repeticiones: "4x12", Orden: 5 },
  { ID: "P3D06", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Vuelos laterales en maquina", Series_Repeticiones: "4x15", Orden: 6 },
  { ID: "P3D07", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Fondos en máquina", Series_Repeticiones: "4x15", Orden: 7 },
  { ID: "P3D08", Plan: "Plan 3 Días", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press Francés", Series_Repeticiones: "4x12", Orden: 8 },

  { ID: "P3D09", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo con barra", Series_Repeticiones: "4x12", Orden: 1 },
  { ID: "P3D10", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Jalón al pecho", Series_Repeticiones: "4x10", Orden: 2 },
  { ID: "P3D11", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo bajo (agarre amplio)", Series_Repeticiones: "4x15", Orden: 3 },
  { ID: "P3D12", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo unilateral", Series_Repeticiones: "3x10", Orden: 4 },
  { ID: "P3D13", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Vuelos posteriores", Series_Repeticiones: "4x10", Orden: 5 },
  { ID: "P3D14", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Encogimientos con barra", Series_Repeticiones: "4x12", Orden: 6 },
  { ID: "P3D15", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Curl de Bíceps unilateral", Series_Repeticiones: "4x12", Orden: 7 },
  { ID: "P3D16", Plan: "Plan 3 Días", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Curl Martillo", Series_Repeticiones: "4x12", Orden: 8 },

  { ID: "P3D17", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Sentadilla libre con barra", Series_Repeticiones: "4x10", Orden: 1 },
  { ID: "P3D18", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Peso muerto Rumano con barra", Series_Repeticiones: "4x12", Orden: 2 },
  { ID: "P3D19", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Prensa", Series_Repeticiones: "4x15", Orden: 3 },
  { ID: "P3D20", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Curl femoral", Series_Repeticiones: "3x12", Orden: 4 },
  { ID: "P3D21", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Extensión de cuádriceps", Series_Repeticiones: "3x12", Orden: 5 },
  { ID: "P3D22", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Elevación de talón", Series_Repeticiones: "4x15", Orden: 6 },
  { ID: "P3D23", Plan: "Plan 3 Días", Dia: "Día 3 - Cuádriceps + femorales", Ejercicio: "Abdominales", Series_Repeticiones: "3 series", Orden: 7 },

  // Plan 5 Días
  { ID: "P5D01", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Hack squat", Series_Repeticiones: "4x8-10", Orden: 1 },
  { ID: "P5D02", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Prensa", Series_Repeticiones: "3x10-12", Orden: 2 },
  { ID: "P5D03", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Extensión de cuádriceps", Series_Repeticiones: "3x12-15", Orden: 3 },
  { ID: "P5D04", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Hip thrust", Series_Repeticiones: "3x10-12", Orden: 4 },
  { ID: "P5D05", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Gemelos", Series_Repeticiones: "4x15-20", Orden: 5 },
  { ID: "P5D06", Plan: "Plan 5 Días", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Abdominales", Series_Repeticiones: "3 series", Orden: 6 },

  { ID: "P5D07", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Jalón al pecho", Series_Repeticiones: "4x8-10", Orden: 1 },
  { ID: "P5D08", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Remo bajo", Series_Repeticiones: "4x10", Orden: 2 },
  { ID: "P5D09", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Remo unilateral", Series_Repeticiones: "3x10-12", Orden: 3 },
  { ID: "P5D10", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Face pull", Series_Repeticiones: "3x15", Orden: 4 },
  { ID: "P5D11", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Curl de bíceps con barra", Series_Repeticiones: "3x10-12", Orden: 5 },
  { ID: "P5D12", Plan: "Plan 5 Días", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Curl martillo", Series_Repeticiones: "3x12", Orden: 6 },

  { ID: "P5D13", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Press militar", Series_Repeticiones: "4x8-10", Orden: 1 },
  { ID: "P5D14", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Elevaciones laterales", Series_Repeticiones: "4x15", Orden: 2 },
  { ID: "P5D15", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Deltoides posteriores", Series_Repeticiones: "3x15", Orden: 3 },
  { ID: "P5D16", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Press pecho maquina", Series_Repeticiones: "3x10", Orden: 4 },
  { ID: "P5D17", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Aperturas peck deck", Series_Repeticiones: "3x12", Orden: 5 },
  { ID: "P5D18", Plan: "Plan 5 Días", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Plancha", Series_Repeticiones: "3x45-60 seg", Orden: 6 },

  { ID: "P5D19", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Peso muerto rumano", Series_Repeticiones: "4x8-10", Orden: 1 },
  { ID: "P5D20", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Curl femoral", Series_Repeticiones: "4x10-12", Orden: 2 },
  { ID: "P5D21", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Búlgara", Series_Repeticiones: "3x10", Orden: 3 },
  { ID: "P5D22", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Abducción de cadera", Series_Repeticiones: "3x15-20", Orden: 4 },
  { ID: "P5D23", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Gemelos", Series_Repeticiones: "4x15-20", Orden: 5 },
  { ID: "P5D24", Plan: "Plan 5 Días", Dia: "Día 4 - Piernas (Posteriores)", Ejercicio: "Abdominales", Series_Repeticiones: "3 series", Orden: 6 },

  { ID: "P5D25", Plan: "Plan 5 Días", Dia: "Día 5 - Full Body", Ejercicio: "Hip thrust", Series_Repeticiones: "3x10", Orden: 1 },
  { ID: "P5D26", Plan: "Plan 5 Días", Dia: "Día 5 - Full Body", Ejercicio: "Pullover", Series_Repeticiones: "3x12-15", Orden: 2 },
  { ID: "P5D27", Plan: "Plan 5 Días", Dia: "Día 5 - Full Body", Ejercicio: "Press pecho", Series_Repeticiones: "3x10", Orden: 3 },
  { ID: "P5D28", Plan: "Plan 5 Días", Dia: "Día 5 - Full Body", Ejercicio: "Remo unilateral", Series_Repeticiones: "3x10-12", Orden: 4 },
  { ID: "P5D29", Plan: "Plan 5 Días", Dia: "Día 5 - Full Body", Ejercicio: "Elevaciones laterales", Series_Repeticiones: "3x15", Orden: 5 }
];

export const MOCK_RUTINAS_ALUMNOS = [
  // Pamela Gomez (AL001) - 5 days
  { ID: "RA01", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Hack squat", Series_Repeticiones: "4x8-10", Orden: 1, Notas: "" },
  { ID: "RA02", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Prensa", Series_Repeticiones: "3x10-12", Orden: 2, Notas: "" },
  { ID: "RA03", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Extensión de cuádriceps", Series_Repeticiones: "3x12-15", Orden: 3, Notas: "" },
  { ID: "RA04", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Hip thrust", Series_Repeticiones: "3x10-12", Orden: 4, Notas: "" },
  { ID: "RA05", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Gemelos", Series_Repeticiones: "4x15-20", Orden: 5, Notas: "" },
  { ID: "RA06", AlumnoID: "AL001", Dia: "Día 1 - Piernas (Cuádriceps)", Ejercicio: "Abdominales", Series_Repeticiones: "3 series", Orden: 6, Notas: "" },

  { ID: "RA07", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Jalón al pecho", Series_Repeticiones: "4x8-10", Orden: 1, Notas: "" },
  { ID: "RA08", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Remo bajo", Series_Repeticiones: "4x10", Orden: 2, Notas: "" },
  { ID: "RA09", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Remo unilateral", Series_Repeticiones: "3x10-12", Orden: 3, Notas: "" },
  { ID: "RA10", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Face pull", Series_Repeticiones: "3x15", Orden: 4, Notas: "" },
  { ID: "RA11", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Curl de bíceps con barra", Series_Repeticiones: "3x10-12", Orden: 5, Notas: "" },
  { ID: "RA12", AlumnoID: "AL001", Dia: "Día 2 - Espalda + Bíceps", Ejercicio: "Curl martillo", Series_Repeticiones: "3x12", Orden: 6, Notas: "" },

  { ID: "RA13", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Press militar", Series_Repeticiones: "4x8-10", Orden: 1, Notas: "Cuidar técnica" },
  { ID: "RA14", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Elevaciones laterales", Series_Repeticiones: "4x15", Orden: 2, Notas: "" },
  { ID: "RA15", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Deltoides posteriores", Series_Repeticiones: "3x15", Orden: 3, Notas: "" },
  { ID: "RA16", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Press pecho maquina", Series_Repeticiones: "3x10", Orden: 4, Notas: "" },
  { ID: "RA17", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Aperturas peck deck", Series_Repeticiones: "3x12", Orden: 5, Notas: "" },
  { ID: "RA18", AlumnoID: "AL001", Dia: "Día 3 - Hombros + Pecho", Ejercicio: "Plancha", Series_Repeticiones: "3x45-60 seg", Orden: 6, Notas: "" },

  // Juan Sanchez (AL002) - 3 days
  { ID: "RA19", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press banca plano", Series_Repeticiones: "4x12", Orden: 1, Notas: "Calentar bien" },
  { ID: "RA20", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press inclinado (mancuernas)", Series_Repeticiones: "4x10", Orden: 2, Notas: "Cargas ligeras" },
  { ID: "RA21", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Cruces en polea alta", Series_Repeticiones: "4x15", Orden: 3, Notas: "" },
  { ID: "RA22", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Aperturas con mancuernas", Series_Repeticiones: "3x12", Orden: 4, Notas: "Controlar el estiramiento" },
  { ID: "RA23", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press Militar con mancuernas", Series_Repeticiones: "3x10", Orden: 5, Notas: "OPCIONAL: Solo si no hay molestia, usar peso bajo" },
  { ID: "RA24", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Vuelos laterales en maquina", Series_Repeticiones: "4x12", Orden: 6, Notas: "Movimiento controlado" },
  { ID: "RA25", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Fondos en máquina", Series_Repeticiones: "4x12", Orden: 7, Notas: "" },
  { ID: "RA26", AlumnoID: "AL002", Dia: "Día 1 - Pecho + hombros + tríceps", Ejercicio: "Press Francés", Series_Repeticiones: "4x12", Orden: 8, Notas: "" },

  { ID: "RA27", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo con barra", Series_Repeticiones: "4x12", Orden: 1, Notas: "" },
  { ID: "RA28", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Jalón al pecho", Series_Repeticiones: "4x10", Orden: 2, Notas: "" },
  { ID: "RA29", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo bajo (agarre amplio)", Series_Repeticiones: "4x15", Orden: 3, Notas: "" },
  { ID: "RA30", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Remo unilateral", Series_Repeticiones: "3x10", Orden: 4, Notas: "" },
  { ID: "RA31", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Vuelos posteriores", Series_Repeticiones: "4x10", Orden: 5, Notas: "" },
  { ID: "RA32", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Encogimientos con barra", Series_Repeticiones: "4x12", Orden: 6, Notas: "" },
  { ID: "RA33", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Curl de Bíceps unilateral", Series_Repeticiones: "4x12", Orden: 7, Notas: "" },
  { ID: "RA34", AlumnoID: "AL002", Dia: "Día 2 - Espalda + hombros + bíceps", Ejercicio: "Curl Martillo", Series_Repeticiones: "4x12", Orden: 8, Notas: "" }
];
