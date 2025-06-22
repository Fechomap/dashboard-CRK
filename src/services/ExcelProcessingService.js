// src/services/ExcelProcessingService.js - Servicio especializado para procesamiento de datos de Excel
/**
 * Servicio dedicado al procesamiento y validación de datos de Excel
 * Centraliza toda la lógica de conversión, validación y transformación de datos
 */
class ExcelProcessingService {
  
  /**
   * Función simplificada para detectar la columna de fecha en los datos
   * @param {Object} primerItem - Primer elemento del array de datos
   * @returns {string|null} Nombre de la columna de fecha encontrada
   */
  static detectarColumnaFechaRegistro(primerItem) {
    if (!primerItem || typeof primerItem !== 'object') {
      return null;
    }
    
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
  }

  /**
   * Convierte diversos formatos de fecha a objeto Date válido
   * Maneja zona horaria local para evitar desplazamientos
   * @param {any} valor - Valor a convertir (Date, string, number)
   * @returns {Date|null} Fecha convertida o null si no es válida
   */
  static convertirAFecha(valor) {
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
  }

  /**
   * Valida la estructura básica de los datos de Excel
   * @param {Array} jsonData - Datos crudos del Excel
   * @returns {Object} Resultado de validación con errores y advertencias
   */
  static validarEstructuraDatos(jsonData) {
    const resultado = {
      valido: true,
      errores: [],
      advertencias: [],
      estadisticas: {
        totalRegistros: 0,
        registrosConFecha: 0,
        columnasDetectadas: []
      }
    };

    // Validaciones básicas
    if (!jsonData) {
      resultado.valido = false;
      resultado.errores.push('Los datos no pueden ser nulos');
      return resultado;
    }

    if (!Array.isArray(jsonData)) {
      resultado.valido = false;
      resultado.errores.push('Los datos deben ser un array');
      return resultado;
    }

    if (jsonData.length === 0) {
      resultado.valido = false;
      resultado.errores.push('Los datos no pueden estar vacíos');
      return resultado;
    }

    // Estadísticas básicas
    resultado.estadisticas.totalRegistros = jsonData.length;
    
    // Detectar columnas en el primer registro
    if (jsonData[0] && typeof jsonData[0] === 'object') {
      resultado.estadisticas.columnasDetectadas = Object.keys(jsonData[0]);
      
      // Verificar si hay columna de fecha
      const columnaFecha = this.detectarColumnaFechaRegistro(jsonData[0]);
      if (!columnaFecha) {
        resultado.advertencias.push('No se detectó una columna de fecha válida');
      }
    }

    return resultado;
  }

  /**
   * Extrae opciones de filtro de los datos procesados
   * @param {Array} data - Datos procesados
   * @returns {Object} Opciones de filtro disponibles
   */
  static extractFilterOptions(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        operadores: [],
        estatus: [],
        clientes: [],
        unidades: []
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
    const clientes = [...new Set(data.map(item => item.cliente).filter(Boolean))];
    const unidades = [...new Set(data.map(item => item.unidad).filter(Boolean))];
    
    return {
      operadores,
      estatus,
      clientes,
      unidades
    };
  }

  /**
   * Función principal para procesar datos de Excel
   * @param {Array} jsonData - Datos crudos del archivo Excel
   * @returns {Array} Datos procesados y validados
   */
  static procesarDatosExcel(jsonData) {
    // Validar estructura básica
    const validacion = this.validarEstructuraDatos(jsonData);
    if (!validacion.valido) {
      console.error('Error en validación de datos:', validacion.errores);
      return [];
    }

    // Mostrar advertencias si las hay
    if (validacion.advertencias.length > 0) {
      console.warn('Advertencias en datos:', validacion.advertencias);
    }

    // Detectar columna de fecha
    let columnaFechaRegistro = null;
    if (jsonData.length > 0) {
      columnaFechaRegistro = this.detectarColumnaFechaRegistro(jsonData[0]);
      console.log(`Columna de fecha encontrada: ${columnaFechaRegistro}`);
    }
    
    // Procesar cada elemento
    const datosProcesados = jsonData.map((item, index) => {
      // Obtener la fecha del registro
      let fechaReg = null;
      
      if (columnaFechaRegistro && columnaFechaRegistro in item) {
        fechaReg = this.convertirAFecha(item[columnaFechaRegistro]);
        
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
    
    // Estadísticas finales
    const registrosConFecha = datosProcesados.filter(item => item.fechaRegistro !== null).length;
    console.log(`Total registros: ${datosProcesados.length}, Con fechas válidas: ${registrosConFecha}`);
    
    return datosProcesados;
  }

  /**
   * Genera un reporte detallado del procesamiento de datos
   * @param {Array} datosOriginales - Datos originales del Excel
   * @param {Array} datosProcesados - Datos después del procesamiento
   * @returns {Object} Reporte detallado del procesamiento
   */
  static generarReporteProcesamiento(datosOriginales, datosProcesados) {
    const reporte = {
      procesamiento: {
        registrosOriginales: datosOriginales?.length || 0,
        registrosProcesados: datosProcesados?.length || 0,
        registrosConFecha: datosProcesados?.filter(item => item.fechaRegistro !== null).length || 0,
        tasaExito: 0
      },
      estadisticas: {},
      errores: [],
      advertencias: []
    };

    if (reporte.procesamiento.registrosOriginales > 0) {
      reporte.procesamiento.tasaExito = 
        (reporte.procesamiento.registrosProcesados / reporte.procesamiento.registrosOriginales) * 100;
    }

    // Generar estadísticas adicionales
    if (datosProcesados && datosProcesados.length > 0) {
      const opciones = this.extractFilterOptions(datosProcesados);
      reporte.estadisticas = {
        operadoresUnicos: opciones.operadores.length,
        estatusUnicos: opciones.estatus.length,
        clientesUnicos: opciones.clientes.length,
        unidadesUnicas: opciones.unidades.length
      };
    }

    return reporte;
  }
}

export default ExcelProcessingService;