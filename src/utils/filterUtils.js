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
      // CORRECCIÓN CRÍTICA: Asegurarse de usar solo la parte de la fecha (sin zona horaria)
      // Extraer componentes de fecha del string YYYY-MM-DD
      const [year, month, day] = fechaInicio.split('-').map(Number);
      
      // CORRECCIÓN: Crear fecha a medianoche EXACTA en hora local
      const fechaInicioObj = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      // Log para depuración
      console.log(`FILTRO - Fecha inicio exacta: ${fechaInicioObj.toLocaleString('es-MX')}`);
      
      result = result.filter(item => {
        // Verificar que la fecha existe
        if (!item.fechaRegistro) {
          return false;
        }
        
        // CORRECCIÓN: Extraer solo la parte de fecha (ignorar hora/zona horaria)
        const fechaItem = item.fechaRegistro;
        const yearItem = fechaItem.getFullYear();
        const monthItem = fechaItem.getMonth();
        const dayItem = fechaItem.getDate();
        
        // CORRECCIÓN: Comparar usando año-mes-día en vez de objetos Date completos
        // Crear valores numéricos para comparación sin ambigüedades
        const valorInicio = year * 10000 + (month - 1) * 100 + day;
        const valorItem = yearItem * 10000 + monthItem * 100 + dayItem;
        
        const incluir = valorItem >= valorInicio;
        if (!incluir && item.fechaRegistro) {
          console.log(`EXCLUIDO: Fecha ${item.fechaRegistro.toLocaleDateString('es-MX')} anterior a ${fechaInicioObj.toLocaleDateString('es-MX')}`);
        }
        
        return incluir;
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