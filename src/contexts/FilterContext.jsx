// src/contexts/FilterContext.jsx - Contexto especializado para manejo de filtros
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFilters } from '../hooks/useFilters';
import ExcelProcessingService from '../services/ExcelProcessingService';
import FilterService from '../services/FilterService';
import { useData } from './DataContext.jsx';

const FilterContext = createContext();

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext debe ser usado dentro de un FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const { data } = useData();
  
  // Estado de filtros usando el hook existente
  const filterState = useFilters(data);
  
  // Estado para opciones de filtros
  const [filterOptions, setFilterOptions] = useState({
    operadores: [],
    estatus: [],
    clientes: []
  });

  // Actualizar opciones de filtro cuando cambian los datos
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        const options = ExcelProcessingService.extractFilterOptions(data);
        setFilterOptions(options);
      } catch (error) {
        console.error("Error al extraer opciones de filtro:", error);
        setFilterOptions({
          operadores: [],
          estatus: [],
          clientes: []
        });
      }
    }
  }, [data]);

  // Manejadores memoizados para cambios de fecha
  const handleDateChange = useCallback((fieldName, value) => {
    filterState.setFilters(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, [filterState.setFilters]);
  
  // Manejador memoizado para filtros rápidos de fecha
  const handleQuickDateFilter = useCallback((startDate, endDate) => {
    filterState.setFilters(prev => ({
      ...prev,
      fechaInicio: startDate,
      fechaFin: endDate
    }));
  }, [filterState.setFilters]);

  // Valor memoizado del contexto
  const value = useMemo(() => ({
    // Estado de filtros
    ...filterState,
    filterOptions,
    
    // Manejadores
    handleDateChange,
    handleQuickDateFilter
  }), [
    filterState,
    filterOptions,
    handleDateChange,
    handleQuickDateFilter
  ]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};