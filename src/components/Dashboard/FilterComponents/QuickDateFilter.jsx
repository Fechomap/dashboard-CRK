import React from 'react';

const QuickDateFilter = ({ onApplyFilter }) => {
  // Función auxiliar para formatear fecha a YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Filtro para el mes actual
  const handleThisMonth = () => {
    const today = new Date();
    // Primer día del mes actual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Último día del mes actual
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Asegurar que se incluye todo el día
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    console.log('Filtro Este Mes:', {
      inicio: startOfMonth.toISOString(),
      fin: endOfMonth.toISOString(),
      inicioFormatted: formatDate(startOfMonth),
      finFormatted: formatDate(endOfMonth)
    });
    
    onApplyFilter(
      formatDate(startOfMonth),
      formatDate(endOfMonth)
    );
  };
  
  // Filtro mejorado para los últimos 30 días
  const handleLast30Days = () => {
    // Fecha actual con hora 23:59:59
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Fecha de 30 días atrás con hora 00:00:00
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    
    // Formatear para mostrar en log y depuración
    const startFormatted = formatDate(startDate);
    const endFormatted = formatDate(endDate);
    
    console.log('Filtro Últimos 30 Días MEJORADO:', {
      startDateISO: startDate.toISOString(),
      endDateISO: endDate.toISOString(),
      startFormatted,
      endFormatted,
      diasDiferencia: Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
    });
    
    // Aplicar el filtro
    onApplyFilter(startFormatted, endFormatted);
    
    // Mostrar información adicional para depuración
    setTimeout(() => {
      console.log('VERIFICACIÓN: Los rangos de fecha aplicados para últimos 30 días son:', {
        desde: startFormatted,
        hasta: endFormatted
      });
    }, 500);
  };
  
  // Filtro para los últimos 3 meses
  const handleLast3Months = () => {
    // Fecha actual con hora 23:59:59
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Fecha de 3 meses atrás con hora 00:00:00
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);
    startDate.setHours(0, 0, 0, 0);
    
    console.log('Filtro Últimos 3 Meses:', {
      startDateISO: startDate.toISOString(),
      endDateISO: endDate.toISOString(),
      startFormatted: formatDate(startDate),
      endFormatted: formatDate(endDate)
    });
    
    onApplyFilter(
      formatDate(startDate),
      formatDate(endDate)
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