import _ from 'lodash';

/**
 * Genera datos para gráficas a partir del dataset filtrado
 * @param {Array} datos - Array de datos filtrados
 * @param {Object} filters - Objeto con los filtros aplicados, incluyendo fechaInicio y fechaFin
 * @returns {Object} Objeto con todos los conjuntos de datos para gráficas
 */
export const generateChartData = (datos, filters = {}) => {
  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    return {
      serviciosPorPeriodo: [],
      serviciosPorOperador: [],
      serviciosPorUnidad: [],
      serviciosPorEstatus: [],
      serviciosPorCliente: [],
      serviciosPorHora: []
    };
  }

  try {
    // Determinar si debemos agrupar por día o por mes basado en el rango de fechas
    let agruparPorDia = false;
    let tituloGraficaTiempo = "Servicios por Mes";
    
    if (filters.fechaInicio && filters.fechaFin) {
      const fechaInicio = new Date(filters.fechaInicio);
      const fechaFin = new Date(filters.fechaFin);
      
      // Calcular la diferencia en días
      const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();
      const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
      
      // Si la diferencia es 31 días o menos, agrupar por día
      if (diferenciaDias <= 31 && diferenciaDias >= 0) {
        agruparPorDia = true;
        tituloGraficaTiempo = "Servicios por Día";
      }
    }
    
    // 1. Servicios por período (día o mes)
    const serviciosPorPeriodo = _.chain(datos)
      .groupBy(d => {
        if (!d.fechaRegistro) return 'Sin fecha';
        try {
          const date = new Date(d.fechaRegistro);
          if (isNaN(date.getTime())) return 'Sin fecha';
          
          if (agruparPorDia) {
            // Formato para agrupar por día: YYYY-MM-DD
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          } else {
            // Formato para agrupar por mes: YYYY-MM
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          }
        } catch (e) {
          return 'Sin fecha';
        }
      })
      .map((value, key) => ({ 
        periodo: key, 
        cantidad: value.length,
        // Añadir una propiedad que indique si es día o mes para la visualización
        tipo: agruparPorDia ? 'dia' : 'mes' 
      }))
      .sortBy(['periodo'])
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
    
    // 5. Services by client
    const serviciosPorCliente = _.chain(datos)
      .groupBy(d => d.cliente || 'Sin cliente')
      .map((value, key) => ({ cliente: key, cantidad: value.length }))
      .sortBy([o => o.cantidad])
      .value();
    
    // 6. Services by hour of day (TC)
    const datosConTC = datos.filter(d => d.tc !== undefined || d.TC !== undefined);
    const frecuenciaHoras = new Map();
    
    // Inicializar con todas las horas del día (0-23) con valor 0
    for (let i = 0; i < 24; i++) {
      const horaFormateada = `${i.toString().padStart(2, '0')}:00`;
      frecuenciaHoras.set(horaFormateada, 0);
    }
    
    // Procesar datos de TC y contar frecuencias
    datosConTC.forEach(d => {
      try {
        const tcValor = d.tc !== undefined ? d.tc : d.TC;
        
        if (tcValor === undefined || tcValor === null) {
          return;
        }
        
        let hora = null;
        
        // CASO 1: Si TC es una fecha ya parseada
        if (tcValor instanceof Date) {
          hora = tcValor.getHours();
        }
        // CASO 2: Si TC es un string con formato fecha y hora (DD/MM/YYYY HH:MM:SS)
        else if (typeof tcValor === 'string') {
          const regexFechaHora = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/;
          const matchFechaHora = tcValor.match(regexFechaHora);
          
          if (matchFechaHora) {
            hora = parseInt(matchFechaHora[4], 10);
          } else {
            const regexHora = /^(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?$/;
            const matchHora = tcValor.match(regexHora);
            
            if (matchHora) {
              hora = parseInt(matchHora[1], 10);
            } else {
              const fecha = new Date(tcValor);
              if (!isNaN(fecha.getTime())) {
                hora = fecha.getHours();
              } else {
                const numeroPosible = parseFloat(tcValor);
                if (!isNaN(numeroPosible)) {
                  hora = Math.floor(numeroPosible);
                }
              }
            }
          }
        }
        // CASO 3: Si TC es un número
        else if (typeof tcValor === 'number') {
          if (tcValor > 1000000000) {
            const fecha = new Date(tcValor);
            if (!isNaN(fecha.getTime())) {
              hora = fecha.getHours();
            }
          } else {
            hora = Math.floor(tcValor);
          }
        }
        
        if (hora !== null && hora >= 0 && hora <= 23) {
          const horaFormateada = `${hora.toString().padStart(2, '0')}:00`;
          frecuenciaHoras.set(horaFormateada, (frecuenciaHoras.get(horaFormateada) || 0) + 1);
        }
      } catch (e) {
        console.warn('Error al procesar TC para hora:', e);
      }
    });
    
    const serviciosPorHora = Array.from(frecuenciaHoras.entries())
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => {
        const horaA = parseInt(a.hora.split(':')[0], 10);
        const horaB = parseInt(b.hora.split(':')[0], 10);
        return horaA - horaB;
      });
    
    // Para depuración
    console.log("Generación de datos completada:", {
      agrupamiento: agruparPorDia ? 'por día' : 'por mes',
      totalPeriodos: serviciosPorPeriodo.length,
      muestraPeriodos: serviciosPorPeriodo.slice(0, 3)
    });
    
    return {
      serviciosPorPeriodo,
      serviciosPorOperador,
      serviciosPorUnidad,
      serviciosPorEstatus,
      serviciosPorCliente,
      serviciosPorHora,
      // Agregar información para el título de la gráfica
      tituloGraficaTiempo
    };
  } catch (error) {
    console.error('Error al generar datos para gráficas:', error);
    return {
      serviciosPorPeriodo: [],
      serviciosPorOperador: [],
      serviciosPorUnidad: [],
      serviciosPorEstatus: [],
      serviciosPorCliente: [],
      serviciosPorHora: [],
      tituloGraficaTiempo: "Servicios por Mes"
    };
  }
};