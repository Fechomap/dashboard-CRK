import { useState, useEffect, useRef } from 'react';

export const useFilters = (initialData = []) => {
  const [filters, setFilters] = useState({
    operador: [],
    estatus: [],
    fechaInicio: '',
    fechaFin: ''
  });

  const [filteredData, setFilteredData] = useState(initialData);
  
  // Usar useRef para guardar los datos iniciales anteriores
  // Esto nos permite detectar cuando cambian para debugging
  const prevInitialDataRef = useRef(null);
  
  // Actualizar los datos filtrados cuando cambian los filtros o los datos iniciales
  useEffect(() => {
    // Log para depuración cuando cambian los datos iniciales
    if (prevInitialDataRef.current !== initialData) {
      console.log('Datos iniciales cambiaron:', {
        cantidadAnterior: prevInitialDataRef.current?.length || 0,
        cantidadNueva: initialData.length,
        muestraFechas: initialData.slice(0, 3).map(item => ({
          fechaRegistro: item.fechaRegistro instanceof Date ? 
            item.fechaRegistro.toISOString() : 'No es una fecha',
          valor: item.fechaRegistro
        }))
      });
      prevInitialDataRef.current = initialData;
    }
    
    try {
      applyFilters();
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      // En caso de error, mostrar los datos sin filtrar
      setFilteredData(initialData);
    }
  }, [filters, initialData]);
  
  // Función para aplicar filtros con detección mejorada de fechas
  const applyFilters = () => {
    let result = [...initialData];
    
    // Filtrar por operador
    if (filters.operador && filters.operador.length > 0) {
      result = result.filter(item => 
        item.operador && filters.operador.includes(item.operador)
      );
    }
    
    // Filtrar por estatus
    if (filters.estatus && filters.estatus.length > 0) {
      result = result.filter(item => 
        item.estatus && filters.estatus.includes(item.estatus)
      );
    }
    
    // Filtrar por fechas - CORRECCIÓN MEJORADA
    if (filters.fechaInicio) {
      try {
        // Parsear la fecha de inicio y establecer a medianoche
        const fechaInicio = new Date(filters.fechaInicio);
        fechaInicio.setHours(0, 0, 0, 0);
        
        // Contador para debugging
        let contadorFechasAnteriorFechaInicio = 0;
        let contadorNoFecha = 0;
        let contadorFechasInvalidas = 0;
        
        result = result.filter(item => {
          // Verificar que la fecha existe
          if (!item.fechaRegistro) {
            contadorNoFecha++;
            return false;
          }
          
          // Crear una nueva fecha a partir del valor
          let fechaItem;
          if (item.fechaRegistro instanceof Date) {
            fechaItem = new Date(item.fechaRegistro.getTime()); // clonar para no modificar original
          } else {
            // Intentar convertir string a Date
            fechaItem = new Date(item.fechaRegistro);
            if (isNaN(fechaItem.getTime())) {
              contadorFechasInvalidas++;
              return false;
            }
          }
          
          // Comparar solo la fecha (ignorar la hora)
          fechaItem.setHours(0, 0, 0, 0);
          
          const resultado = fechaItem >= fechaInicio;
          if (!resultado) contadorFechasAnteriorFechaInicio++;
          
          return resultado;
        });
        
        // Log de depuración para el filtro de fecha inicio
        console.log('Filtro fecha inicio:', {
          fechaInicio: fechaInicio.toISOString(),
          registrosDescartadosPorFechaAnterior: contadorFechasAnteriorFechaInicio,
          registrosSinFecha: contadorNoFecha,
          registrosConFechaInvalida: contadorFechasInvalidas,
          totalRegistrosRestantes: result.length
        });
      } catch (e) {
        console.error('Error al filtrar por fecha inicio:', e);
      }
    }
    
    if (filters.fechaFin) {
      try {
        // Parsear la fecha fin y establecer al final del día
        const fechaFin = new Date(filters.fechaFin);
        fechaFin.setHours(23, 59, 59, 999);
        
        // Contador para debugging
        let contadorFechasPosteriorFechaFin = 0;
        
        result = result.filter(item => {
          // Si no hay fecha, ya fue filtrado en el paso anterior
          if (!item.fechaRegistro) return false;
          
          // Crear una nueva fecha a partir del valor
          let fechaItem;
          if (item.fechaRegistro instanceof Date) {
            fechaItem = new Date(item.fechaRegistro.getTime()); // clonar
          } else {
            fechaItem = new Date(item.fechaRegistro);
            if (isNaN(fechaItem.getTime())) return false;
          }
          
          const resultado = fechaItem <= fechaFin;
          if (!resultado) contadorFechasPosteriorFechaFin++;
          
          return resultado;
        });
        
        // Log de depuración para el filtro de fecha fin
        console.log('Filtro fecha fin:', {
          fechaFin: fechaFin.toISOString(),
          registrosDescartadosPorFechaPosterior: contadorFechasPosteriorFechaFin,
          totalRegistrosRestantes: result.length
        });
      } catch (e) {
        console.error('Error al filtrar por fecha fin:', e);
      }
    }
    
    // Si hay filtros de fecha, verificar la distribución de fechas resultante
    if (filters.fechaInicio || filters.fechaFin) {
      try {
        // Agrupar por mes para ver distribución
        const distribucionMensual = {};
        
        result.forEach(item => {
          if (item.fechaRegistro instanceof Date) {
            const fecha = item.fechaRegistro;
            const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!distribucionMensual[mesKey]) {
              distribucionMensual[mesKey] = 0;
            }
            distribucionMensual[mesKey]++;
          }
        });
        
        console.log('Distribución mensual después de filtrar:', distribucionMensual);
      } catch (e) {
        console.error('Error al calcular distribución mensual:', e);
      }
    }
    
    // Log para depuración final
    console.log('Filtros aplicados finales:', {
      totalRegistrosFiltrados: result.length,
      filtros: { ...filters },
      muestraRegistros: result.slice(0, 3).map(item => ({
        fechaRegistro: item.fechaRegistro instanceof Date ? 
          item.fechaRegistro.toISOString() : 'No es fecha válida',
        operador: item.operador,
        estatus: item.estatus
      }))
    });
    
    setFilteredData(result);
  };
  
  // Manejador de cambio de filtro de checkbox
  const handleCheckboxChange = (filterName, value, isChecked) => {
    // Validar que filterName sea uno de los filtros válidos
    if (!Object.keys(filters).includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}`);
      return;
    }
    
    setFilters(prev => {
      // Verificar que el array existe antes de operar
      const currentArray = prev[filterName] || [];
      
      if (isChecked) {
        // Añadir el valor al array si no existe
        return {
          ...prev,
          [filterName]: [...currentArray, value]
        };
      } else {
        // Eliminar el valor del array
        return {
          ...prev,
          [filterName]: currentArray.filter(v => v !== value)
        };
      }
    });
  };
  
  // Manejador para seleccionar todos
  const selectAll = (filterName, values) => {
    // Validar que filterName sea uno de los filtros válidos
    if (!Object.keys(filters).includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}`);
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [filterName]: [...values]
    }));
  };
  
  // Manejador para eliminar todos
  const removeAll = (filterName) => {
    // Validar que filterName sea uno de los filtros válidos
    if (!Object.keys(filters).includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}`);
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [filterName]: []
    }));
  };
  
  // Resetear todos los filtros
  const resetFilters = () => {
    setFilters({
      operador: [],
      estatus: [],
      fechaInicio: '',
      fechaFin: ''
    });
  };
  
  return {
    filters,
    filteredData,
    handleCheckboxChange,
    selectAll,
    removeAll,
    resetFilters,
    setFilters
  };
};