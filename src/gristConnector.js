import { MOCK_ALUMNOS, MOCK_EJERCICIOS, MOCK_RUTINAS_PREDEFINIDAS, MOCK_RUTINAS_ALUMNOS } from './mockData';

class GristConnector {
  constructor() {
    this.isGristAvailable = typeof window !== 'undefined' && window.grist !== undefined;
    this.localState = {
      Alumnos: JSON.parse(localStorage.getItem('nexo_gym_alumnos')) || MOCK_ALUMNOS,
      Ejercicios: JSON.parse(localStorage.getItem('nexo_gym_ejercicios')) || MOCK_EJERCICIOS,
      Rutinas_Predefinidas: MOCK_RUTINAS_PREDEFINIDAS,
      Rutinas_Alumnos: JSON.parse(localStorage.getItem('nexo_gym_rutinas_alumnos')) || MOCK_RUTINAS_ALUMNOS
    };
  }

  // Initialize Grist
  ready(options = { requiredAccess: 'read table' }) {
    if (this.isGristAvailable) {
      window.grist.ready(options);
    } else {
      console.log('Grist API not detected, running in Standalone (Mock) mode.');
    }
  }

  // Subscribe to table changes (or trigger callback immediately in mock mode)
  subscribe(tableName, callback) {
    if (this.isGristAvailable) {
      // Map columns
      window.grist.onRecords((records) => {
        // Grist sends records as array of objects
        // If mappings are defined, Grist can map user columns to widget fields
        callback(records);
      });
    } else {
      // Trigger callback with mock data
      callback(this.localState[tableName]);
    }
  }

  // Generic method to fetch all data from a table
  async fetchTable(tableName) {
    if (this.isGristAvailable) {
      try {
        return await window.grist.docApi.fetchTable(tableName);
      } catch (err) {
        console.error(`Error fetching table ${tableName} from Grist:`, err);
        // Fallback to local
        return this.localState[tableName] || [];
      }
    } else {
      return this.localState[tableName] || [];
    }
  }

  // Update records in Grist or local storage
  async updateRecords(tableName, records) {
    if (this.isGristAvailable) {
      try {
        await window.grist.docApi.updateRecords(tableName, records);
        return true;
      } catch (err) {
        console.error(`Error updating table ${tableName} in Grist:`, err);
        return false;
      }
    } else {
      // Standalone simulation
      const currentTable = this.localState[tableName];
      const recordMap = new Map(records.map(r => [r.id || r.ID, r]));
      
      this.localState[tableName] = currentTable.map(row => {
        const id = row.ID || row.id;
        if (recordMap.has(id)) {
          // Merge row and update fields
          const update = recordMap.get(id);
          // Grist records updates typically use fields key or flat keys, handles both
          const fields = update.fields || update;
          return { ...row, ...fields };
        }
        return row;
      });

      localStorage.setItem(`nexo_gym_${tableName.toLowerCase()}`, JSON.stringify(this.localState[tableName]));
      return true;
    }
  }

  // Add records to Grist or local storage
  async addRecords(tableName, records) {
    if (this.isGristAvailable) {
      try {
        await window.grist.docApi.addRecords(tableName, records);
        return true;
      } catch (err) {
        console.error(`Error adding records to table ${tableName} in Grist:`, err);
        return false;
      }
    } else {
      // Standalone simulation
      const currentTable = this.localState[tableName];
      const newRecords = records.map((r, index) => {
        const fields = r.fields || r;
        const newId = fields.ID || fields.id || `${tableName.substring(0,2).toUpperCase()}${Date.now()}_${index}`;
        return { ID: newId, ...fields };
      });

      this.localState[tableName] = [...currentTable, ...newRecords];
      localStorage.setItem(`nexo_gym_${tableName.toLowerCase()}`, JSON.stringify(this.localState[tableName]));
      return true;
    }
  }

  // Delete records in Grist or local storage
  async deleteRecords(tableName, recordIds) {
    if (this.isGristAvailable) {
      try {
        await window.grist.docApi.deleteRecords(tableName, recordIds);
        return true;
      } catch (err) {
        console.error(`Error deleting records from table ${tableName} in Grist:`, err);
        return false;
      }
    } else {
      // Standalone simulation
      const idsSet = new Set(recordIds);
      this.localState[tableName] = this.localState[tableName].filter(row => {
        const id = row.ID || row.id;
        return !idsSet.has(id);
      });
      localStorage.setItem(`nexo_gym_${tableName.toLowerCase()}`, JSON.stringify(this.localState[tableName]));
      return true;
    }
  }

  // Specific helper to fetch all elements needed for Admin dashboard
  async fetchAllAdminData() {
    const alumnos = await this.fetchTable('Alumnos');
    const ejercicios = await this.fetchTable('Ejercicios');
    const rutinasPredefinidas = await this.fetchTable('Rutinas_Predefinidas');
    const rutinasAlumnos = await this.fetchTable('Rutinas_Alumnos');
    
    return {
      alumnos: this._formatRecords(alumnos),
      ejercicios: this._formatRecords(ejercicios),
      rutinasPredefinidas: this._formatRecords(rutinasPredefinidas),
      rutinasAlumnos: this._formatRecords(rutinasAlumnos)
    };
  }

  // Helper to standardise record objects
  _formatRecords(records) {
    if (!records) return [];
    // Grist returns records in different shapes depending on API call (REST vs Widget API)
    // Widget API uses `{ id: X, fields: { Nombre: '...' } }`
    // REST/docApi returns `{ id: X, Nombre: '...' }` or similar
    return records.map(r => {
      if (r.fields) {
        return { ID: r.id, ...r.fields };
      }
      // Ensure it has ID field mapped if it only has id
      const formatted = { ...r };
      if (r.id && !r.ID) formatted.ID = r.id;
      return formatted;
    });
  }
}

export const connector = new GristConnector();
