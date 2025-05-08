// Función para procesar los datos del Excel
export const procesarDatosExcel = (jsonData) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return [];
  }

  // Función simplificada para detectar la columna de fecha
  const detectarColumnaFechaRegistro = (primerItem) => {
    // Buscar específicamente 'fechaRegistro' primero
    if ('fechaRegistro' in primerItem) {
      return 'fechaRegistro';
    }
    
    // Buscar cualquier columna que contenga 'fecha'
    for (const prop of Object.keys(primerItem)) {
      if (prop.toLowerCase().includes('fecha')) {
        return prop;
      }
    }
    
    return null;
  };
  
  // Detectar nombres de columnas en el primer elemento
  let columnaFechaRegistro = null;
  
  if (jsonData.length > 0) {
    columnaFechaRegistro = detectarColumnaFechaRegistro(jsonData[0]);
    console.log(`Columna de fecha encontrada: ${columnaFechaRegistro}`);
  }
  
  // FUNCIÓN CORREGIDA para convertir valores a fechas
  // FUNCIÓN CORREGIDA para convertir valores a fechas
  const convertirAFecha = (valor) => {
    if (!valor) return null;
    
    try {
      // Si ya es una fecha, ajustar para la zona horaria local
      if (valor instanceof Date) {
        // CORRECCIÓN CRÍTICA: Crear nueva fecha usando componentes locales para evitar
        // el desplazamiento de zona horaria
        const nuevaFecha = new Date(
          valor.getFullYear(),
          valor.getMonth(),
          valor.getDate(),
          12, 0, 0 // Medio día para evitar problemas con horario de verano
        );
        return isNaN(nuevaFecha.getTime()) ? null : nuevaFecha;
      }
      
      // Si es un string, priorizar formato DD/MM/YYYY
      if (typeof valor === 'string') {
        // Intentar formato dd/mm/yyyy (formato español/mexicano)
        const match = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
          const dia = parseInt(match[1], 10);
          const mes = parseInt(match[2], 10) - 1; // JavaScript usa meses 0-11
          const anio = parseInt(match[3], 10);
          
          // CORRECCIÓN CRÍTICA: Crear fecha con hora 12:00 para evitar problemas de zona horaria
          const fecha = new Date(anio, mes, dia, 12, 0, 0);
          // Verificar que la fecha sea válida
          if (!isNaN(fecha.getTime())) {
            return fecha;
          }
        }
        
        // Si no coincide con formato, intentar creación directa
        // pero ajustando a hora local
        try {
          // Primero crear una fecha con el string
          const fechaTemp = new Date(valor);
          if (!isNaN(fechaTemp.getTime())) {
            // CORRECCIÓN: Crear nueva fecha usando componentes locales
            return new Date(
              fechaTemp.getFullYear(),
              fechaTemp.getMonth(),
              fechaTemp.getDate(),
              12, 0, 0
            );
          }
        } catch (e) {
          console.warn(`Error al parsear fecha: ${valor}`, e);
        }
      }
      
      // Si es un número, podría ser un número serial de Excel
      if (typeof valor === 'number') {
        try {
          // Convertir número serial de Excel a fecha JavaScript
          const fecha = new Date(Math.round((valor - 25569) * 86400 * 1000));
          if (!isNaN(fecha.getTime())) {
            // CORRECCIÓN: Crear nueva fecha usando componentes locales
            return new Date(
              fecha.getFullYear(),
              fecha.getMonth(),
              fecha.getDate(),
              12, 0, 0
            );
          }
        } catch (e) {
          console.warn(`Error al convertir número a fecha: ${valor}`, e);
        }
      }
      
      // Si todos los intentos fallan
      return null;
    } catch (e) {
      console.warn(`Error global al convertir valor a fecha: ${valor}`, e);
      return null;
    }
  };
  
  // Procesar cada elemento
  const datosProcesados = jsonData.map((item, index) => {
    // Obtener la fecha del registro
    let fechaReg = null;
    
    if (columnaFechaRegistro && columnaFechaRegistro in item) {
      fechaReg = convertirAFecha(item[columnaFechaRegistro]);
      
      // Para depuración, mostrar algunas conversiones
      if (index < 10 || index % 500 === 0) {
        console.log(`Registro #${index} - Original: ${item[columnaFechaRegistro]}, Convertida: ${fechaReg}`);
      }
    }
    
    // Crear objeto con propiedades originales y fecha procesada
    return {
      ...item,
      fechaRegistro: fechaReg
    };
  });
  
  console.log(`Total registros: ${datosProcesados.length}, Con fechas válidas: ${datosProcesados.filter(item => item.fechaRegistro !== null).length}`);
  
  return datosProcesados;
};

// Mantener la función extractFilterOptions como estaba
export const extractFilterOptions = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      operadores: [],
      estatus: []
    };
  }
  
  // Contar servicios por operador para ordenamiento
  const conteoOperadores = {};
  data.forEach(item => {
    if (item.operador) {
      conteoOperadores[item.operador] = (conteoOperadores[item.operador] || 0) + 1;
    }
  });
  
  // Obtener operadores únicos y ordenarlos por cantidad de servicios
  const operadores = [...new Set(data.map(item => item.operador).filter(Boolean))]
    .sort((a, b) => (conteoOperadores[b] || 0) - (conteoOperadores[a] || 0));
  
  const estatus = [...new Set(data.map(item => item.estatus).filter(Boolean))];
  
  return {
    operadores,
    estatus
  };
};