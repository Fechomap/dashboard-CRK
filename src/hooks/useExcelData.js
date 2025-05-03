// src/hooks/useExcelData.js
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { procesarDatosExcel } from '../utils/excelProcessor';
import DataService from '../services/DataService';

const STORAGE_KEY = 'dashboard';

export const useExcelData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // Cargar datos desde sessionStorage al iniciar
  useEffect(() => {
    try {
      const savedFileName = sessionStorage.getItem(`${STORAGE_KEY}FileName`);
      
      if (savedFileName) {
        setFileName(savedFileName);
        setLoading(true);
        
        const loadedData = DataService.loadFromStorage(STORAGE_KEY);
        
        if (loadedData.length > 0) {
          // Log para depuración
          console.log('Datos cargados desde sessionStorage:', {
            totalRegistros: loadedData.length,
            ejemploFechaRegistro: loadedData[0]?.fechaRegistro instanceof Date ? 
              loadedData[0].fechaRegistro.toISOString() : 'No es una fecha válida'
          });
          
          setData(loadedData);
        }
        
        setLoading(false);
      }
    } catch (e) {
      console.error('Error al cargar datos guardados:', e);
      clearData();
      setLoading(false);
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError('Por favor selecciona un archivo Excel válido (.xlsx, .xls)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { 
            type: 'binary',
            cellDates: true  // Importante para manejar fechas correctamente
          });
          
          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('El archivo Excel está vacío o corrupto');
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });
          
          if (!jsonData || jsonData.length === 0) {
            throw new Error('No se encontraron datos en el archivo');
          }
          
          // Procesar datos
          const datosTransformados = procesarDatosExcel(jsonData);
          
          // Log para depuración de fechas
          if (datosTransformados.length > 0) {
            console.log('Ejemplo de fecha procesada:', {
              original: jsonData[0]?.fechaRegistro,
              procesada: datosTransformados[0]?.fechaRegistro instanceof Date ? 
                datosTransformados[0].fechaRegistro.toISOString() : 'No es una fecha'
            });
          }
          
          // Limpiar storage anterior
          DataService.clearStorage(STORAGE_KEY);
          
          // Guardar datos en sessionStorage
          DataService.saveToStorage(datosTransformados, STORAGE_KEY);
          
          // Guardar nombre del archivo
          sessionStorage.setItem(`${STORAGE_KEY}FileName`, file.name);
          
          setData(datosTransformados);
          setFileName(file.name);
          setLoading(false);
        } catch (err) {
          console.error('Error al procesar archivo:', err);
          setError(`Error al procesar el archivo: ${err.message}`);
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
        setLoading(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (e) {
      console.error('Error al iniciar lectura:', e);
      setError('Error al leer el archivo');
      setLoading(false);
    }
  };

  // Función para eliminar los datos y el archivo
  const clearData = () => {
    setData([]);
    setFileName('');
    
    // Limpiar storage
    DataService.clearStorage(STORAGE_KEY);
    sessionStorage.removeItem(`${STORAGE_KEY}FileName`);
  };

  return {
    data,
    loading,
    error,
    fileName,
    handleFileUpload,
    clearData
  };
};