import React from 'react';

const QuickDateFilter = ({ onApplyFilter, showingCheckmark }) => {
  // Función auxiliar para formatear fecha a YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Filtro para hoy
  const handleToday = () => {
    const today = new Date();
    const todayFormatted = formatDate(today);
    
    console.log('Filtro Hoy:', {
      fecha: today.toISOString(),
      fechaFormatted: todayFormatted
    });
    
    onApplyFilter(todayFormatted, todayFormatted, 'hoy');
  };
  
  // Filtro para esta semana (lunes a domingo)
  const handleThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    // Calcular el lunes de esta semana
    const monday = new Date(today);
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo, son 6 días desde el lunes
    monday.setDate(today.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Calcular el domingo de esta semana
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    console.log('Filtro Esta Semana:', {
      inicioISO: monday.toISOString(),
      finISO: sunday.toISOString(),
      inicioFormatted: formatDate(monday),
      finFormatted: formatDate(sunday)
    });
    
    onApplyFilter(formatDate(monday), formatDate(sunday), 'estaSemana');
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
      formatDate(endOfMonth),
      'esteMes'
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
    onApplyFilter(startFormatted, endFormatted, '30Dias');
    
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
      formatDate(endDate),
      '3Meses'
    );
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={handleToday}
          className={`px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center h-10 ${
            showingCheckmark === 'hoy' ? 'button-success-animation' : ''
          }`}
        >
          {showingCheckmark === 'hoy' ? (
            <svg className="w-4 h-4 text-green-600 checkmark-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path>
              </svg>
              Hoy
            </>
          )}
        </button>
        <button
          onClick={handleThisWeek}
          className={`px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center h-10 ${
            showingCheckmark === 'estaSemana' ? 'button-success-animation' : ''
          }`}
        >
          {showingCheckmark === 'estaSemana' ? (
            <svg className="w-4 h-4 text-green-600 checkmark-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Esta semana
            </>
          )}
        </button>
        <button
          onClick={handleThisMonth}
          className={`px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center h-10 ${
            showingCheckmark === 'esteMes' ? 'button-success-animation' : ''
          }`}
        >
          {showingCheckmark === 'esteMes' ? (
            <svg className="w-4 h-4 text-green-600 checkmark-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Este mes
            </>
          )}
        </button>
        <button
          onClick={handleLast30Days}
          className={`px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center h-10 ${
            showingCheckmark === '30Dias' ? 'button-success-animation' : ''
          }`}
        >
          {showingCheckmark === '30Dias' ? (
            <svg className="w-4 h-4 text-green-600 checkmark-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              30 días
            </>
          )}
        </button>
        <button
          onClick={handleLast3Months}
          className={`px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center h-10 ${
            showingCheckmark === '3Meses' ? 'button-success-animation' : ''
          }`}
        >
          {showingCheckmark === '3Meses' ? (
            <svg className="w-4 h-4 text-green-600 checkmark-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              3 meses
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickDateFilter;