import React, { useState } from 'react';
import { formatDate } from '../../utils/dataFormatters';

const DataTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  
  // Calcular páginas totales
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Obtener datos para la página actual
  const currentData = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  
  // Navegar a la página anterior
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  // Navegar a la página siguiente
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Tabla de Servicios</h3>
        <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Tabla de Servicios</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.fechaRegistro)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.operador}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unidadOperativa}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cuenta}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${item.estatus === 'Concluido' ? 'bg-green-100 text-green-800' : 
                      item.estatus === 'Cancelado' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {item.estatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.costoTotal ? item.costoTotal.toLocaleString() : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Paginación */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{Math.min(data.length, (currentPage * itemsPerPage) + 1)}-{Math.min(data.length, (currentPage + 1) * itemsPerPage)}</span> de <span className="font-medium">{data.length}</span> resultados
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`px-3 py-1 border rounded text-sm ${currentPage === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              Anterior
            </button>
            <button 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`px-3 py-1 border rounded text-sm ${currentPage >= totalPages - 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;