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
      serviciosPorHora: []
    };
  }

  try {
    // Verificación de la existencia de la columna TC/tc en el primer elemento
    if (datos.length > 0) {
      const primeraFila = datos[0];
      const todasLasColumnas = Object.keys(primeraFila);
      console.log("Columnas disponibles:", todasLasColumnas);
      
      // Verificar si existe la columna tc (minúsculas) o TC (mayúsculas)
      const existeTC = todasLasColumnas.includes('TC');
      const existeTc = todasLasColumnas.includes('tc');
      console.log("¿Existe columna TC?", existeTC);
      console.log("¿Existe columna tc?", existeTc);
    }

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
    
    // 5. Services by client
    const serviciosPorCliente = _.chain(datos)
      .groupBy(d => d.cliente || 'Sin cliente')
      .map((value, key) => ({ cliente: key, cantidad: value.length }))
      .sortBy([o => o.cantidad])
      .value();
    
    // 6. Servicios por hora del día basado en tc/TC - MODIFICADO PARA MOSTRAR LAS 24 HORAS
    // Primero, filtrar datos que tengan la propiedad tc o TC
    const datosConTC = datos.filter(d => d.tc !== undefined || d.TC !== undefined);
    
    // Extracción de horas - similar al código anterior pero guardamos en un Map para luego completar las 24h
    const frecuenciaHoras = new Map();
    
    // Inicializar con todas las horas del día (0-23) con valor 0
    for (let i = 0; i < 24; i++) {
      const horaFormateada = `${i.toString().padStart(2, '0')}:00`;
      frecuenciaHoras.set(horaFormateada, 0);
    }
    
    // Procesar datos de TC y contar frecuencias
    datosConTC.forEach(d => {
      try {
        // Obtener el valor de TC, usando tc en minúsculas si existe, o TC en mayúsculas como respaldo
        const tcValor = d.tc !== undefined ? d.tc : d.TC;
        
        if (tcValor === undefined || tcValor === null) {
          return; // Omitir registros sin valor de TC
        }
        
        let hora = null;
        
        // CASO 1: Si TC es una fecha ya parseada
        if (tcValor instanceof Date) {
          hora = tcValor.getHours();
        }
        // CASO 2: Si TC es un string con formato fecha y hora (DD/MM/YYYY HH:MM:SS)
        else if (typeof tcValor === 'string') {
          // Patrón para fecha con formato DD/MM/YYYY HH:MM:SS o similares
          const regexFechaHora = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?/;
          const matchFechaHora = tcValor.match(regexFechaHora);
          
          if (matchFechaHora) {
            // Extraer la hora (grupo 4 de la regex)
            hora = parseInt(matchFechaHora[4], 10);
          } else {
            // Si no coincide con el formato de fecha completo, intentar extraer solo la hora
            const regexHora = /^(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2}))?$/;
            const matchHora = tcValor.match(regexHora);
            
            if (matchHora) {
              hora = parseInt(matchHora[1], 10);
            } else {
              // Intentar convertir directamente a fecha si es un formato estándar
              const fecha = new Date(tcValor);
              if (!isNaN(fecha.getTime())) {
                hora = fecha.getHours();
              } else {
                // Si es un número decimal (como "15.30") para representar hora
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
          // Si es un timestamp Unix
          if (tcValor > 1000000000) {  // Aproximadamente desde el año 2001
            const fecha = new Date(tcValor);
            if (!isNaN(fecha.getTime())) {
              hora = fecha.getHours();
            }
          } else {
            // Si es la hora en formato decimal (15.30)
            hora = Math.floor(tcValor);
          }
        }
        
        // Si se extrajo una hora válida, incrementar su contador
        if (hora !== null && hora >= 0 && hora <= 23) {
          const horaFormateada = `${hora.toString().padStart(2, '0')}:00`;
          frecuenciaHoras.set(horaFormateada, (frecuenciaHoras.get(horaFormateada) || 0) + 1);
        }
      } catch (e) {
        console.warn('Error al procesar TC para hora:', e);
      }
    });
    
    // Convertir el Map a un array para la gráfica
    // Importante: mantener el orden cronológico de las horas (00:00 a 23:00)
    const serviciosPorHora = Array.from(frecuenciaHoras.entries())
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => {
        // Extraer solo la hora numérica para ordenar cronológicamente
        const horaA = parseInt(a.hora.split(':')[0], 10);
        const horaB = parseInt(b.hora.split(':')[0], 10);
        return horaA - horaB;
      });
    
    // Para depuración: mostrar algunos datos de TC procesados
    console.log("Datos de servicios por hora:", {
      totalRegistros: datos.length,
      totalRegistrosConTC: datosConTC.length,
      totalHorasAgrupadas: serviciosPorHora.length,
      distribucionCompleta: serviciosPorHora
    });
    
    return {
      serviciosPorMes,
      serviciosPorOperador,
      serviciosPorUnidad,
      serviciosPorEstatus,
      serviciosPorCliente,
      serviciosPorHora
    };
  } catch (error) {
    console.error('Error al generar datos para gráficas:', error);
    return {
      serviciosPorMes: [],
      serviciosPorOperador: [],
      serviciosPorUnidad: [],
      serviciosPorEstatus: [],
      serviciosPorCliente: [],
      serviciosPorHora: []
    };
  }
};