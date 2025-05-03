import React from 'react';

const CheckboxFilter = ({ title, options, selectedValues, onChange, onSelectAll }) => {
  // Convertir el título para generar el nombre del filtro
  // Esto garantiza consistencia con los nombres de filtros en useFilters.js
  const getFilterName = (title) => {
    if (title === "Operadores") return "operador";
    if (title === "Estado") return "estatus";
    return title.toLowerCase();
  };
  
  const filterName = getFilterName(title);
  const isAllSelected = options.length > 0 && selectedValues.length === options.length;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`select-all-${filterName}`}
            checked={isAllSelected}
            onChange={(e) => onSelectAll(filterName, e.target.checked ? options : [])}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor={`select-all-${filterName}`} className="ml-2 text-sm text-gray-700">
            Seleccionar todos
          </label>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto border rounded p-2">
        {options.length === 0 ? (
          <p className="text-sm text-gray-500">No hay opciones disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {options.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${filterName}-${option}`}
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => onChange(filterName, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`${filterName}-${option}`}
                  className="ml-2 text-sm text-gray-700 truncate"
                  title={option}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFilter;