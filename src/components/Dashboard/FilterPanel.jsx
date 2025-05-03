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
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Date Filter */}
          <DateFilter 
            fechaInicio={filters.fechaInicio}
            fechaFin={filters.fechaFin}
            onChange={onDateChange}
          />
          
          {/* Quick Date Filters */}
          <div className="my-4">
            <QuickDateFilter 
              onApplyFilter={onQuickDateFilter}
            />
          </div>
          
          {/* Status Filter */}
          <CheckboxFilter
            title="Estado"
            options={estatus}
            selectedValues={filters.estatus || []}
            onChange={onCheckboxChange}
            onSelectAll={onSelectAll}
          />
        </div>
        
        <div>
          {/* Operators Filter */}
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
  );
};

export default FilterPanel;