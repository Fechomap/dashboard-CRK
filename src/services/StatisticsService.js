// src/services/StatisticsService.js - Servicio especializado para cálculos estadísticos
/**
 * Servicio dedicado a cálculos estadísticos y métricas de negocio
 * Centraliza toda la lógica de cálculos financieros y de rendimiento
 */
class StatisticsService {

  /**
   * Calcula métricas financieras básicas de un conjunto de datos
   * @param {Array} data - Datos para calcular métricas
   * @returns {Object} - Métricas financieras calculadas
   */
  static calculateFinancialMetrics(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.calculateFinancialMetrics: data debe ser un array');
      return {
        totalCost: 0,
        averageCost: 0,
        minCost: 0,
        maxCost: 0,
        totalServices: 0
      };
    }

    // Calcular suma total de costos con validaciones mejoradas
    const totalCostSum = data.length > 0 
      ? data.reduce((acc, item) => {
          // Validar que item existe
          if (!item) return acc;
          
          // Asegurar que costoTotal es un número válido
          const costo = this.parseAndValidateCosts(item.costoTotal);
          
          // Validar que costo es un número válido y finito
          return acc + (isFinite(costo) ? costo : 0);
        }, 0)
      : 0;

    // Obtener todos los costos válidos para cálculos min/max
    const validCosts = data
      .map(item => this.parseAndValidateCosts(item?.costoTotal))
      .filter(cost => isFinite(cost) && cost > 0);

    const totalCost = isFinite(totalCostSum) ? Math.round(totalCostSum) : 0;
    const averageCost = (data.length > 0 && isFinite(totalCostSum)) 
      ? Math.round(totalCostSum / data.length) 
      : 0;
    const minCost = validCosts.length > 0 ? Math.min(...validCosts) : 0;
    const maxCost = validCosts.length > 0 ? Math.max(...validCosts) : 0;

    return {
      totalCost,
      averageCost,
      minCost: Math.round(minCost),
      maxCost: Math.round(maxCost),
      totalServices: data.length,
      validCostEntries: validCosts.length
    };
  }

  /**
   * Parsea y valida valores de costo
   * @param {any} costoTotal - Valor de costo a validar
   * @returns {number} - Costo parseado y validado
   */
  static parseAndValidateCosts(costoTotal) {
    let costo = 0;
    
    if (costoTotal !== undefined && costoTotal !== null) {
      // Si es string, intentar convertir a número
      if (typeof costoTotal === 'string') {
        // Remover caracteres no numéricos excepto punto y guión
        const cleaned = costoTotal.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        costo = isNaN(parsed) ? 0 : parsed;
      } else if (typeof costoTotal === 'number') {
        costo = isNaN(costoTotal) ? 0 : costoTotal;
      }
    }
    
    return costo;
  }

  /**
   * Calcula métricas de operadores
   * @param {Array} data - Datos para calcular métricas de operadores
   * @returns {Object} - Métricas de operadores
   */
  static calculateOperatorMetrics(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.calculateOperatorMetrics: data debe ser un array');
      return {
        activeOperators: 0,
        operatorDistribution: {},
        topOperators: [],
        operatorEfficiency: {}
      };
    }

    // Contar operadores activos únicos
    const activeOperators = new Set(
      data
        .filter(item => item && item.operador) // Validar que item y operador existen
        .map(item => item.operador)
        .filter(operador => operador && operador.trim() !== '') // Filtrar valores vacíos
    ).size;

    // Distribución por operador
    const operatorDistribution = {};
    const operatorCosts = {};
    
    data.forEach(item => {
      if (item && item.operador && item.operador.trim() !== '') {
        const operador = item.operador;
        
        // Contar servicios
        operatorDistribution[operador] = (operatorDistribution[operador] || 0) + 1;
        
        // Sumar costos
        const costo = this.parseAndValidateCosts(item.costoTotal);
        operatorCosts[operador] = (operatorCosts[operador] || 0) + costo;
      }
    });

    // Top operadores por cantidad de servicios
    const topOperators = Object.entries(operatorDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([operador, servicios]) => ({
        operador,
        servicios,
        costoTotal: Math.round(operatorCosts[operador] || 0),
        promedioPorServicio: servicios > 0 
          ? Math.round((operatorCosts[operador] || 0) / servicios)
          : 0
      }));

    // Eficiencia por operador (servicios/costo)
    const operatorEfficiency = {};
    Object.keys(operatorDistribution).forEach(operador => {
      const servicios = operatorDistribution[operador];
      const costoTotal = operatorCosts[operador] || 0;
      
      operatorEfficiency[operador] = {
        servicios,
        costoTotal: Math.round(costoTotal),
        eficiencia: costoTotal > 0 ? (servicios / costoTotal * 1000).toFixed(2) : 0 // servicios por cada 1000 unidades de costo
      };
    });

    return {
      activeOperators,
      operatorDistribution,
      topOperators,
      operatorEfficiency
    };
  }

  /**
   * Calcula tasa de conclusión de servicios
   * @param {Array} data - Datos para calcular tasa de conclusión
   * @returns {Object} - Métricas de conclusión
   */
  static calculateCompletionRate(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.calculateCompletionRate: data debe ser un array');
      return {
        totalServices: 0,
        completedServices: 0,
        cancelledServices: 0,
        completionRate: 0,
        cancellationRate: 0
      };
    }

    const totalServices = data.length;
    const completedServices = data.filter(item => 
      item && item.estatus && item.estatus.toLowerCase().includes('conclu')
    ).length;
    
    const cancelledServices = data.filter(item => 
      item && item.estatus && item.estatus.toLowerCase().includes('cancel')
    ).length;

    const completionRate = totalServices > 0 
      ? ((completedServices / totalServices) * 100).toFixed(2)
      : 0;

    const cancellationRate = totalServices > 0 
      ? ((cancelledServices / totalServices) * 100).toFixed(2)
      : 0;

    return {
      totalServices,
      completedServices,
      cancelledServices,
      completionRate: parseFloat(completionRate),
      cancellationRate: parseFloat(cancellationRate)
    };
  }

  /**
   * Genera métricas de rendimiento general
   * @param {Array} data - Datos para generar métricas
   * @returns {Object} - Métricas de rendimiento completas
   */
  static generatePerformanceMetrics(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.generatePerformanceMetrics: data debe ser un array');
      return {};
    }

    const financialMetrics = this.calculateFinancialMetrics(data);
    const operatorMetrics = this.calculateOperatorMetrics(data);
    const completionMetrics = this.calculateCompletionRate(data);

    return {
      financial: financialMetrics,
      operators: operatorMetrics,
      completion: completionMetrics,
      summary: {
        totalRecords: data.length,
        dataQuality: {
          recordsWithCost: financialMetrics.validCostEntries,
          recordsWithOperator: data.filter(item => item?.operador).length,
          recordsWithStatus: data.filter(item => item?.estatus).length,
          recordsWithDate: data.filter(item => item?.fechaRegistro).length
        }
      }
    };
  }

  /**
   * Calcula distribución por estatus
   * @param {Array} data - Datos para calcular distribución
   * @returns {Object} - Distribución por estatus
   */
  static calculateStatusDistribution(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.calculateStatusDistribution: data debe ser un array');
      return {};
    }

    const statusDistribution = {};
    const statusCosts = {};

    data.forEach(item => {
      if (item && item.estatus) {
        const estatus = item.estatus;
        
        // Contar servicios
        statusDistribution[estatus] = (statusDistribution[estatus] || 0) + 1;
        
        // Sumar costos
        const costo = this.parseAndValidateCosts(item.costoTotal);
        statusCosts[estatus] = (statusCosts[estatus] || 0) + costo;
      }
    });

    // Convertir a array ordenado por cantidad
    const statusArray = Object.entries(statusDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([estatus, cantidad]) => ({
        estatus,
        cantidad,
        costoTotal: Math.round(statusCosts[estatus] || 0),
        porcentaje: ((cantidad / data.length) * 100).toFixed(2)
      }));

    return {
      distribution: statusDistribution,
      costs: statusCosts,
      sorted: statusArray
    };
  }

  /**
   * Calcula tendencias temporales básicas
   * @param {Array} data - Datos con fechas para analizar tendencias
   * @returns {Object} - Análisis de tendencias
   */
  static calculateTimeTrends(data) {
    if (!Array.isArray(data)) {
      console.warn('StatisticsService.calculateTimeTrends: data debe ser un array');
      return {};
    }

    const dataWithDates = data.filter(item => item?.fechaRegistro instanceof Date);
    
    if (dataWithDates.length === 0) {
      return {
        totalWithDates: 0,
        dateRange: null,
        monthlyDistribution: {},
        weeklyDistribution: {}
      };
    }

    // Rango de fechas
    const dates = dataWithDates.map(item => item.fechaRegistro);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Distribución mensual
    const monthlyDistribution = {};
    const weeklyDistribution = {};

    dataWithDates.forEach(item => {
      const fecha = item.fechaRegistro;
      
      // Por mes
      const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyDistribution[mesKey] = (monthlyDistribution[mesKey] || 0) + 1;
      
      // Por día de la semana
      const dayOfWeek = fecha.getDay(); // 0 = domingo, 6 = sábado
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = dayNames[dayOfWeek];
      weeklyDistribution[dayName] = (weeklyDistribution[dayName] || 0) + 1;
    });

    return {
      totalWithDates: dataWithDates.length,
      dateRange: {
        min: minDate,
        max: maxDate,
        days: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
      },
      monthlyDistribution,
      weeklyDistribution
    };
  }
}

export default StatisticsService;