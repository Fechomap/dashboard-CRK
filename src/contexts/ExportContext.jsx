// src/contexts/ExportContext.js - Contexto especializado para funcionalidad de exportación
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PDFExportService from '../services/PDFExportService';
import { useFilterContext } from './FilterContext.jsx';
import { useChart } from './ChartContext.jsx';
import { useData } from './DataContext.jsx';

const ExportContext = createContext();

export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport debe ser usado dentro de un ExportProvider');
  }
  return context;
};

export const ExportProvider = ({ children }) => {
  const { filteredData, filters } = useFilterContext();
  const { chartRefs } = useChart();
  const { fileName } = useData();
  
  const [exportLoading, setExportLoading] = useState(false);

  // Función memoizada para exportar gráficos a PDF
  const exportData = useCallback(async () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    
    try {
      setExportLoading(true);
      
      // Recopilar referencias de gráficos
      const chartElements = [
        chartRefs.lineChart?.current,
        chartRefs.operatorChart?.current,
        chartRefs.statusChart?.current,
        chartRefs.unitChart?.current,
        chartRefs.clientChart?.current,
        chartRefs.hourChart?.current
      ].filter(Boolean); // Filtrar referencias nulas
      
      // Calcular estadísticas con validaciones mejoradas
      const totalServices = filteredData.length;
      const completedServices = filteredData.filter(item => item && item.estatus === 'Concluido').length;
      
      const totalCostSum = filteredData.reduce((acc, item) => {
        // Validar que item existe
        if (!item) return acc;
        
        let costo = 0;
        if (item.costoTotal !== undefined && item.costoTotal !== null) {
          if (typeof item.costoTotal === 'string') {
            const parsed = parseFloat(item.costoTotal.replace(/[^\d.-]/g, ''));
            costo = isNaN(parsed) ? 0 : parsed;
          } else if (typeof item.costoTotal === 'number') {
            costo = isNaN(item.costoTotal) ? 0 : item.costoTotal;
          }
        }
        // Validar que costo es finito
        return acc + (isFinite(costo) ? costo : 0);
      }, 0);
      
      const totalCost = isFinite(totalCostSum) ? Math.round(totalCostSum) : 0;
      // Proteger contra división por cero y valores no finitos
      const averageCost = (filteredData.length > 0 && isFinite(totalCostSum)) 
        ? Math.round(totalCostSum / filteredData.length) 
        : 0;
      
      const activeOperators = new Set(
        filteredData
          .filter(item => item && item.operador) // Validar que item y operador existen
          .map(item => item.operador)
          .filter(operador => operador && operador.trim() !== '') // Filtrar valores vacíos
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
  }, [filteredData, chartRefs, filters, fileName]);

  // Valor memoizado del contexto
  const value = useMemo(() => ({
    exportLoading,
    exportData
  }), [exportLoading, exportData]);

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};