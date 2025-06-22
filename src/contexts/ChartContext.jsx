// src/contexts/ChartContext.jsx - Contexto especializado para manejo de gráficos
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ChartDataService from '../services/ChartDataService';
import { useFilterContext } from './FilterContext.jsx';

const ChartContext = createContext();

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart debe ser usado dentro de un ChartProvider');
  }
  return context;
};

export const ChartProvider = ({ children }) => {
  const { filteredData, filters, handleCheckboxChange, setFilters } = useFilterContext();
  
  // Referencias a los elementos de gráficos para exportación
  const chartRefs = useRef({
    lineChart: useRef(null),
    operatorChart: useRef(null),
    statusChart: useRef(null),
    unitChart: useRef(null),
    clientChart: useRef(null),
    hourChart: useRef(null)
  });
  
  // Referencias a estadísticas
  const statsRef = useRef(null);
  
  // Estado de datos de gráficos
  const [chartData, setChartData] = useState({
    serviciosPorPeriodo: [],
    serviciosPorOperador: [],
    serviciosPorUnidad: [],
    serviciosPorEstatus: [],
    serviciosPorCliente: [],
    serviciosPorHora: [],
    tituloGraficaTiempo: "Servicios por Mes"
  });

  // Actualizar datos de gráficos cuando cambian los datos filtrados o los filtros
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      try {
        const newChartData = ChartDataService.generateChartData(filteredData, filters);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error al generar datos para gráficas:", error);
      }
    } else {
      // Resetear gráficos cuando no hay datos
      setChartData(ChartDataService.getEmptyChartData());
    }
  }, [filteredData, filters]);

  // Manejador memoizado para clics en gráficos
  const handleChartClick = useCallback((chartType, data) => {
    if (!data || !data.payload) return;
    
    try {
      switch (chartType) {
        case 'operador': {
          const operadorValue = data.payload.operador;
          const isOperadorSelected = filters.operador.includes(operadorValue);
          handleCheckboxChange('operador', operadorValue, !isOperadorSelected);
          break;
        }
        case 'estatus': {
          const estatusValue = data.payload.estatus;
          const isEstatusSelected = filters.estatus.includes(estatusValue);
          handleCheckboxChange('estatus', estatusValue, !isEstatusSelected);
          break;
        }
        case 'cliente': {
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
        }
        default:
          break;
      }
    } catch (error) {
      console.error("Error al manejar clic en gráfica:", error);
    }
  }, [filters, handleCheckboxChange, setFilters]);
  
  // Función memoizada para registrar referencias de gráficos
  const registerChartRef = useCallback((name, ref) => {
    if (name && ref && chartRefs.current) {
      chartRefs.current[name] = ref;
    }
  }, []);

  // Valor memoizado del contexto
  const value = useMemo(() => ({
    // Estado
    chartData,
    chartRefs: chartRefs.current,
    statsRef,
    
    // Funciones
    handleChartClick,
    registerChartRef
  }), [
    chartData,
    handleChartClick,
    registerChartRef
  ]);

  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  );
};