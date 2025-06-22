// src/components/Dashboard/FilterPanel.jsx - Versión con sistema de overlay
import React, { useState, useCallback, useMemo } from 'react';
import CheckboxFilter from './FilterComponents/CheckboxFilter';
import DateFilter from './FilterComponents/DateFilter';
import QuickDateFilter from './FilterComponents/QuickDateFilter';

const FilterPanel = ({ 
  filters, 
  filterOptions, 
  onCheckboxChange, 
  onDateChange, 
  onQuickDateFilter,
  onSelectAll 
}) => {
  // Estado para controlar qué sección está abierta (solo una a la vez)
  const [openSection, setOpenSection] = useState(null);
  
  // Estado para controlar la animación de confirmación en filtros rápidos
  const [showingCheckmark, setShowingCheckmark] = useState(null);
  
  // Función para alternar el estado de una sección (memoizada)
  const toggleSection = useCallback((section) => {
    setOpenSection(prev => prev === section ? null : section);
  }, []);
  
  // Función para cerrar overlay (memoizada)
  const closeOverlay = useCallback(() => {
    setOpenSection(null);
  }, []);
  
  // Función wrapper para filtros rápidos con animación de confirmación (memoizada)
  const handleQuickDateFilterWithAnimation = useCallback(async (startDate, endDate, filterName) => {
    setShowingCheckmark(filterName); // Mostrar palomita en el botón específico
    
    // Esperar a que se vea la animación
    await new Promise(resolve => setTimeout(resolve, 400));
    
    onQuickDateFilter(startDate, endDate); // Aplicar filtro
    closeOverlay(); // Cerrar modal
    setShowingCheckmark(null); // Reset estado de animación
  }, [onQuickDateFilter, closeOverlay]);
  
  // Función para formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
  };
  
  // Función auxiliar para formatear fecha a YYYY-MM-DD (igual que en QuickDateFilter)
  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Función para detectar qué filtro rápido está aplicado
  const detectQuickFilter = () => {
    if (!filters.fechaInicio || !filters.fechaFin) return null;
    
    const today = new Date();
    const todayFormatted = formatDateForComparison(today);
    
    // Verificar si es "Hoy"
    if (filters.fechaInicio === todayFormatted && filters.fechaFin === todayFormatted) {
      return "Hoy";
    }
    
    // Verificar si es "Esta semana"
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(today.getDate() - daysSinceMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    if (filters.fechaInicio === formatDateForComparison(monday) && 
        filters.fechaFin === formatDateForComparison(sunday)) {
      return "Esta semana";
    }
    
    // Verificar si es "Este mes"
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    if (filters.fechaInicio === formatDateForComparison(startOfMonth) && 
        filters.fechaFin === formatDateForComparison(endOfMonth)) {
      return "Este mes";
    }
    
    // Verificar si es "Últimos 30 días"
    const endDate30 = new Date();
    const startDate30 = new Date();
    startDate30.setDate(endDate30.getDate() - 30);
    
    if (filters.fechaInicio === formatDateForComparison(startDate30) && 
        filters.fechaFin === formatDateForComparison(endDate30)) {
      return "30 días";
    }
    
    // Verificar si es "Últimos 3 meses"
    const endDate3m = new Date();
    const startDate3m = new Date();
    startDate3m.setMonth(endDate3m.getMonth() - 3);
    
    if (filters.fechaInicio === formatDateForComparison(startDate3m) && 
        filters.fechaFin === formatDateForComparison(endDate3m)) {
      return "3 meses";
    }
    
    return null; // No coincide con ningún filtro rápido
  };
  
  // Componente para mostrar filtros activos
  const ActiveFiltersIndicator = () => {
    const hasDateFilter = filters.fechaInicio || filters.fechaFin;
    const hasStatusFilter = filters.estatus && filters.estatus.length > 0;
    const hasOperatorFilter = filters.operador && filters.operador.length > 0;
    const quickFilterDetected = detectQuickFilter();
    
    // Si no hay filtros activos, no mostrar nada
    if (!hasDateFilter && !hasStatusFilter && !hasOperatorFilter) {
      return null;
    }
    
    return (
      <div className="bg-gray-50 rounded-lg p-4 h-fit">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Filtros Activos
        </h3>
        
        <div className="space-y-3">
          {/* Indicador de Filtro Rápido */}
          {quickFilterDetected && (
            <div className="flex items-center text-xs">
              <div className="bg-blue-100 p-1 rounded mr-2">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Filtro rápido:</div>
                <div className="text-blue-700 font-semibold">{quickFilterDetected}</div>
              </div>
            </div>
          )}
          
          {/* Indicador de Filtro de Fechas Manual (solo si no es filtro rápido) */}
          {hasDateFilter && !quickFilterDetected && (
            <div className="flex items-center text-xs">
              <div className="bg-gray-100 p-1 rounded mr-2">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Fechas:</div>
                <div className="text-gray-700 font-medium">
                  {filters.fechaInicio && filters.fechaFin ? 
                    `${formatDate(filters.fechaInicio)} - ${formatDate(filters.fechaFin)}` :
                    filters.fechaInicio ? 
                      `Desde: ${formatDate(filters.fechaInicio)}` :
                      `Hasta: ${formatDate(filters.fechaFin)}`
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Indicador de Estados */}
          {hasStatusFilter && (
            <div className="flex items-start text-xs">
              <div className="bg-green-100 p-1 rounded mr-2 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Estados:</div>
                <div className="text-green-700 font-medium">
                  {filters.estatus.length <= 3 ? 
                    filters.estatus.join(', ') :
                    `${filters.estatus.length} estados seleccionados`
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Indicador de Operadores */}
          {hasOperatorFilter && (
            <div className="flex items-start text-xs">
              <div className="bg-purple-100 p-1 rounded mr-2 mt-0.5">
                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Operadores:</div>
                <div className="text-purple-700 font-medium">
                  {filters.operador.length <= 3 ? 
                    filters.operador.join(', ') :
                    `${filters.operador.length} operadores seleccionados`
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Componente para el header de sección clickeable
  const FilterHeader = ({ section, title, icon }) => {
    const isOpen = openSection === section;
    
    return (
      <button
        onClick={() => toggleSection(section)}
        className={`w-full px-4 py-3 flex items-center justify-between rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
          isOpen 
            ? 'bg-blue-50 border-2 border-blue-200 shadow-md' 
            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 shadow-sm transition-colors duration-200 ${
            isOpen ? 'bg-blue-100' : 'bg-white'
          }`}>
            {icon}
          </div>
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    );
  };
  
  // Componente para el overlay del contenido del filtro (memoizado para evitar parpadeo)
  const FilterOverlay = useMemo(() => {
    return ({ section, title, children }) => {
      if (openSection !== section) return null;
      
      return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={closeOverlay}
            style={{ transition: 'opacity 150ms ease-out' }}
          />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 max-h-[70vh] overflow-hidden"
            style={{ 
              animation: 'modalFadeIn 150ms ease-out',
              transition: 'none'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <button
                onClick={closeOverlay}
                className="p-1 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ transition: 'background-color 150ms ease-out' }}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {children}
            </div>
          </div>
        </div>
      );
    };
  }, [openSection, closeOverlay]);
  // Validar que las opciones y filtros existan antes de pasarlos
  const operadores = filterOptions?.operadores || [];
  const estatus = filterOptions?.estatus || [];
  
  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 w-full">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Filtros de Datos</h2>
        </div>
        
        {/* Layout en dos columnas: filtros a la izquierda, indicadores a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Filtros (2/3 del espacio) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Date Filter Header */}
            <FilterHeader 
              section="fechas" 
              title="Rango de Fechas" 
              icon={
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              }
            />
            
            {/* Quick Date Filters Header */}
            <FilterHeader 
              section="filtrosRapidos" 
              title="Filtros Rápidos" 
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              }
            />
            
            {/* Status Filter Header */}
            <FilterHeader 
              section="estados" 
              title="Estados" 
              icon={
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            />
            
            {/* Operators Filter Header */}
            <FilterHeader 
              section="operadores" 
              title="Operadores" 
              icon={
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              }
            />
          </div>
          
          {/* Columna derecha - Indicadores de filtros activos (1/3 del espacio) */}
          <div className="lg:col-span-1">
            <ActiveFiltersIndicator />
          </div>
        </div>
      </div>

      {/* Overlays para cada filtro */}
      <FilterOverlay section="fechas" title="Rango de Fechas">
        <DateFilter 
          fechaInicio={filters.fechaInicio}
          fechaFin={filters.fechaFin}
          onChange={onDateChange}
        />
      </FilterOverlay>
      
      <FilterOverlay section="filtrosRapidos" title="Filtros Rápidos">
        <QuickDateFilter 
          onApplyFilter={handleQuickDateFilterWithAnimation}
          showingCheckmark={showingCheckmark}
        />
      </FilterOverlay>
      
      <FilterOverlay section="estados" title="Estados">
        <CheckboxFilter
          title="Estado"
          options={estatus}
          selectedValues={filters.estatus || []}
          onChange={onCheckboxChange}
          onSelectAll={onSelectAll}
        />
      </FilterOverlay>
      
      <FilterOverlay section="operadores" title="Operadores">
        <CheckboxFilter
          title="Operadores"
          options={operadores}
          selectedValues={filters.operador || []}
          onChange={onCheckboxChange}
          onSelectAll={onSelectAll}
        />
      </FilterOverlay>
    </>
  );
};

export default FilterPanel;