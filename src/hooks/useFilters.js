// src/hooks/useFilters.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { applyDateFilter } from '../utils/filterUtils';

export const useFilters = (initialData = []) => {
  const [filters, setFilters] = useState({
    operador: [],
    estatus: [],
    cliente: [], // Agregar filtro de cliente al estado inicial
    fechaInicio: '',
    fechaFin: ''
  });

  const [filteredData, setFilteredData] = useState(initialData);
  
  // Usar useRef para debug
  const prevInitialDataRef = useRef(null);
  
  // Función memoizada para aplicar filtros con detección mejorada de fechas
  const applyFilters = useCallback(() => {
    // Validar que initialData sea un array válido
    if (!Array.isArray(initialData) || initialData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...initialData];
    
    // Filtrar por operador con validación
    if (filters.operador && filters.operador.length > 0) {
      result = result.filter(item => 
        item && item.operador && filters.operador.includes(item.operador)
      );
    }
    
    // Filtrar por estatus con validación
    if (filters.estatus && filters.estatus.length > 0) {
      result = result.filter(item => 
        item && item.estatus && filters.estatus.includes(item.estatus)
      );
    }
    
    // Filtrar por cliente con validación
    if (filters.cliente && filters.cliente.length > 0) {
      result = result.filter(item => 
        item && item.cliente && filters.cliente.includes(item.cliente)
      );
    }
    
    // Filtrar por fechas con validación
    if (filters.fechaInicio || filters.fechaFin) {
      try {
        result = applyDateFilter(result, filters.fechaInicio, filters.fechaFin);
      } catch (error) {
        console.error('Error al aplicar filtro de fechas:', error);
      }
    }
    
    setFilteredData(result);
  }, [initialData, filters]);
  
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
  }, [filters, initialData, applyFilters]);
  
  // Manejador memoizado de cambio de filtro de checkbox
  const handleCheckboxChange = useCallback((filterName, value, isChecked) => {
    // Validar que filterName sea uno de los filtros válidos
    const validFilters = ['operador', 'estatus', 'cliente'];
    if (!validFilters.includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}. Filtros válidos: ${validFilters.join(', ')}`);
      return;
    }
    
    // Validar que value no sea null/undefined
    if (value == null || value === '') {
      console.warn(`Valor inválido para filtro ${filterName}:`, value);
      return;
    }
    
    setFilters(prev => {
      // Verificar que el array existe antes de operar
      const currentArray = prev[filterName] || [];
      
      if (isChecked) {
        // Añadir el valor al array si no existe ya
        if (!currentArray.includes(value)) {
          return {
            ...prev,
            [filterName]: [...currentArray, value]
          };
        }
        return prev; // No cambiar si ya existe
      } else {
        // Eliminar el valor del array
        return {
          ...prev,
          [filterName]: currentArray.filter(v => v !== value)
        };
      }
    });
  }, []);
  
  // Manejador memoizado para seleccionar todos
  const selectAll = useCallback((filterName, values) => {
    // Validar que filterName sea uno de los filtros válidos
    const validFilters = ['operador', 'estatus', 'cliente'];
    if (!validFilters.includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}. Filtros válidos: ${validFilters.join(', ')}`);
      return;
    }
    
    // Validar que values sea un array
    if (!Array.isArray(values)) {
      console.error(`Values debe ser un array para ${filterName}:`, values);
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [filterName]: [...values]
    }));
  }, []);
  
  // Manejador memoizado para eliminar todos
  const removeAll = useCallback((filterName) => {
    // Validar que filterName sea uno de los filtros válidos
    const validFilters = ['operador', 'estatus', 'cliente'];
    if (!validFilters.includes(filterName)) {
      console.error(`Filtro no válido: ${filterName}. Filtros válidos: ${validFilters.join(', ')}`);
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      [filterName]: []
    }));
  }, []);
  
  // Resetear todos los filtros
  const resetFilters = useCallback(() => {
    setFilters({
      operador: [],
      estatus: [],
      cliente: [], // Incluir cliente en reset
      fechaInicio: '',
      fechaFin: ''
    });
  }, []);
  
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