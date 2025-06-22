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
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          {selectedValues.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              {selectedValues.length}
            </span>
          )}
        </div>
        <button
          onClick={() => onSelectAll(filterName, isAllSelected ? [] : options)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
        >
          {isAllSelected ? 'Quitar todos' : 'Todos'}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
        {options.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-sm text-gray-500">No hay opciones disponibles</p>
          </div>
        ) : (
          <div className="space-y-1">
            {options.map(option => (
              <label
                key={option}
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                  selectedValues.includes(option) ? 'bg-blue-50 border-blue-200' : 'border-transparent'
                } border`}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => onChange(filterName, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span
                  className="ml-3 text-sm text-gray-700 flex-1 truncate"
                  title={option}
                >
                  {option}
                </span>
                {selectedValues.includes(option) && (
                  <svg className="w-4 h-4 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxFilter;