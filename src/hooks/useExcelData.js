import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { procesarDatosExcel } from '../utils/excelProcessor';

export const useExcelData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // Cargar datos desde sessionStorage
  useEffect(() => {
    try {
      const savedFileName = sessionStorage.getItem('dashboardFileName');
      
      if (savedFileName) {
        setFileName(savedFileName);
        setLoading(true);
        
        // Intentar cargar el archivo desde sessionStorage
        const totalChunks = parseInt(sessionStorage.getItem('dashboardTotalChunks') || '0');
        
        if (totalChunks > 0) {
          let allData = [];
          
          for (let i = 0; i < totalChunks; i++) {
            const chunk = sessionStorage.getItem(`dashboardData_chunk_${i}`);
            if (chunk) {
              const parsedChunk = JSON.parse(chunk);
              allData = [...allData, ...parsedChunk];
            }
          }
          
          // Convertir las fechas de string a Date adecuadamente
          const processedData = allData.map(item => {
            // Crear nuevas fechas a partir de los strings ISO
            const fechaReg = item.fechaRegistro ? new Date(item.fechaRegistro) : null;
            const fechaAsig = item.fechaAsignacion ? new Date(item.fechaAsignacion) : null;
            
            // Verificar que las fechas sean válidas
            const validFechaReg = fechaReg && !isNaN(fechaReg.getTime()) ? fechaReg : null;
            const validFechaAsig = fechaAsig && !isNaN(fechaAsig.getTime()) ? fechaAsig : null;
            
            return {
              ...item,
              fechaRegistro: validFechaReg,
              fechaAsignacion: validFechaAsig
            };
          });
          
          // Log para depuración
          console.log('Datos cargados desde sessionStorage:', {
            totalRegistros: processedData.length,
            ejemploFechaRegistro: processedData[0]?.fechaRegistro instanceof Date ? 
              processedData[0].fechaRegistro.toISOString() : 'No es una fecha válida'
          });
          
          setData(processedData);
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
          
          // Preparar datos para almacenamiento
          const dataForStorage = datosTransformados.map(item => ({
            ...item,
            // Guardar las fechas como strings ISO
            fechaRegistro: item.fechaRegistro instanceof Date ? 
              item.fechaRegistro.toISOString() : null,
            fechaAsignacion: item.fechaAsignacion instanceof Date ? 
              item.fechaAsignacion.toISOString() : null
          }));
          
          // Guardar en chunks de 100 elementos
          const chunkSize = 100;
          const chunks = [];
          
          for (let i = 0; i < dataForStorage.length; i += chunkSize) {
            chunks.push(dataForStorage.slice(i, i + chunkSize));
          }
          
          // Limpiar storage anterior
          clearData();
          
          // Guardar cada chunk
          chunks.forEach((chunk, index) => {
            try {
              sessionStorage.setItem(`dashboardData_chunk_${index}`, JSON.stringify(chunk));
            } catch (storageError) {
              console.error(`Error al guardar chunk ${index}:`, storageError);
            }
          });
          
          // Guardar metadatos
          sessionStorage.setItem('dashboardTotalChunks', chunks.length.toString());
          sessionStorage.setItem('dashboardFileName', file.name);
          
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
    
    // Limpiar todos los chunks
    const totalChunks = parseInt(sessionStorage.getItem('dashboardTotalChunks') || '0');
    for (let i = 0; i < totalChunks; i++) {
      sessionStorage.removeItem(`dashboardData_chunk_${i}`);
    }
    
    sessionStorage.removeItem('dashboardTotalChunks');
    sessionStorage.removeItem('dashboardFileName');
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