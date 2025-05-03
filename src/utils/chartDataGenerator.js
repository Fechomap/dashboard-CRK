import _ from 'lodash';

/**
 * Generates chart data from the filtered dataset
 * @param {Array} datos - The filtered data array
 * @returns {Object} Object containing all chart data sets
 */
export const generateChartData = (datos) => {
  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    return {
      serviciosPorMes: [],
      serviciosPorOperador: [],
      serviciosPorUnidad: [],
      serviciosPorEstatus: [],
      serviciosPorCliente: [],
      tiemposDeAtencion: []
    };
  }

  try {
    // 1. Services by month
    const serviciosPorMes = _.chain(datos)
      .groupBy(d => {
        if (!d.fechaRegistro) return 'Sin fecha';
        try {
          const date = new Date(d.fechaRegistro);
          if (isNaN(date.getTime())) return 'Sin fecha';
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } catch (e) {
          return 'Sin fecha';
        }
      })
      .map((value, key) => ({ mes: key, cantidad: value.length }))
      .sortBy(['mes'])
      .value();
    
    // 2. Services by operator
    const serviciosPorOperador = _.chain(datos)
      .groupBy(d => d.operador || 'Sin operador')
      .map((value, key) => ({ operador: key, cantidad: value.length }))
      .sortBy([o => -o.cantidad])
      .slice(0, 10)
      .value();
    
    // 3. Services by operational unit
    const serviciosPorUnidad = _.chain(datos)
      .groupBy(d => d.unidadOperativa || 'Sin unidad')
      .map((value, key) => ({ unidad: key, cantidad: value.length }))
      .sortBy([o => -o.cantidad])
      .value();
    
    // 4. Services by status
    const serviciosPorEstatus = _.chain(datos)
      .groupBy(d => d.estatus || 'Sin estatus')
      .map((value, key) => ({ estatus: key, cantidad: value.length }))
      .sortBy([o => -o.cantidad])
      .value();
    
    // 5. Services by client - NUEVA FUNCIONALIDAD
    const serviciosPorCliente = _.chain(datos)
      .groupBy(d => d.cliente || 'Sin cliente')
      .map((value, key) => ({ cliente: key, cantidad: value.length }))
      .sortBy([o => o.cantidad]) // Ordenados de menor a mayor según lo solicitado
      .value();
    
    // 6. Response times
    const tiempos = [];
    for (const d of datos) {
      try {
        if (!d.fechaRegistro || !d.fechaAsignacion) continue;
        
        const fechaReg = d.fechaRegistro instanceof Date ? d.fechaRegistro : new Date(d.fechaRegistro);
        const fechaAsig = d.fechaAsignacion instanceof Date ? d.fechaAsignacion : new Date(d.fechaAsignacion);
        
        if (isNaN(fechaReg.getTime()) || isNaN(fechaAsig.getTime())) continue;
        
        const diffMinutos = (fechaAsig - fechaReg) / (1000 * 60);
        
        if (isNaN(diffMinutos) || diffMinutos < 0 || diffMinutos > 10000) continue;
        
        tiempos.push({
          numero: d.numero,
          operador: d.operador || 'Sin operador',
          tiempoMinutos: Math.round(diffMinutos),
          unidad: d.unidadOperativa || 'Sin unidad'
        });
      } catch (e) {
        console.warn('Error al procesar tiempo:', e);
      }
    }
    
    // Group by time ranges
    const rangos = [
      { min: 0, max: 15, label: '0-15 min' },
      { min: 15, max: 30, label: '15-30 min' },
      { min: 30, max: 60, label: '30-60 min' },
      { min: 60, max: 120, label: '1-2 horas' },
      { min: 120, max: Infinity, label: '2+ horas' }
    ];
    
    const tiemposPorRango = rangos.map(rango => {
      const count = tiempos.filter(t => 
        t.tiempoMinutos >= rango.min && t.tiempoMinutos < rango.max
      ).length;
      
      return {
        rango: rango.label,
        cantidad: count
      };
    });
    
    return {
      serviciosPorMes,
      serviciosPorOperador,
      serviciosPorUnidad,
      serviciosPorEstatus,
      serviciosPorCliente,
      tiemposDeAtencion: tiemposPorRango
    };
  } catch (error) {
    console.error('Error al generar datos para gráficas:', error);
    return {
      serviciosPorMes: [],
      serviciosPorOperador: [],
      serviciosPorUnidad: [],
      serviciosPorEstatus: [],
      serviciosPorCliente: [],
      tiemposDeAtencion: []
    };
  }
};