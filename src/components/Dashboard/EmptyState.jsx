// src/components/Dashboard/EmptyState.jsx
import React from 'react';

const EmptyState = ({ onFileUpload }) => {
  return (
    <div className="bg-white p-8 rounded shadow text-center">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h2 className="text-xl font-semibold mb-2">No hay datos cargados</h2>
      <p className="text-gray-600 mb-4">Carga un archivo Excel para comenzar a analizar tus datos</p>
      <label 
        htmlFor="file-upload-main" 
        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        Seleccionar archivo
      </label>
      <input
        id="file-upload-main"
        type="file"
        accept=".xlsx, .xls"
        onChange={onFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default EmptyState;