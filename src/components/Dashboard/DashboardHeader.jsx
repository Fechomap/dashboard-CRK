// src/components/Dashboard/DashboardHeader.jsx - Versión con ancho completo
import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardHeader = ({ 
  onFileUpload, 
  onResetFilters, 
  onExportData, 
  onClearData, 
  fileName,
  exportLoading
}) => {
  return (
    <header className="bg-white shadow-md w-full">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <div className="flex-1 mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Análisis de Servicios</h1>
            {fileName && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo actual: <span className="font-medium">{fileName}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
                  disabled={exportLoading}
                  className={`px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center ${
                    exportLoading ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {exportLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Exportar Gráficas PDF
                    </>
                  )}
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