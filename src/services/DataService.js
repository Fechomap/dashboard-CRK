// src/services/DataService.js
import Papa from 'papaparse';

class DataService {
  /**
   * Exporta datos a CSV y descarga el archivo
   * @param {Array} data - Datos a exportar
   * @param {string} filename - Nombre del archivo a descargar
   */
  static exportToCSV(data, filename = 'datos_exportados.csv') {
    if (!data || data.length === 0) {
      throw new Error("No hay datos para exportar");
    }
    
    try {
      const formattedData = data.map(item => ({
        numero: item.numero,
        fechaRegistro: item.fechaRegistro instanceof Date 
          ? item.fechaRegistro.toISOString().split('T')[0]
          : item.fechaRegistro,
        fechaAsignacion: item.fechaAsignacion instanceof Date 
          ? item.fechaAsignacion.toISOString().split('T')[0]
          : item.fechaAsignacion,
        operador: item.operador,
        unidadOperativa: item.unidadOperativa,
        cuenta: item.cuenta,
        estatus: item.estatus,
        costoTotal: item.costoTotal
      }));
      
      const csv = Papa.unparse(formattedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar datos:", error);
      throw new Error("Error al exportar los datos: " + error.message);
    }
  }
  
  /**
   * Guarda datos en sessionStorage, dividiéndolos en chunks
   * @param {Array} data - Datos a guardar
   * @param {string} storageKey - Clave base para guardar en sessionStorage
   * @param {number} chunkSize - Tamaño de cada chunk
   */
  static saveToStorage(data, storageKey, chunkSize = 100) {
    try {
      // Preparar datos para almacenamiento
      const dataForStorage = data.map(item => ({
        ...item,
        // Guardar las fechas como strings ISO
        fechaRegistro: item.fechaRegistro instanceof Date ? 
          item.fechaRegistro.toISOString() : null,
        fechaAsignacion: item.fechaAsignacion instanceof Date ? 
          item.fechaAsignacion.toISOString() : null
      }));
      
      // Dividir en chunks
      const chunks = [];
      for (let i = 0; i < dataForStorage.length; i += chunkSize) {
        chunks.push(dataForStorage.slice(i, i + chunkSize));
      }
      
      // Guardar cada chunk
      chunks.forEach((chunk, index) => {
        try {
          sessionStorage.setItem(`${storageKey}_chunk_${index}`, JSON.stringify(chunk));
        } catch (storageError) {
          console.error(`Error al guardar chunk ${index}:`, storageError);
        }
      });
      
      // Guardar metadatos
      sessionStorage.setItem(`${storageKey}_totalChunks`, chunks.length.toString());
      
      return true;
    } catch (e) {
      console.error('Error al guardar datos en sessionStorage:', e);
      return false;
    }
  }
  
  /**
   * Carga datos desde sessionStorage
   * @param {string} storageKey - Clave base para cargar de sessionStorage
   * @returns {Array} Datos cargados
   */
  static loadFromStorage(storageKey) {
    try {
      // Intentar cargar el archivo desde sessionStorage
      const totalChunks = parseInt(sessionStorage.getItem(`${storageKey}_totalChunks`) || '0');
      
      if (totalChunks <= 0) {
        return [];
      }
      
      let allData = [];
      
      for (let i = 0; i < totalChunks; i++) {
        const chunk = sessionStorage.getItem(`${storageKey}_chunk_${i}`);
        if (chunk) {
          const parsedChunk = JSON.parse(chunk);
          allData = [...allData, ...parsedChunk];
        }
      }
      
      // Convertir las fechas de string a Date
      return allData.map(item => {
        // Crear nuevas fechas a partir de los strings ISO
        const fechaReg = item.fechaRegistro ? new Date(item.fechaRegistro) : null;
        const fechaAsig = item.fechaAsignacion ? new Date(item.fechaAsignacion) : null;
        
        // Verificar que las fechas sean válidas
        const validFechaReg = fechaReg && !isNaN(fechaReg.getTime()) ? fechaReg : null;
        const validFechaAsig = fechaAsig && !isNaN(fechaAsig.getTime()) ? fechaAsig : null;
        
        return {
          ...item,
          fechaRegistro: validFechaReg,
          fechaAsignacion: validFechaAsig
        };
      });
      
    } catch (e) {
      console.error('Error al cargar datos desde sessionStorage:', e);
      return [];
    }
  }
  
  /**
   * Elimina datos de sessionStorage
   * @param {string} storageKey - Clave base para eliminar de sessionStorage
   */
  static clearStorage(storageKey) {
    try {
      // Limpiar todos los chunks
      const totalChunks = parseInt(sessionStorage.getItem(`${storageKey}_totalChunks`) || '0');
      for (let i = 0; i < totalChunks; i++) {
        sessionStorage.removeItem(`${storageKey}_chunk_${i}`);
      }
      
      sessionStorage.removeItem(`${storageKey}_totalChunks`);
      return true;
    } catch (e) {
      console.error('Error al limpiar sessionStorage:', e);
      return false;
    }
  }
}

export default DataService;