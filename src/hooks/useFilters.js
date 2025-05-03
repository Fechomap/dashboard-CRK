// src/hooks/useFilters.js
import { useState, useEffect, useRef } from 'react';
import { applyDateFilter } from '../utils/filterUtils';

export const useFilters = (initialData = []) => {
  const [filters, setFilters] = useState({
    operador: [],
    estatus: [],
    fechaInicio: '',
    fechaFin: ''
  });

  const [filteredData, setFilteredData] = useState(initialData);
  
  // Usar useRef para debug
  const prevInitialDataRef = useRef(null);
  
  // Actualizar los datos filtrados cuando cambian los filtros o los datos iniciales
  useEffect(() => {
    // Log para depuración cuando cambian los datos iniciales
    if (prevInitialDataRef.current !== initialData) {
      console.log('Datos iniciales cambiaron:', {
        cantidadAnterior: prevInitialDataRef.current?.length || 0,
        cantidadNueva: initialData.length
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
    
    // Filtrar por fechas
    if (filters.fechaInicio || filters.fechaFin) {
      result = applyDateFilter(result, filters.fechaInicio, filters.fechaFin);
    }
    
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