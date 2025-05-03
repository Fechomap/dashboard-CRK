// src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useExcelData } from '../hooks/useExcelData';
import { useFilters } from '../hooks/useFilters';
import { extractFilterOptions } from '../utils/excelProcessor';
import { generateChartData } from '../utils/chartDataGenerator';
import PDFExportService from '../services/PDFExportService';

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
  
  // Referencias a los elementos de gráficos para exportación
  const chartRefs = {
    lineChart: useRef(null),
    operatorChart: useRef(null),
    statusChart: useRef(null),
    unitChart: useRef(null),
    clientChart: useRef(null),
    hourChart: useRef(null)
  };
  
  // Referencias a estadísticas
  const statsRef = useRef(null);
  
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
  
  const [exportLoading, setExportLoading] = useState(false);
  
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
  
  // Exportar gráficos a PDF
  const exportData = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    
    try {
      setExportLoading(true);
      
      // Recopilar referencias de gráficos
      const chartElements = [
        chartRefs.lineChart.current,
        chartRefs.operatorChart.current,
        chartRefs.statusChart.current,
        chartRefs.unitChart.current,
        chartRefs.clientChart.current,
        chartRefs.hourChart.current
      ].filter(Boolean); // Filtrar referencias nulas
      
      // Calcular estadísticas
      const totalServices = filteredData.length;
      const completedServices = filteredData.filter(item => item.estatus === 'Concluido').length;
      
      const totalCostSum = filteredData.reduce((acc, item) => {
        let costo = 0;
        if (item.costoTotal !== undefined && item.costoTotal !== null) {
          if (typeof item.costoTotal === 'string') {
            costo = parseFloat(item.costoTotal.replace(/[^\d.-]/g, '')) || 0;
          } else {
            costo = Number(item.costoTotal) || 0;
          }
        }
        return acc + (isNaN(costo) ? 0 : costo);
      }, 0);
      
      const totalCost = Math.round(totalCostSum);
      const averageCost = filteredData.length > 0 ? Math.round(totalCostSum / filteredData.length) : 0;
      
      const activeOperators = new Set(
        filteredData.map(item => item.operador).filter(Boolean)
      ).size;
      
      // Estadísticas para el PDF
      const stats = {
        totalServices,
        completedServices,
        totalCost,
        averageCost,
        activeOperators
      };
      
      // Generar nombre de archivo
      const fileDate = new Date().toISOString().split('T')[0];
      const pdfFileName = `dashboard-report-${fileDate}.pdf`;
      
      // Exportar a PDF
      await PDFExportService.exportToPDF({
        charts: chartElements,
        stats,
        filename: pdfFileName,
        filters,
        fileName
      });
      
      setExportLoading(false);
    } catch (error) {
      console.error("Error al exportar datos:", error);
      alert(`Error al exportar: ${error.message}`);
      setExportLoading(false);
    }
  };
  
  // Función para registrar referencias de gráficos
  const registerChartRef = (name, ref) => {
    if (name && ref) {
      chartRefs[name] = ref;
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
    exportLoading,
    
    // Referencias
    chartRefs,
    statsRef,
    
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
    exportData,
    registerChartRef
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};