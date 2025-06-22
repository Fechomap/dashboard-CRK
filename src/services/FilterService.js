// src/services/FilterService.js - Servicio especializado para lógica de filtros
/**
 * Servicio dedicado a la aplicación y validación de filtros de datos
 * Centraliza toda la lógica de filtrado para reutilización y testing
 */
class FilterService {

  /**
   * Aplica filtro de fechas a un conjunto de datos
   * @param {Array} data - Datos a filtrar
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Array} - Datos filtrados
   */
  static applyDateFilter(data, fechaInicio, fechaFin) {
    if (!Array.isArray(data)) {
      console.warn('FilterService.applyDateFilter: data debe ser un array');
      return [];
    }

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
  }

  /**
   * Aplica filtros múltiples de tipo array (operador, estatus, cliente)
   * @param {Array} data - Datos a filtrar
   * @param {Object} filters - Objeto con filtros a aplicar
   * @returns {Array} - Datos filtrados
   */
  static applyMultipleFilters(data, filters) {
    if (!Array.isArray(data)) {
      console.warn('FilterService.applyMultipleFilters: data debe ser un array');
      return [];
    }

    if (!filters || typeof filters !== 'object') {
      console.warn('FilterService.applyMultipleFilters: filters debe ser un objeto');
      return data;
    }

    let result = [...data];
    
    // Filtrar por operador con validación
    if (filters.operador && Array.isArray(filters.operador) && filters.operador.length > 0) {
      result = result.filter(item => 
        item && item.operador && filters.operador.includes(item.operador)
      );
    }
    
    // Filtrar por estatus con validación
    if (filters.estatus && Array.isArray(filters.estatus) && filters.estatus.length > 0) {
      result = result.filter(item => 
        item && item.estatus && filters.estatus.includes(item.estatus)
      );
    }
    
    // Filtrar por cliente con validación
    if (filters.cliente && Array.isArray(filters.cliente) && filters.cliente.length > 0) {
      result = result.filter(item => 
        item && item.cliente && filters.cliente.includes(item.cliente)
      );
    }

    // Filtrar por unidad operativa con validación
    if (filters.unidad && Array.isArray(filters.unidad) && filters.unidad.length > 0) {
      result = result.filter(item => 
        item && item.unidad && filters.unidad.includes(item.unidad)
      );
    }
    
    return result;
  }

  /**
   * Aplica todos los filtros de una vez
   * @param {Array} data - Datos a filtrar
   * @param {Object} filters - Objeto completo de filtros
   * @returns {Array} - Datos filtrados
   */
  static applyAllFilters(data, filters) {
    if (!Array.isArray(data)) {
      console.warn('FilterService.applyAllFilters: data debe ser un array');
      return [];
    }

    try {
      // Aplicar filtros múltiples primero
      let result = this.applyMultipleFilters(data, filters);
      
      // Aplicar filtros de fecha
      if (filters.fechaInicio || filters.fechaFin) {
        result = this.applyDateFilter(result, filters.fechaInicio, filters.fechaFin);
      }
      
      return result;
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      return data; // Retornar datos sin filtrar en caso de error
    }
  }

  /**
   * Valida rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Object} - Resultado de validación
   */
  static validateDateRange(fechaInicio, fechaFin) {
    const resultado = {
      valido: true,
      errores: [],
      advertencias: []
    };

    if (!fechaInicio && !fechaFin) {
      return resultado; // No hay fechas que validar
    }

    // Validar formato de fecha inicio
    if (fechaInicio) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
        resultado.valido = false;
        resultado.errores.push('Fecha de inicio debe tener formato YYYY-MM-DD');
      } else {
        const fechaInicioObj = new Date(fechaInicio);
        if (isNaN(fechaInicioObj.getTime())) {
          resultado.valido = false;
          resultado.errores.push('Fecha de inicio no es válida');
        }
      }
    }

    // Validar formato de fecha fin
    if (fechaFin) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
        resultado.valido = false;
        resultado.errores.push('Fecha de fin debe tener formato YYYY-MM-DD');
      } else {
        const fechaFinObj = new Date(fechaFin);
        if (isNaN(fechaFinObj.getTime())) {
          resultado.valido = false;
          resultado.errores.push('Fecha de fin no es válida');
        }
      }
    }

    // Validar que fecha inicio sea anterior a fecha fin
    if (fechaInicio && fechaFin && resultado.valido) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      
      if (fechaInicioObj > fechaFinObj) {
        resultado.valido = false;
        resultado.errores.push('Fecha de inicio debe ser anterior a fecha de fin');
      }

      // Advertencia si el rango es muy amplio (más de 2 años)
      const diffTime = Math.abs(fechaFinObj - fechaInicioObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 730) { // 2 años aproximadamente
        resultado.advertencias.push(`Rango de fechas muy amplio: ${diffDays} días`);
      }
    }

    return resultado;
  }

  /**
   * Genera distribución mensual a partir de un conjunto de datos
   * @param {Array} data - Datos para generar distribución
   * @returns {Object} - Distribución mensual
   */
  static getMonthlyDistribution(data) {
    if (!Array.isArray(data)) {
      console.warn('FilterService.getMonthlyDistribution: data debe ser un array');
      return {};
    }

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
  }

  /**
   * Calcula el impacto de aplicar filtros
   * @param {Array} originalData - Datos originales
   * @param {Array} filteredData - Datos filtrados
   * @returns {Object} - Estadísticas del impacto del filtro
   */
  static calculateFilterImpact(originalData, filteredData) {
    if (!Array.isArray(originalData) || !Array.isArray(filteredData)) {
      return {
        registrosOriginales: 0,
        registrosFiltrados: 0,
        porcentajeReduccion: 0,
        registrosEliminados: 0
      };
    }

    const registrosOriginales = originalData.length;
    const registrosFiltrados = filteredData.length;
    const registrosEliminados = registrosOriginales - registrosFiltrados;
    const porcentajeReduccion = registrosOriginales > 0 
      ? ((registrosEliminados / registrosOriginales) * 100).toFixed(2)
      : 0;

    return {
      registrosOriginales,
      registrosFiltrados,
      registrosEliminados,
      porcentajeReduccion: parseFloat(porcentajeReduccion)
    };
  }

  /**
   * Valida la estructura de un objeto de filtros
   * @param {Object} filters - Objeto de filtros a validar
   * @returns {Object} - Resultado de validación
   */
  static validateFilters(filters) {
    const resultado = {
      valido: true,
      errores: [],
      advertencias: []
    };

    if (!filters || typeof filters !== 'object') {
      resultado.valido = false;
      resultado.errores.push('Filters debe ser un objeto');
      return resultado;
    }

    // Validar arrays de filtros
    const arrayFilters = ['operador', 'estatus', 'cliente', 'unidad'];
    arrayFilters.forEach(filterName => {
      if (filters[filterName] !== undefined) {
        if (!Array.isArray(filters[filterName])) {
          resultado.valido = false;
          resultado.errores.push(`${filterName} debe ser un array`);
        }
      }
    });

    // Validar fechas
    const validacionFechas = this.validateDateRange(filters.fechaInicio, filters.fechaFin);
    if (!validacionFechas.valido) {
      resultado.valido = false;
      resultado.errores.push(...validacionFechas.errores);
    }
    resultado.advertencias.push(...validacionFechas.advertencias);

    return resultado;
  }

  /**
   * Genera filtros vacíos por defecto
   * @returns {Object} - Objeto de filtros inicializado
   */
  static getDefaultFilters() {
    return {
      operador: [],
      estatus: [],
      cliente: [],
      unidad: [],
      fechaInicio: '',
      fechaFin: ''
    };
  }
}

export default FilterService;