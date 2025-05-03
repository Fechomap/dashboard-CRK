// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExcelData } from '../hooks/useExcelData';
import { useFilters } from '../hooks/useFilters';
import { extractFilterOptions } from '../utils/excelProcessor';
import { generateChartData } from '../utils/chartDataGenerator';

// Crear el contexto
const DashboardContext = createContext();

// Hook personalizado para usar el contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de un DashboardProvider');
  }
  return context;
};

// Proveedor del contexto
export const DashboardProvider = ({ children }) => {
  // Estado de Excel
  const { 
    data, 
    loading, 
    error, 
    fileName, 
    handleFileUpload, 
    clearData 
  } = useExcelData();
  
  // Estado de filtros
  const { 
    filters, 
    filteredData, 
    handleCheckboxChange, 
    selectAll, 
    removeAll, 
    resetFilters,
    setFilters
  } = useFilters(data);
  
  // Estados adicionales
  const [filterOptions, setFilterOptions] = useState({
    operadores: [],
    estatus: []
  });
  
  const [chartData, setChartData] = useState({
    serviciosPorPeriodo: [],
    serviciosPorOperador: [],
    serviciosPorUnidad: [],
    serviciosPorEstatus: [],
    serviciosPorCliente: [],
    serviciosPorHora: [],
    tituloGraficaTiempo: "Servicios por Mes"
  });
  
  // Actualizar opciones de filtro cuando cambian los datos
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        const options = extractFilterOptions(data);
        setFilterOptions(options);
      } catch (error) {
        console.error("Error al extraer opciones de filtro:", error);
      }
    }
  }, [data]);
  
  // Actualizar datos de gráficos cuando cambian los datos filtrados o los filtros
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      try {
        // Pasar los filtros actuales para determinar si agrupar por día o por mes
        const newChartData = generateChartData(filteredData, filters);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error al generar datos para gráficas:", error);
      }
    } else {
      // Resetear gráficos cuando no hay datos
      setChartData({
        serviciosPorPeriodo: [],
        serviciosPorOperador: [],
        serviciosPorUnidad: [],
        serviciosPorEstatus: [],
        serviciosPorCliente: [],
        serviciosPorHora: [],
        tituloGraficaTiempo: "Servicios por Mes"
      });
    }
  }, [filteredData, filters]);

  // Manejador para cambios de fecha
  const handleDateChange = (fieldName, value) => {
    setFilters(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Manejador para filtros rápidos de fecha
  const handleQuickDateFilter = (startDate, endDate) => {
    setFilters(prev => ({
      ...prev,
      fechaInicio: startDate,
      fechaFin: endDate
    }));
  };
  
  // Manejador para clics en gráficos
  const handleChartClick = (chartType, data) => {
    if (!data || !data.payload) return;
    
    try {
      switch (chartType) {
        case 'operador':
          const operadorValue = data.payload.operador;
          const isOperadorSelected = filters.operador.includes(operadorValue);
          handleCheckboxChange('operador', operadorValue, !isOperadorSelected);
          break;
        case 'estatus':
          const estatusValue = data.payload.estatus;
          const isEstatusSelected = filters.estatus.includes(estatusValue);
          handleCheckboxChange('estatus', estatusValue, !isEstatusSelected);
          break;
        case 'cliente':
          const clienteValue = data.payload.cliente;
          if (clienteValue && !filters.cliente) {
            // Si no existe el filtro cliente, crearlo
            setFilters(prev => ({
              ...prev,
              cliente: [clienteValue]
            }));
          } else {
            const isClienteSelected = filters.cliente?.includes(clienteValue);
            if (filters.cliente) {
              // Si existe el filtro, actuar como un toggle
              handleCheckboxChange('cliente', clienteValue, !isClienteSelected);
            }
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error al manejar clic en gráfica:", error);
    }
  };
  
  // Exportar datos filtrados a CSV
  const exportData = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    
    try {
      // Verificar que Papa está disponible
      const Papa = window.Papa;
      if (!Papa) {
        console.error('Papa Parse not found. Make sure it is imported.');
        return;
      }
      
      const datosParaExportar = filteredData.map(item => ({
        numero: item.numero,
        fechaRegistro: item.fechaRegistro instanceof Date 
          ? item.fechaRegistro.toISOString().split('T')[0]
          : item.fechaRegistro,
        fechaAsignacion: item.fechaAsignacion instanceof Date 
          ? item.fechaAsignacion.toISOString().split('T')[0]
          : item.fechaAsignacion,
        operador: item.operador,
        unidadOperativa: item.unidadOperativa,
        cuenta: item.cuenta,
        estatus: item.estatus,
        costoTotal: item.costoTotal
      }));
      
      const csv = Papa.unparse(datosParaExportar);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'datos_filtrados.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar datos:", error);
      alert("Error al exportar los datos");
    }
  };
  
  // Valores que se proveerán a través del contexto
  const value = {
    // Estado
    data,
    loading,
    error,
    fileName,
    filteredData,
    filters,
    filterOptions,
    chartData,
    
    // Funciones
    handleFileUpload,
    clearData,
    handleCheckboxChange,
    selectAll,
    removeAll,
    resetFilters,
    handleDateChange,
    handleQuickDateFilter,
    handleChartClick,
    exportData
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};