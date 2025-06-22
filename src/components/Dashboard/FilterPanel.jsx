// src/components/Dashboard/FilterPanel.jsx - Versión con ancho completo
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
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    fechas: false,
    filtrosRapidos: false,
    estados: false,
    operadores: false
  });
  
  // Función para alternar el estado de una sección
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Componente para el header de sección con acordeón
  const AccordionHeader = ({ section, title, icon, count = 0, children }) => {
    const isExpanded = expandedSections[section];
    
    return (
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(section)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
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
              isExpanded ? 'transform rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        
        {/* Contenido colapsable con animación */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
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
        {/* Date Filter Section with Accordion */}
        <AccordionHeader 
          section="fechas" 
          title="Rango de Fechas" 
          count={filters.fechaInicio || filters.fechaFin ? 1 : 0}
          icon={
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          }
        >
          <DateFilter 
            fechaInicio={filters.fechaInicio}
            fechaFin={filters.fechaFin}
            onChange={onDateChange}
          />
        </AccordionHeader>
        
        {/* Quick Date Filters with Accordion */}
        <AccordionHeader 
          section="filtrosRapidos" 
          title="Filtros Rápidos" 
          count={0}
          icon={
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          }
        >
          <QuickDateFilter 
            onApplyFilter={onQuickDateFilter}
          />
        </AccordionHeader>
        
        {/* Status Filter with Accordion */}
        <AccordionHeader 
          section="estados" 
          title="Estados" 
          count={filters.estatus?.length || 0}
          icon={
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
        >
          <CheckboxFilter
            title="Estado"
            options={estatus}
            selectedValues={filters.estatus || []}
            onChange={onCheckboxChange}
            onSelectAll={onSelectAll}
          />
        </AccordionHeader>
        
        {/* Operators Filter with Accordion */}
        <AccordionHeader 
          section="operadores" 
          title="Operadores" 
          count={filters.operador?.length || 0}
          icon={
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          }
        >
          <CheckboxFilter
            title="Operadores"
            options={operadores}
            selectedValues={filters.operador || []}
            onChange={onCheckboxChange}
            onSelectAll={onSelectAll}
          />
        </AccordionHeader>
      </div>
    </div>
  );
};

export default FilterPanel;