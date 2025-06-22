// src/contexts/DashboardProvider.js - Proveedor compuesto que combina todos los contextos especializados
import React from 'react';
import { DataProvider } from './DataContext.jsx';
import { FilterProvider } from './FilterContext.jsx';
import { ChartProvider } from './ChartContext.jsx';
import { ExportProvider } from './ExportContext.jsx';

/**
 * Proveedor compuesto que organiza todos los contextos especializados
 * en la jerarquía correcta según sus dependencias
 */
export const DashboardProvider = ({ children }) => {
  return (
    <DataProvider>
      <FilterProvider>
        <ChartProvider>
          <ExportProvider>
            {children}
          </ExportProvider>
        </ChartProvider>
      </FilterProvider>
    </DataProvider>
  );
};

// Hook de conveniencia para acceder a todos los contextos
export { useData } from './DataContext.jsx';
export { useFilterContext } from './FilterContext.jsx';
export { useChart } from './ChartContext.jsx';
export { useExport } from './ExportContext.jsx';