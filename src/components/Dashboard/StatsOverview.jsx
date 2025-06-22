// src/components/Dashboard/StatsOverview.jsx - Versión con ancho completo
import React from 'react';
import StatsCard from './StatsCard';

const StatsOverview = ({ filteredData }) => {
  // Validar que filteredData es un array válido
  if (!Array.isArray(filteredData)) {
    console.warn('StatsOverview: filteredData no es un array válido:', filteredData);
    return null;
  }
  
  // Calculate statistics from the filtered data
  const totalServices = filteredData.length;
  
  const completedServices = filteredData.filter(
    item => item && item.estatus === 'Concluido'
  ).length;
  
  // Calcular suma total de costos con validaciones mejoradas
  const totalCostSum = filteredData.length > 0 
    ? filteredData.reduce((acc, item) => {
        // Validar que item existe
        if (!item) return acc;
        
        // Asegurar que costoTotal es un número válido
        let costo = 0;
        if (item.costoTotal !== undefined && item.costoTotal !== null) {
          // Si es string, intentar convertir a número
          if (typeof item.costoTotal === 'string') {
            const parsed = parseFloat(item.costoTotal.replace(/[^\d.-]/g, ''));
            costo = isNaN(parsed) ? 0 : parsed;
          } else if (typeof item.costoTotal === 'number') {
            costo = isNaN(item.costoTotal) ? 0 : item.costoTotal;
          }
        }
        // Validar que costo es un número válido y finito
        return acc + (isFinite(costo) ? costo : 0);
      }, 0)
    : 0;
  
  // Usar la suma para calcular tanto el total como el promedio con protección contra división por cero
  const totalCost = isFinite(totalCostSum) ? Math.round(totalCostSum) : 0;
  const averageCost = (filteredData.length > 0 && isFinite(totalCostSum)) 
    ? Math.round(totalCostSum / filteredData.length) 
    : 0;
  
  const activeOperators = new Set(
    filteredData
      .filter(item => item && item.operador) // Validar que item y operador existen
      .map(item => item.operador)
      .filter(operador => operador && operador.trim() !== '') // Filtrar valores vacíos
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 w-full">
      <StatsCard 
        title="Total de Servicios" 
        value={totalServices}
        color="blue"
      />
      
      <StatsCard 
        title="Servicios Concluidos" 
        value={completedServices}
        color="green"
      />
      
      <StatsCard 
        title="Costo Total" 
        value={totalCost}
        prefix="$"
        color="red"
      />
      
      <StatsCard 
        title="Promedio Costo Total" 
        value={averageCost}
        prefix="$"
        color="yellow"
      />
      
      <StatsCard 
        title="Operadores Activos" 
        value={activeOperators}
        color="blue"
      />
    </div>
  );
};

export default StatsOverview;