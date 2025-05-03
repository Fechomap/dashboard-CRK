import { useState, useEffect } from 'react';

export const useFilters = (initialData = []) => {
  const [filters, setFilters] = useState({
    operador: [],
    estatus: [],
    fechaInicio: '',
    fechaFin: ''
  });

  const [filteredData, setFilteredData] = useState(initialData);
  
  // Actualizar los datos filtrados cuando cambian los filtros o los datos iniciales
  useEffect(() => {
    applyFilters();
  }, [filters, initialData]);
  
  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...initialData];
    
    // Filtrar por operador
    if (filters.operador.length > 0) {
      result = result.filter(item => 
        filters.operador.includes(item.operador)
      );
    }
    
    // Filtrar por estatus
    if (filters.estatus.length > 0) {
      result = result.filter(item => 
        filters.estatus.includes(item.estatus)
      );
    }
    
    // Filtrar por fechas
    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      result = result.filter(item => 
        item.fechaRegistro && new Date(item.fechaRegistro) >= fechaInicio
      );
    }
    
    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      fechaFin.setHours(23, 59, 59);
      result = result.filter(item => 
        item.fechaRegistro && new Date(item.fechaRegistro) <= fechaFin
      );
    }
    
    setFilteredData(result);
  };
  
  // Manejador de cambio de filtro de checkbox
  const handleCheckboxChange = (filterName, value, isChecked) => {
    setFilters(prev => {
      if (isChecked) {
        return {
          ...prev,
          [filterName]: [...prev[filterName], value]
        };
      } else {
        return {
          ...prev,
          [filterName]: prev[filterName].filter(v => v !== value)
        };
      }
    });
  };
  
  // Manejador para seleccionar todos
  const selectAll = (filterName, values) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: [...values]
    }));
  };
  
  // Manejador para eliminar todos
  const removeAll = (filterName) => {
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