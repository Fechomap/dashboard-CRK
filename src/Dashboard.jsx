import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Hooks
import { useExcelData } from './hooks/useExcelData';
import { useFilters } from './hooks/useFilters';

// Utilities
import { extractFilterOptions } from './utils/excelProcessor';
import { generateChartData } from './utils/chartDataGenerator';

// Common Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

// Dashboard Components
import DashboardHeader from './components/Dashboard/DashboardHeader';
import FilterPanel from './components/Dashboard/FilterPanel';
import StatsOverview from './components/Dashboard/StatsOverview';
import ChartGrid from './components/Dashboard/ChartGrid';
import DataTable from './components/Dashboard/DataTable';

const Dashboard = () => {
  // Use custom hooks for data and filters
  const { data, loading, error, handleFileUpload } = useExcelData();
  const { 
    filters, 
    filteredData, 
    handleCheckboxChange, 
    selectAll, 
    removeAll, 
    resetFilters,
    setFilters
  } = useFilters(data);
  
  // States for filter options and chart data
  const [filterOptions, setFilterOptions] = useState({
    operadores: [],
    estatus: []
  });
  
  const [chartData, setChartData] = useState({
    serviciosPorMes: [],
    serviciosPorOperador: [],
    serviciosPorUnidad: [],
    serviciosPorEstatus: [],
    tiemposDeAtencion: []
  });
  
  // Update filter options when data changes
  useEffect(() => {
    if (data.length > 0) {
      const options = extractFilterOptions(data);
      setFilterOptions(options);
    }
  }, [data]);
  
  // Update chart data when filtered data changes
  useEffect(() => {
    if (filteredData.length > 0) {
      const newChartData = generateChartData(filteredData);
      setChartData(newChartData);
    }
  }, [filteredData]);

  // Handler for date changes
  const handleDateChange = (fieldName, value) => {
    setFilters(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Handler for quick date filters
  const handleQuickDateFilter = (startDate, endDate) => {
    handleDateChange('fechaInicio', startDate);
    handleDateChange('fechaFin', endDate);
  };
  
  // Handler for chart clicks to update filters
  const handleChartClick = (chartType, data) => {
    if (!data || !data.payload) return;
    
    switch (chartType) {
      case 'operador':
        handleCheckboxChange('operador', data.payload.operador, !filters.operador.includes(data.payload.operador));
        break;
      case 'estatus':
        handleCheckboxChange('estatus', data.payload.estatus, !filters.estatus.includes(data.payload.estatus));
        break;
      default:
        break;
    }
  };
  
  // Function to export filtered data to CSV
  const exportData = () => {
    if (!Papa) {
      console.error('Papa Parse not found. Make sure it is imported.');
      return;
    }
    
    const datosParaExportar = filteredData.map(item => ({
      numero: item.numero,
      fechaRegistro: item.fechaRegistro instanceof Date 
        ? item.fechaRegistro.toISOString() 
        : item.fechaRegistro,
      fechaAsignacion: item.fechaAsignacion instanceof Date 
        ? item.fechaAsignacion.toISOString() 
        : item.fechaAsignacion,
      operador: item.operador,
      unidadOperativa: item.unidadOperativa,
      cuenta: item.cuenta,
      estatus: item.estatus,
      costoTotal: item.costoTotal
    }));
    
    const csv = Papa.unparse(datosParaExportar);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'datos_filtrados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Cargando, por favor espere..." />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <DashboardHeader 
        onFileUpload={handleFileUpload}
        onResetFilters={resetFilters}
        onExportData={exportData}
      />
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {data.length === 0 ? (
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
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <>
            {/* Filter Panel */}
            <FilterPanel 
              filters={filters}
              filterOptions={filterOptions}
              onCheckboxChange={handleCheckboxChange}
              onDateChange={handleDateChange}
              onQuickDateFilter={handleQuickDateFilter}
              onSelectAll={selectAll}
            />
            
            {/* Stats Overview */}
            <StatsOverview filteredData={filteredData} />
            
            {/* Charts Grid */}
            <ChartGrid 
              chartData={chartData}
              onChartClick={handleChartClick}
            />
            
            {/* Data Table */}
            <DataTable data={filteredData} />
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Dashboard de Análisis de Servicios - v1.0.0
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;