// src/services/ChartDataService.js - Servicio especializado para generación de datos de gráficos
/**
 * Servicio dedicado a la generación optimizada de datos para gráficos
 * Incluye sistema de caché avanzado y algoritmos de agrupamiento temporal
 */
class ChartDataService {
  
  // Cache estático para resultados de procesamiento
  static processCache = new Map();
  static readonly MAX_CACHE_SIZE = 15;

  /**
   * Función helper para generar clave de cache única
   * @param {Array} datos - Datos a procesar
   * @param {Object} filters - Filtros aplicados
   * @returns {string} Clave única para el cache
   */
  static generateCacheKey(datos, filters) {
    const dataHash = datos.length + '_' + (datos[0]?.fechaRegistro || '') + '_' + (datos[datos.length - 1]?.fechaRegistro || '');
    const filterHash = JSON.stringify(filters);
    return `${dataHash}_${filterHash}`;
  }

  /**
   * Genera estructura de datos vacía para gráficos
   * @returns {Object} Estructura de datos vacía
   */
  static getEmptyChartData() {
    return {
      serviciosPorPeriodo: [],
      serviciosPorOperador: [],
      serviciosPorEstatus: [],
      serviciosPorUnidad: [],
      serviciosPorCliente: [],
      serviciosPorHora: [],
      tituloGraficaTiempo: "Servicios por Mes"
    };
  }

  /**
   * Determina el tipo de agrupamiento temporal basado en los filtros
   * @param {Object} filters - Filtros aplicados
   * @returns {Object} Configuración de agrupamiento
   */
  static determinarAgrupamiento(filters = {}) {
    let agruparPorDia = false;
    let tituloGraficaTiempo = "Servicios por Mes";
    
    if (filters.fechaInicio && filters.fechaFin) {
      try {
        const fechaInicio = new Date(filters.fechaInicio);
        const fechaFin = new Date(filters.fechaFin);
        const diffTime = Math.abs(fechaFin - fechaInicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Si el rango es menor a 93 días (3 meses), agrupar por día
        if (diffDays <= 93) {
          agruparPorDia = true;
          tituloGraficaTiempo = "Servicios por Día";
        }
      } catch (error) {
        console.warn('Error al determinar agrupamiento:', error);
      }
    }
    
    return { agruparPorDia, tituloGraficaTiempo };
  }

  /**
   * Completa períodos faltantes en un rango de fechas
   * @param {Array} data - Datos existentes
   * @param {Date} fechaInicio - Fecha de inicio del rango
   * @param {Date} fechaFin - Fecha de fin del rango
   * @param {boolean} agruparPorDia - Si agrupar por día o por mes
   * @returns {Array} Datos con períodos faltantes completados
   */
  static completarPeriodosFaltantes(data, fechaInicio, fechaFin, agruparPorDia) {
    if (!fechaInicio || !fechaFin || !Array.isArray(data)) {
      return data;
    }

    const dataMap = new Map(data.map(item => [item.periodo, item.cantidad]));
    const resultado = [];
    const currentDate = new Date(fechaInicio);
    
    while (currentDate <= fechaFin) {
      let periodo;
      
      if (agruparPorDia) {
        periodo = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        periodo = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      resultado.push({
        periodo,
        cantidad: dataMap.get(periodo) || 0
      });
      
      // Incrementar fecha
      if (agruparPorDia) {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return resultado;
  }

  /**
   * Procesa datos de manera optimizada usando Maps para mejor rendimiento
   * @param {Array} datos - Datos a procesar
   * @param {boolean} agruparPorDia - Si agrupar por día
   * @param {string} tituloGraficaTiempo - Título para el gráfico temporal
   * @param {Object} filters - Filtros aplicados
   * @returns {Object} Datos procesados para gráficos
   */
  static procesarDatosOptimizado(datos, agruparPorDia, tituloGraficaTiempo, filters) {
    // Usar Maps para mejor rendimiento O(1) lookup
    const periodoMap = new Map();
    const operadorMap = new Map();
    const estatusMap = new Map();
    const unidadMap = new Map();
    const clienteMap = new Map();
    const horaMap = new Map();
    
    // Procesar todos los datos en un solo pase
    datos.forEach(item => {
      if (!item) return;
      
      // Procesar por período temporal
      if (item.fechaRegistro instanceof Date) {
        let periodo;
        if (agruparPorDia) {
          periodo = item.fechaRegistro.toISOString().split('T')[0]; // YYYY-MM-DD
        } else {
          periodo = `${item.fechaRegistro.getFullYear()}-${(item.fechaRegistro.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        periodoMap.set(periodo, (periodoMap.get(periodo) || 0) + 1);
        
        // Procesar distribución por hora
        const hora = item.fechaRegistro.getHours();
        const horaKey = `${hora.toString().padStart(2, '0')}:00`;
        horaMap.set(horaKey, (horaMap.get(horaKey) || 0) + 1);
      }
      
      // Procesar por operador
      if (item.operador) {
        operadorMap.set(item.operador, (operadorMap.get(item.operador) || 0) + 1);
      }
      
      // Procesar por estatus
      if (item.estatus) {
        estatusMap.set(item.estatus, (estatusMap.get(item.estatus) || 0) + 1);
      }
      
      // Procesar por unidad
      if (item.unidad) {
        unidadMap.set(item.unidad, (unidadMap.get(item.unidad) || 0) + 1);
      }
      
      // Procesar por cliente
      if (item.cliente) {
        clienteMap.set(item.cliente, (clienteMap.get(item.cliente) || 0) + 1);
      }
    });
    
    // Convertir Maps a arrays y ordenar
    let serviciosPorPeriodo = Array.from(periodoMap, ([periodo, cantidad]) => ({ periodo, cantidad }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    // Completar períodos faltantes si hay filtros de fecha
    if (filters.fechaInicio && filters.fechaFin) {
      try {
        const fechaInicio = new Date(filters.fechaInicio);
        const fechaFin = new Date(filters.fechaFin);
        serviciosPorPeriodo = this.completarPeriodosFaltantes(serviciosPorPeriodo, fechaInicio, fechaFin, agruparPorDia);
      } catch (error) {
        console.warn('Error al completar períodos faltantes:', error);
      }
    }
    
    const serviciosPorOperador = Array.from(operadorMap, ([operador, cantidad]) => ({ operador, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 operadores
    
    const serviciosPorEstatus = Array.from(estatusMap, ([estatus, cantidad]) => ({ estatus, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
    
    const serviciosPorUnidad = Array.from(unidadMap, ([unidad, cantidad]) => ({ unidad, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
    
    const serviciosPorCliente = Array.from(clienteMap, ([cliente, cantidad]) => ({ cliente, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 clientes
    
    // Generar distribución completa por hora (0-23)
    const serviciosPorHora = [];
    for (let i = 0; i < 24; i++) {
      const horaKey = `${i.toString().padStart(2, '0')}:00`;
      serviciosPorHora.push({
        hora: horaKey,
        cantidad: horaMap.get(horaKey) || 0
      });
    }
    
    return {
      serviciosPorPeriodo,
      serviciosPorOperador,
      serviciosPorEstatus,
      serviciosPorUnidad,
      serviciosPorCliente,
      serviciosPorHora,
      tituloGraficaTiempo
    };
  }

  /**
   * Función principal para generar datos de gráficas
   * @param {Array} datos - Array de datos filtrados
   * @param {Object} filters - Objeto con los filtros aplicados
   * @returns {Object} Objeto con todos los conjuntos de datos para gráficas
   */
  static generateChartData(datos, filters = {}) {
    // Validación temprana
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      return this.getEmptyChartData();
    }
    
    // Verificar cache
    const cacheKey = this.generateCacheKey(datos, filters);
    if (this.processCache.has(cacheKey)) {
      console.log('Cache hit para gráficos');
      return this.processCache.get(cacheKey);
    }

    try {
      // Determinar agrupamiento de manera optimizada
      const { agruparPorDia, tituloGraficaTiempo } = this.determinarAgrupamiento(filters);
      
      // Procesar datos de manera optimizada usando Maps para mejor rendimiento
      const result = this.procesarDatosOptimizado(datos, agruparPorDia, tituloGraficaTiempo, filters);
      
      // Guardar en cache
      this.processCache.set(cacheKey, result);
      
      // Limpiar cache si es muy grande
      if (this.processCache.size > this.MAX_CACHE_SIZE) {
        const firstKey = this.processCache.keys().next().value;
        this.processCache.delete(firstKey);
      }
      
      console.log(`Datos de gráficos generados: ${datos.length} registros procesados`);
      return result;
    } catch (error) {
      console.error('Error al generar datos para gráficas:', error);
      return this.getEmptyChartData();
    }
  }

  /**
   * Calcula tendencias en los datos temporales
   * @param {Array} serviciosPorPeriodo - Datos de servicios por período
   * @returns {Object} Análisis de tendencias
   */
  static calcularTendencias(serviciosPorPeriodo) {
    if (!Array.isArray(serviciosPorPeriodo) || serviciosPorPeriodo.length < 2) {
      return {
        tendencia: 'insuficientes_datos',
        cambioPromedio: 0,
        crecimiento: 0
      };
    }

    const datos = serviciosPorPeriodo.map(item => item.cantidad);
    const primerosMitad = datos.slice(0, Math.ceil(datos.length / 2));
    const segundaMitad = datos.slice(Math.ceil(datos.length / 2));
    
    const promedioInicial = primerosMitad.reduce((sum, val) => sum + val, 0) / primerosMitad.length;
    const promedioFinal = segundaMitad.reduce((sum, val) => sum + val, 0) / segundaMitad.length;
    
    const cambioPromedio = promedioFinal - promedioInicial;
    const crecimiento = promedioInicial > 0 ? (cambioPromedio / promedioInicial) * 100 : 0;
    
    let tendencia = 'estable';
    if (crecimiento > 10) {
      tendencia = 'crecimiento_fuerte';
    } else if (crecimiento > 5) {
      tendencia = 'crecimiento_moderado';
    } else if (crecimiento < -10) {
      tendencia = 'declive_fuerte';
    } else if (crecimiento < -5) {
      tendencia = 'declive_moderado';
    }

    return {
      tendencia,
      cambioPromedio: Math.round(cambioPromedio),
      crecimiento: Math.round(crecimiento * 100) / 100
    };
  }

  /**
   * Analiza patrones horarios para identificar horas pico
   * @param {Array} serviciosPorHora - Datos de servicios por hora
   * @returns {Object} Análisis de patrones horarios
   */
  static analizarPatronesHorarios(serviciosPorHora) {
    if (!Array.isArray(serviciosPorHora) || serviciosPorHora.length === 0) {
      return {
        horasPico: [],
        horasValle: [],
        promedioHorario: 0
      };
    }

    const datosOrdenados = [...serviciosPorHora].sort((a, b) => b.cantidad - a.cantidad);
    const horasPico = datosOrdenados.slice(0, 3);
    const horasValle = datosOrdenados.slice(-3).reverse();
    
    const totalServicios = serviciosPorHora.reduce((sum, item) => sum + item.cantidad, 0);
    const promedioHorario = Math.round(totalServicios / serviciosPorHora.length);

    return {
      horasPico,
      horasValle,
      promedioHorario,
      totalServicios
    };
  }

  /**
   * Limpia el cache de procesamiento
   */
  static clearCache() {
    this.processCache.clear();
    console.log('Cache de ChartDataService limpiado');
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object} Estadísticas del cache
   */
  static getCacheStats() {
    return {
      size: this.processCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.processCache.keys())
    };
  }
}

export default ChartDataService;