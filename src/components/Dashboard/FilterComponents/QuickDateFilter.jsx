import React from 'react';

const QuickDateFilter = ({ onApplyFilter }) => {
  // Filtro para el mes actual
  const handleThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    onApplyFilter(
      startOfMonth.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };
  
  // Filtro para los últimos 30 días
  const handleLast30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    onApplyFilter(
      thirtyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };
  
  // Filtro para los últimos 3 meses
  const handleLast3Months = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    onApplyFilter(
      threeMonthsAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Filtros rápidos</label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleThisMonth}
          className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Este mes
        </button>
        <button
          onClick={handleLast30Days}
          className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Últimos 30 días
        </button>
        <button
          onClick={handleLast3Months}
          className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Últimos 3 meses
        </button>
      </div>
    </div>
  );
};

export default QuickDateFilter;