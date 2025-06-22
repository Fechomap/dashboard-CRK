// src/utils/chartDataGenerator.js - Versión optimizada y sin dependencias de lodash

// Cache para resultados de procesamiento
const processCache = new Map();

// Función helper para generar clave de cache
const generateCacheKey = (datos, filters) => {
  const dataHash = datos.length + '_' + (datos[0]?.fechaRegistro || '') + '_' + (datos[datos.length - 1]?.fechaRegistro || '');
  const filterHash = JSON.stringify(filters);
  return `${dataHash}_${filterHash}`;
};

/**
 * Genera datos para gráficas a partir del dataset filtrado - OPTIMIZADO
 * @param {Array} datos - Array de datos filtrados
 * @param {Object} filters - Objeto con los filtros aplicados, incluyendo fechaInicio y fechaFin
 * @returns {Object} Objeto con todos los conjuntos de datos para gráficas
 */
export const generateChartData = (datos, filters = {}) => {
  // Validación temprana
  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    return getEmptyChartData();
  }
  
  // Verificar cache
  const cacheKey = generateCacheKey(datos, filters);
  if (processCache.has(cacheKey)) {
    return processCache.get(cacheKey);
  }

  try {
    // Determinar agrupamiento de manera optimizada
    const { agruparPorDia, tituloGraficaTiempo } = determinarAgrupamiento(filters);
    
    // Procesar datos de manera optimizada usando Maps para mejor rendimiento
    const result = procesarDatosOptimizado(datos, agruparPorDia, tituloGraficaTiempo, filters);
    
    // Guardar en cache
    processCache.set(cacheKey, result);
    
    // Limpiar cache si es muy grande (mantener solo 10 entradas)
    if (processCache.size > 10) {
      const firstKey = processCache.keys().next().value;
      processCache.delete(firstKey);
    }
    
    return result;
  } catch (error) {
    console.error('Error al generar datos para gráficas:', error);
    return getEmptyChartData();
  }
};

// Funciones helper optimizadas

/**
 * Retorna estructura vacía de datos de gráficos
 */
const getEmptyChartData = () => ({
  serviciosPorPeriodo: [],
  serviciosPorOperador: [],
  serviciosPorUnidad: [],
  serviciosPorEstatus: [],
  serviciosPorCliente: [],
  serviciosPorHora: [],
  tituloGraficaTiempo: "Servicios por Mes"
});

/**
 * Determina el tipo de agrupamiento basado en filtros
 */
const determinarAgrupamiento = (filters) => {
  let agruparPorDia = false;
  let tituloGraficaTiempo = "Servicios por Mes";
  
  if (filters.fechaInicio && filters.fechaFin) {
    const fechaInicio = new Date(filters.fechaInicio);
    const fechaFin = new Date(filters.fechaFin);
    
    // Calcular la diferencia en días de manera optimizada
    const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / 86400000); // 1000 * 60 * 60 * 24 = 86400000
    
    // Si la diferencia es 31 días o menos, agrupar por día
    if (diferenciaDias <= 31 && diferenciaDias >= 0) {
      agruparPorDia = true;
      tituloGraficaTiempo = "Servicios por Día";
    }
  }
  
  return { agruparPorDia, tituloGraficaTiempo };
};

/**
 * Procesa datos de manera optimizada usando Maps
 */
const procesarDatosOptimizado = (datos, agruparPorDia, tituloGraficaTiempo, filters) => {
  // Usar Maps para mejor rendimiento en agrupamiento
  const periodMap = new Map();
  const operadorMap = new Map();
  const unidadMap = new Map();
  const estatusMap = new Map();
  const clienteMap = new Map();
  const horaMap = new Map();

  // Inicializar mapa de horas (0-23)
  for (let i = 0; i < 24; i++) {
    horaMap.set(`${i.toString().padStart(2, '0')}:00`, 0);
  }

  // Un solo bucle para procesar todos los datos
  datos.forEach(item => {
    if (!item) return;

    // 1. Procesar período
    const periodo = obtenerPeriodoOptimizado(item.fechaRegistro, agruparPorDia);
    updateMapWithCost(periodMap, periodo, item.costoTotal);
    
    // 2. Procesar operador
    const operador = item.operador || 'Sin operador';
    incrementMap(operadorMap, operador);
    
    // 3. Procesar unidad
    const unidad = item.unidadOperativa || 'Sin unidad';
    incrementMap(unidadMap, unidad);
    
    // 4. Procesar estatus
    const estatus = item.estatus || 'Sin estatus';
    incrementMap(estatusMap, estatus);
    
    // 5. Procesar cliente
    const cliente = item.cliente || 'Sin cliente';
    incrementMap(clienteMap, cliente);
    
    // 6. Procesar hora (solo si tiene TC)
    procesarHoraOptimizada(item, horaMap);
  });

  // Convertir Maps a arrays de manera optimizada
  return {
    serviciosPorPeriodo: procesarPeriodos(periodMap, filters, agruparPorDia),
    serviciosPorOperador: mapToSortedArray(operadorMap, 'operador', 10),
    serviciosPorUnidad: mapToSortedArray(unidadMap, 'unidad'),
    serviciosPorEstatus: mapToSortedArray(estatusMap, 'estatus'),
    serviciosPorCliente: mapToSortedArray(clienteMap, 'cliente'),
    serviciosPorHora: Array.from(horaMap.entries())
      .map(([hora, cantidad]) => ({ hora, cantidad })),
    tituloGraficaTiempo
  };
};

/**
 * Helper para incrementar contador en Map
 */
const incrementMap = (map, key) => {
  map.set(key, (map.get(key) || 0) + 1);
};

/**
 * Helper para actualizar Map con costo
 */
const updateMapWithCost = (map, key, costo) => {
  if (!map.has(key)) {
    map.set(key, { cantidad: 0, costoTotal: 0 });
  }
  const current = map.get(key);
  current.cantidad++;
  current.costoTotal += parseCostoSeguro(costo);
};

/**
 * Parser seguro de costos
 */
const parseCostoSeguro = (costo) => {
  if (!costo) return 0;
  if (typeof costo === 'number') return isFinite(costo) ? costo : 0;
  if (typeof costo === 'string') {
    const parsed = parseFloat(costo.replace(/[^\d.-]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * Obtener período de manera optimizada
 */
const obtenerPeriodoOptimizado = (fechaRegistro, agruparPorDia) => {
  if (!fechaRegistro) return 'Sin fecha';
  
  try {
    const date = fechaRegistro instanceof Date ? fechaRegistro : new Date(fechaRegistro);
    
    if (isNaN(date.getTime())) return 'Sin fecha';
    
    if (agruparPorDia) {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } else {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${meses[date.getMonth()]} ${date.getFullYear()}`;
    }
  } catch {
    return 'Sin fecha';
  }
};

/**
 * Procesar hora de manera optimizada
 */
const procesarHoraOptimizada = (item, horaMap) => {
  if (!item.tc) return;
  
  try {
    const tcDate = item.tc instanceof Date ? item.tc : new Date(item.tc);
    if (!isNaN(tcDate.getTime())) {
      const hora = `${tcDate.getHours().toString().padStart(2, '0')}:00`;
      horaMap.set(hora, horaMap.get(hora) + 1);
    }
  } catch {
    // Ignorar errores de parsing de fecha
  }
};

/**
 * Convertir Map a array ordenado
 */
const mapToSortedArray = (map, nameKey, limit = null) => {
  let result = Array.from(map.entries())
    .map(([key, value]) => ({ [nameKey]: key, cantidad: value }))
    .sort((a, b) => b.cantidad - a.cantidad);
    
  if (limit) {
    result = result.slice(0, limit);
  }
  
  return result;
};

/**
 * Procesar períodos con completado de fechas faltantes
 */
const procesarPeriodos = (periodMap, filters, agruparPorDia) => {
  // Convertir Map a array
  let result = Array.from(periodMap.entries())
    .map(([periodo, data]) => ({
      periodo,
      cantidad: data.cantidad,
      costoTotal: Math.round(data.costoTotal)
    }));

  // Completar períodos faltantes si hay filtros de fecha
  if (filters.fechaInicio && filters.fechaFin && agruparPorDia) {
    result = completarPeriodosFaltantes(result, filters.fechaInicio, filters.fechaFin);
  }

  // Ordenar por fecha
  return result.sort((a, b) => {
    if (agruparPorDia) {
      const [diaA, mesA] = a.periodo.split('/').map(Number);
      const [diaB, mesB] = b.periodo.split('/').map(Number);
      return mesA !== mesB ? mesA - mesB : diaA - diaB;
    } else {
      // Para meses, ordenar por año y mes
      const fechaA = new Date(a.periodo.split(' ')[1], getMesIndex(a.periodo.split(' ')[0]));
      const fechaB = new Date(b.periodo.split(' ')[1], getMesIndex(b.periodo.split(' ')[0]));
      return fechaA.getTime() - fechaB.getTime();
    }
  });
};

/**
 * Completar períodos faltantes para días
 */
const completarPeriodosFaltantes = (data, fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const dataMap = new Map(data.map(d => [d.periodo, d]));
  const resultado = [];

  const fechaActual = new Date(inicio);
  while (fechaActual <= fin) {
    const periodo = `${fechaActual.getDate().toString().padStart(2, '0')}/${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}`;
    
    resultado.push(dataMap.get(periodo) || {
      periodo,
      cantidad: 0,
      costoTotal: 0
    });
    
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return resultado;
};

/**
 * Obtener índice de mes
 */
const getMesIndex = (mesNombre) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses.indexOf(mesNombre);
};
