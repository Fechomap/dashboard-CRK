// src/components/Dashboard/StatsOverview.jsx - Versión con ancho completo
import React, { useMemo } from 'react';
import StatsCard from './StatsCard';
import StatisticsService from '../../services/StatisticsService';

const StatsOverview = ({ filteredData }) => {
  // Validar que filteredData es un array válido
  if (!Array.isArray(filteredData)) {
    console.warn('StatsOverview: filteredData no es un array válido:', filteredData);
    return null;
  }
  
  // Los cálculos ahora están memoizados en el hook useMemo abajo
  
  // Memoizar cálculos pesados para evitar recalcular en cada render
  const stats = useMemo(() => {
    // Usar el servicio de estadísticas para los cálculos
    const financialMetrics = StatisticsService.calculateFinancialMetrics(filteredData);
    const operatorMetrics = StatisticsService.calculateOperatorMetrics(filteredData);
    const completionMetrics = StatisticsService.calculateCompletionRate(filteredData);
    
    return {
      totalServices: financialMetrics.totalServices,
      completedServices: completionMetrics.completedServices,
      totalCost: financialMetrics.totalCost,
      averageCost: financialMetrics.averageCost,
      activeOperators: operatorMetrics.activeOperators
    };
  }, [filteredData]); // Solo recalcular cuando filteredData cambie

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 w-full">
      <StatsCard 
        title="Total de Servicios" 
        value={stats.totalServices}
        color="blue"
      />
      
      <StatsCard 
        title="Servicios Concluidos" 
        value={stats.completedServices}
        color="green"
      />
      
      <StatsCard 
        title="Costo Total" 
        value={stats.totalCost}
        prefix="$"
        color="red"
      />
      
      <StatsCard 
        title="Promedio Costo Total" 
        value={stats.averageCost}
        prefix="$"
        color="yellow"
      />
      
      <StatsCard 
        title="Operadores Activos" 
        value={stats.activeOperators}
        color="blue"
      />
    </div>
  );
};

export default StatsOverview;