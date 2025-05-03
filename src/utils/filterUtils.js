// src/utils/filterUtils.js

/**
 * Aplica filtro de fechas a un conjunto de datos
 * @param {Array} data - Datos a filtrar
 * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
 * @returns {Array} - Datos filtrados
 */
export const applyDateFilter = (data, fechaInicio, fechaFin) => {
    let result = [...data];
    
    if (fechaInicio) {
      try {
        // Parsear la fecha de inicio y establecer a medianoche
        const fechaInicioObj = new Date(fechaInicio);
        fechaInicioObj.setHours(0, 0, 0, 0);
        
        result = result.filter(item => {
          // Verificar que la fecha existe
          if (!item.fechaRegistro) {
            return false;
          }
          
          // Crear una nueva fecha a partir del valor
          let fechaItem;
          if (item.fechaRegistro instanceof Date) {
            fechaItem = new Date(item.fechaRegistro.getTime()); // clonar para no modificar original
          } else {
            // Intentar convertir string a Date
            fechaItem = new Date(item.fechaRegistro);
            if (isNaN(fechaItem.getTime())) {
              return false;
            }
          }
          
          // Comparar solo la fecha (ignorar la hora)
          fechaItem.setHours(0, 0, 0, 0);
          
          return fechaItem >= fechaInicioObj;
        });
      } catch (e) {
        console.error('Error al filtrar por fecha inicio:', e);
      }
    }
    
    if (fechaFin) {
      try {
        // Parsear la fecha fin y establecer al final del día
        const fechaFinObj = new Date(fechaFin);
        fechaFinObj.setHours(23, 59, 59, 999);
        
        result = result.filter(item => {
          // Si no hay fecha, ya fue filtrado en el paso anterior
          if (!item.fechaRegistro) return false;
          
          // Crear una nueva fecha a partir del valor
          let fechaItem;
          if (item.fechaRegistro instanceof Date) {
            fechaItem = new Date(item.fechaRegistro.getTime()); // clonar
          } else {
            fechaItem = new Date(item.fechaRegistro);
            if (isNaN(fechaItem.getTime())) return false;
          }
          
          return fechaItem <= fechaFinObj;
        });
      } catch (e) {
        console.error('Error al filtrar por fecha fin:', e);
      }
    }
    
    return result;
  };
  
  /**
   * Genera distribucion mensual a partir de un conjunto de datos
   * @param {Array} data - Datos para generar distribución
   * @returns {Object} - Distribución mensual
   */
  export const getMonthlyDistribution = (data) => {
    try {
      // Agrupar por mes para ver distribución
      const distribucionMensual = {};
      
      data.forEach(item => {
        if (item.fechaRegistro instanceof Date) {
          const fecha = item.fechaRegistro;
          const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!distribucionMensual[mesKey]) {
            distribucionMensual[mesKey] = 0;
          }
          distribucionMensual[mesKey]++;
        }
      });
      
      return distribucionMensual;
    } catch (e) {
      console.error('Error al calcular distribución mensual:', e);
      return {};
    }
  };