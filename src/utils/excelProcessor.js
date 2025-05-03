// Función para procesar los datos del Excel
export const procesarDatosExcel = (jsonData) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return [];
  }

  return jsonData.map(item => {
    // Procesar fechas
    let fechaReg = null;
    let fechaAsig = null;
    
    try {
      if (item.fechaRegistro) {
        fechaReg = new Date(item.fechaRegistro);
        if (isNaN(fechaReg.getTime())) fechaReg = null;
      }
      
      if (item.fechaAsignacion) {
        fechaAsig = new Date(item.fechaAsignacion);
        if (isNaN(fechaAsig.getTime())) fechaAsig = null;
      }
    } catch (e) {
      console.warn('Error al procesar fechas:', e);
    }
    
    return {
      ...item,
      fechaRegistro: fechaReg,
      fechaAsignacion: fechaAsig
    };
  });
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