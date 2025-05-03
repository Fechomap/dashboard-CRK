import React from 'react';

const DashboardHeader = ({ onFileUpload, onResetFilters, onExportData, onClearData, fileName }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex-1 mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Análisis de Servicios</h1>
            {fileName && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo actual: <span className="font-medium">{fileName}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            
            {fileName && (
              <>
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
                <button
                  onClick={onClearData}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar Excel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;