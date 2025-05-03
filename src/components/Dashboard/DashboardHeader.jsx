import React from 'react';

const DashboardHeader = ({ onFileUpload, onResetFilters, onExportData }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Análisis de Servicios</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Cargar Excel
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={onFileUpload}
                className="hidden"
              />
            </div>
            <button
              onClick={onResetFilters}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Resetear Filtros
            </button>
            <button
              onClick={onExportData}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;