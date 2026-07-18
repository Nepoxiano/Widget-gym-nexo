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
      window.grist.onRecords((records) => {
        callback(this._formatRecords(records));
      });
    } else {
      callback(this.localState[tableName]);
    }
  }

  // Generic method to fetch all data from a table
  async fetchTable(tableName) {
    if (this.isGristAvailable) {
      try {
        const records = await window.grist.docApi.fetchTable(tableName);
        return this._formatRecords(records);
      } catch (err) {
        console.error(`Error fetching table ${tableName} from Grist:`, err);
        return this.localState[tableName] || [];
      }
    } else {
      return this.localState[tableName] || [];
    }
  }

  // Prepare fields for Grist (maps 'ID' to Grist's column 'ID2', strips Grist row 'id')
  _prepareFields(fields) {
    const prepared = { ...fields };
    // Remove both lowercase 'id' and uppercase 'ID2' to prevent conflicts
    delete prepared.id;
    delete prepared.ID2;
    
    // Map custom 'ID' to Grist's 'ID2'
    if ('ID' in prepared) {
      prepared.ID2 = prepared.ID;
      delete prepared.ID;
    }
    return prepared;
  }

  // Helper to standardise record objects
  _formatRecords(records) {
    if (!records) return [];
    
    // Check if records is a Grist-specific envelope `{ id, fields: { ... } }` or flat `{ id, ID2, ... }`
    // Widget API uses `{ id: X, fields: { ... } }`
    // docApi.fetchTable/REST returns `{ id: X, ID2: '...', Nombre: '...' }` or `{ id: X, fields: { ... } }`
    return records.map(r => {
      const fields = r.fields || r;
      const formatted = { id: r.id, ...fields };
      
      // Grist renames 'ID' column to 'ID2' in Python/formula schema to avoid conflict with row 'id'.
      // We map Grist's 'ID2' back to 'ID' for internal React logic.
      if ('ID2' in formatted) {
        formatted.ID = formatted.ID2;
      }
      return formatted;
    });
  }

  // Update records in Grist or local storage
  async updateRecords(tableName, records) {
    if (this.isGristAvailable) {
      try {
        // Grist updateRecords expects array of: { id: rowId, fields: { ... } }
        const gristRecords = records.map(r => {
          const fields = r.fields || r;
          const rowId = r.id || fields.id;
          if (!rowId) {
            console.error("Missing row 'id' for record update:", r);
          }
          return {
            id: rowId,
            fields: this._prepareFields(fields)
          };
        });
        
        await window.grist.docApi.updateRecords(tableName, gristRecords);
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
        const id = row.id || row.ID;
        if (recordMap.has(id)) {
          const update = recordMap.get(id);
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
        // Grist addRecords expects array of: { fields: { ... } }
        const gristRecords = records.map(r => ({
          fields: this._prepareFields(r.fields || r)
        }));
        
        await window.grist.docApi.addRecords(tableName, gristRecords);
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
        return { id: newId, ID: newId, ...fields };
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
        // Grist deleteRecords expects array of Grist row IDs: [rowId1, rowId2]
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
        const id = row.id || row.ID;
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
      alumnos,
      ejercicios,
      rutinasPredefinidas,
      rutinasAlumnos
    };
  }
}

export const connector = new GristConnector();
