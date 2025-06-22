// src/components/Dashboard/FilterPanel.jsx - Versión con sistema de overlay
import React, { useState } from 'react';
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
  
  // Función para alternar el estado de una sección
  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };
  
  // Función para cerrar overlay
  const closeOverlay = () => {
    setOpenSection(null);
  };
  
  // Componente para el header de sección clickeable
  const FilterHeader = ({ section, title, icon, count = 0 }) => {
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
          <div className="text-left">
            <h3 className="font-medium text-gray-700">{title}</h3>
            {count > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {count} seleccionado{count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
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
  
  // Componente para el overlay del contenido del filtro
  const FilterOverlay = ({ section, title, children }) => {
    if (openSection !== section) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-200"
          onClick={closeOverlay}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={closeOverlay}
              className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {children}
          </div>
        </div>
      </div>
    );
  };
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
        
        <div className="space-y-4 w-full">
          {/* Date Filter Header */}
          <FilterHeader 
            section="fechas" 
            title="Rango de Fechas" 
            count={filters.fechaInicio || filters.fechaFin ? 1 : 0}
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
            count={0}
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
            count={filters.estatus?.length || 0}
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
            count={filters.operador?.length || 0}
            icon={
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            }
          />
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
          onApplyFilter={onQuickDateFilter}
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