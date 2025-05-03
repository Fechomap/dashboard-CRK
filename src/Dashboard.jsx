// src/Dashboard.jsx
import React, { useRef, useEffect } from 'react';

// Common Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';

// Dashboard Components
import DashboardHeader from './components/Dashboard/DashboardHeader';
import FilterPanel from './components/Dashboard/FilterPanel';
import StatsOverview from './components/Dashboard/StatsOverview';
import ChartGrid from './components/Dashboard/ChartGrid';
import DataTable from './components/Dashboard/DataTable';
import EmptyState from './components/Dashboard/EmptyState';
import AnalyticsAssistant from './components/Dashboard/AnalyticsAssistant';

// Context
import { useDashboard } from './context/DashboardContext';

const Dashboard = () => {
  const { 
    data, 
    loading, 
    error, 
    fileName, 
    filteredData,
    filterOptions,
    filters,
    chartData,
    exportLoading,
    statsRef,
    handleFileUpload, 
    clearData,
    handleCheckboxChange,
    selectAll,
    resetFilters,
    handleDateChange,
    handleQuickDateFilter,
    handleChartClick,
    exportData
  } = useDashboard();
  
  // Referencia local para las estadísticas
  const statsContainerRef = useRef(null);
  
  // Sincronizar la referencia local con el contexto
  useEffect(() => {
    if (statsRef && statsContainerRef.current) {
      statsRef.current = statsContainerRef.current;
    }
  }, [statsRef, data, filteredData]);
  
  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Cargando, por favor espere..." />
      </div>
    );
  }
  
  // Mostrar estado de error
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
        onClearData={clearData}
        fileName={fileName}
        exportLoading={exportLoading}
      />
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {data.length === 0 ? (
          <EmptyState onFileUpload={handleFileUpload} />
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
            <div ref={statsContainerRef} id="stats-overview">
              <StatsOverview filteredData={filteredData} />
            </div>
            
            {/* Charts Grid */}
            <div id="charts-container">
              <ChartGrid 
                chartData={chartData}
                onChartClick={handleChartClick}
              />
            </div>
            
            {/* Data Table */}
            <DataTable data={filteredData} />
            
            {/* Analytics Assistant */}
            <AnalyticsAssistant />
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Dashboard de Análisis de Servicios - v1.0.0
        </div>
      </footer>
      
      {/* Estilos específicos para la impresión de gráficas */}
      <style jsx="true">{`
        @media print {
          .recharts-wrapper {
            width: 100% !important;
            height: auto !important;
          }
          
          .recharts-surface {
            width: 100% !important;
            height: auto !important;
          }
          
          .recharts-legend-wrapper {
            position: relative !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;