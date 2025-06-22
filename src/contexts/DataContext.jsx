// src/contexts/DataContext.js - Contexto especializado para manejo de datos Excel
import React, { createContext, useContext } from 'react';
import { useExcelData } from '../hooks/useExcelData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Usar el hook existente para manejo de datos Excel
  const dataState = useExcelData();

  return (
    <DataContext.Provider value={dataState}>
      {children}
    </DataContext.Provider>
  );
};