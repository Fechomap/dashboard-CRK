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
  const convertirAFecha = (valor) => {
    if (!valor) return null;
    
    try {
      // Si ya es una fecha, usarla directamente
      if (valor instanceof Date) {
        return isNaN(valor.getTime()) ? null : valor;
      }
      
      // Si es un string, PRIORIZAR EL FORMATO DD/MM/YYYY
      if (typeof valor === 'string') {
        // Intentar formato dd/mm/yyyy (formato español/mexicano)
        const match = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
          const dia = parseInt(match[1], 10);
          const mes = parseInt(match[2], 10) - 1; // JavaScript usa meses 0-11
          const anio = parseInt(match[3], 10);
          
          const fecha = new Date(anio, mes, dia);
          // Verificar que la fecha sea válida
          if (!isNaN(fecha.getTime())) {
            return fecha;
          }
        }
        
        // Si no coincide con el formato DD/MM/YYYY, intentar parseo directo
        const fechaDirecta = new Date(valor);
        if (!isNaN(fechaDirecta.getTime())) {
          return fechaDirecta;
        }
      }
      
      // Si es un número, podría ser un número serial de Excel
      if (typeof valor === 'number') {
        const fecha = new Date(Math.round((valor - 25569) * 86400 * 1000));
        return isNaN(fecha.getTime()) ? null : fecha;
      }
      
      // Si todos los intentos fallan
      return null;
    } catch (e) {
      console.warn(`Error al convertir valor a fecha: ${valor}`, e);
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