import React from 'react';
import StatsCard from './StatsCard';

const StatsOverview = ({ filteredData }) => {
  // Calculate statistics from the filtered data
  const totalServices = filteredData.length;
  
  const completedServices = filteredData.filter(
    item => item.estatus === 'Concluido'
  ).length;
  
  // Calcular suma total de costos
  const totalCostSum = filteredData.length > 0 
    ? filteredData.reduce((acc, item) => {
        // Asegurar que costoTotal es un número válido
        let costo = 0;
        if (item.costoTotal !== undefined && item.costoTotal !== null) {
          // Si es string, intentar convertir a número
          if (typeof item.costoTotal === 'string') {
            costo = parseFloat(item.costoTotal.replace(/[^\d.-]/g, '')) || 0;
          } else {
            costo = Number(item.costoTotal) || 0;
          }
        }
        // Ignorar NaN o valores no numéricos en el cálculo
        return acc + (isNaN(costo) ? 0 : costo);
      }, 0)
    : 0;
  
  // Usar la suma para calcular tanto el total como el promedio
  const totalCost = Math.round(totalCostSum);
  const averageCost = filteredData.length > 0 ? Math.round(totalCostSum / filteredData.length) : 0;
  
  const activeOperators = new Set(
    filteredData.map(item => item.operador).filter(Boolean)
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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