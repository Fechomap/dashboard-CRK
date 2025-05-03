import { useState } from 'react';
import * as XLSX from 'xlsx';
import { procesarDatosExcel } from '../utils/excelProcessor';

export const useExcelData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
            cellDates: true 
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
          setData(datosTransformados);
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

  return {
    data,
    loading,
    error,
    handleFileUpload
  };
};