// Función para procesar los datos del Excel
export const procesarDatosExcel = (jsonData) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return [];
  }

  // Detectar el nombre de la columna que contiene la fecha de registro
  // Esto busca variaciones comunes del nombre de la columna
  const detectarColumnaFechaRegistro = (primerItem) => {
    const posiblesNombres = [
      'fechaRegistro', 'fecha_registro', 'fecha registro', 'Fecha Registro',
      'FECHA REGISTRO', 'FECHA_REGISTRO', 'Fecha', 'FECHA', 'fecha',
      'fecha_reg', 'Fecha_Reg', 'Fecha Reg'
    ];
    
    // Revisar propiedades exactas primero
    for (const nombre of posiblesNombres) {
      if (nombre in primerItem) {
        console.log(`Columna de fecha de registro detectada: "${nombre}"`);
        return nombre;
      }
    }
    
    // Buscar propiedades que contengan palabras clave
    const propiedades = Object.keys(primerItem);
    for (const prop of propiedades) {
      const propLower = prop.toLowerCase();
      if (propLower.includes('fecha') && (propLower.includes('reg') || propLower.includes('registro'))) {
        console.log(`Columna de fecha de registro detectada por coincidencia parcial: "${prop}"`);
        return prop;
      }
    }
    
    // Si no encontramos una columna específica, intentamos con cualquier columna que tenga "fecha"
    for (const prop of propiedades) {
      const propLower = prop.toLowerCase();
      if (propLower.includes('fecha')) {
        console.log(`Columna de fecha detectada (posible fecha de registro): "${prop}"`);
        return prop;
      }
    }
    
    // Si todo falla, intentamos usar la columna C (índice 2 en arrays base 0)
    if (propiedades.length > 2) {
      const terceraProp = propiedades[2];
      console.log(`Usando tercera columna como fecha de registro (columna C): "${terceraProp}"`);
      return terceraProp;
    }
    
    console.warn('No se pudo detectar una columna de fecha de registro');
    return null;
  };
  
  // Detectar el nombre de la columna que contiene la fecha de asignación
  const detectarColumnaFechaAsignacion = (primerItem) => {
    const posiblesNombres = [
      'fechaAsignacion', 'fecha_asignacion', 'fecha asignacion', 'Fecha Asignacion',
      'FECHA ASIGNACION', 'FECHA_ASIGNACION', 'fechaAsig', 'Fecha Asig'
    ];
    
    for (const nombre of posiblesNombres) {
      if (nombre in primerItem) {
        console.log(`Columna de fecha de asignación detectada: "${nombre}"`);
        return nombre;
      }
    }
    
    // Buscar propiedades que contengan palabras clave
    const propiedades = Object.keys(primerItem);
    for (const prop of propiedades) {
      const propLower = prop.toLowerCase();
      if (propLower.includes('fecha') && (propLower.includes('asig') || propLower.includes('asignacion') || propLower.includes('asignación'))) {
        console.log(`Columna de fecha de asignación detectada por coincidencia parcial: "${prop}"`);
        return prop;
      }
    }
    
    console.warn('No se pudo detectar una columna de fecha de asignación');
    return null;
  };
  
  // Detectar nombres de columnas en el primer elemento
  let columnaFechaRegistro = null;
  let columnaFechaAsignacion = null;
  
  if (jsonData.length > 0) {
    columnaFechaRegistro = detectarColumnaFechaRegistro(jsonData[0]);
    columnaFechaAsignacion = detectarColumnaFechaAsignacion(jsonData[0]);
    
    // Mostrar todos los nombres de columna para depuración
    console.log('Nombres de columnas en el Excel:', Object.keys(jsonData[0]));
  }
  
  // Función para convertir un valor a fecha válida
  const convertirAFecha = (valor) => {
    if (!valor) return null;
    
    try {
      // Si ya es una fecha, usarla directamente
      if (valor instanceof Date) {
        return isNaN(valor.getTime()) ? null : valor;
      }
      
      // Si es un número, podría ser un número serial de Excel
      if (typeof valor === 'number') {
        // Convertir número serial de Excel a fecha JavaScript
        const fecha = new Date(Math.round((valor - 25569) * 86400 * 1000));
        return isNaN(fecha.getTime()) ? null : fecha;
      }
      
      // Si es un string, intentar varias formas de parsearlo
      if (typeof valor === 'string') {
        // Primero intentar parseo directo
        let fecha = new Date(valor);
        if (!isNaN(fecha.getTime())) return fecha;
        
        // Intentar formato dd/mm/yyyy o dd-mm-yyyy
        const formatosDDMMYYYY = [
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // dd/mm/yyyy
          /^(\d{1,2})-(\d{1,2})-(\d{4})$/      // dd-mm-yyyy
        ];
        
        for (const regex of formatosDDMMYYYY) {
          const match = valor.match(regex);
          if (match) {
            const [_, dia, mes, anio] = match;
            fecha = new Date(anio, mes - 1, dia);
            if (!isNaN(fecha.getTime())) return fecha;
          }
        }
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
    // Inicializar fechas
    let fechaReg = null;
    let fechaAsig = null;
    
    // Obtener las fechas de las columnas detectadas
    if (columnaFechaRegistro && columnaFechaRegistro in item) {
      fechaReg = convertirAFecha(item[columnaFechaRegistro]);
    }
    
    if (columnaFechaAsignacion && columnaFechaAsignacion in item) {
      fechaAsig = convertirAFecha(item[columnaFechaAsignacion]);
    }
    
    // Para depuración, mostrar algunas conversiones (no todas para no saturar la consola)
    if (index < 5 || index % 500 === 0) {
      console.log(`Registro #${index} - Fecha original: ${item[columnaFechaRegistro]}, Convertida: ${fechaReg}`);
    }
    
    // Crear un objeto con las propiedades originales y las fechas procesadas
    return {
      ...item,
      fechaRegistro: fechaReg,
      fechaAsignacion: fechaAsig
    };
  });
  
  // Mostrar estadísticas de procesamiento
  const fechasValidas = datosProcesados.filter(item => item.fechaRegistro !== null).length;
  console.log(`Total de registros: ${datosProcesados.length}, Con fechas válidas: ${fechasValidas}`);
  
  return datosProcesados;
};

// Extraer opciones únicas para filtros
export const extractFilterOptions = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      operadores: [],
      estatus: []
    };
  }
  
  const operadores = [...new Set(data.map(item => item.operador).filter(Boolean))];
  const estatus = [...new Set(data.map(item => item.estatus).filter(Boolean))];
  
  return {
    operadores,
    estatus
  };
};