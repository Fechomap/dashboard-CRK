// src/components/Dashboard/FilterPanel.jsx - Versión con ancho completo
import React from 'react';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="space-y-6">
          {/* Date Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 className="font-medium text-gray-700">Rango de Fechas</h3>
            </div>
            <DateFilter 
              fechaInicio={filters.fechaInicio}
              fechaFin={filters.fechaFin}
              onChange={onDateChange}
            />
          </div>
          
          {/* Quick Date Filters */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <h3 className="font-medium text-gray-700">Filtros Rápidos</h3>
            </div>
            <QuickDateFilter 
              onApplyFilter={onQuickDateFilter}
            />
          </div>
          
          {/* Status Filter */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="font-medium text-gray-700">Estados</h3>
            </div>
            <CheckboxFilter
              title="Estado"
              options={estatus}
              selectedValues={filters.estatus || []}
              onChange={onCheckboxChange}
              onSelectAll={onSelectAll}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Operators Filter */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <h3 className="font-medium text-gray-700">Operadores</h3>
            </div>
            <CheckboxFilter
              title="Operadores"
              options={operadores}
              selectedValues={filters.operador || []}
              onChange={onCheckboxChange}
              onSelectAll={onSelectAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;