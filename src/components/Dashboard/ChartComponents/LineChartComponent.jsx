import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ data, title, nameKey = "periodo" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }
  
  // Determinar si estamos mostrando días o meses para optimizar la visualización
  const esDia = title.toLowerCase().includes('día');
  
  // Formatear etiquetas según si son días o meses
  const formatearEtiqueta = (valor) => {
    if (!valor) return '';
    
    try {
      // Para fechas en formato YYYY-MM-DD o YYYY-MM
      const partes = valor.split('-');
      
      if (esDia && partes.length === 3) {
        // Formato día: DD/MM
        return `${partes[2]}/${partes[1]}`;
      } else if (partes.length >= 2) {
        // Formato mes: MM/YYYY
        return `${partes[1]}/${partes[0]}`;
      }
      
      return valor;
    } catch (e) {
      return valor;
    }
  };
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ 
              top: 5, 
              right: 30, 
              left: 20, 
              bottom: 60 // Margen amplio para etiquetas rotadas
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={nameKey}
              angle={-45} // Rotar etiquetas
              textAnchor="end" // Alinear el texto al final
              height={60} // Aumentar espacio para etiquetas
              tick={{ fontSize: 11 }} // Tamaño de fuente ajustado
              interval={0} // Mostrar TODAS las etiquetas siempre, especialmente para días
              tickFormatter={formatearEtiqueta} // Formato personalizado para etiquetas
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'cantidad') {
                  return [`${value} servicios`, 'Cantidad'];
                } else if (name === 'costoTotal') {
                  // Eliminar decimales y mantener el símbolo $
                  return [`$${Math.round(value).toLocaleString('es-MX')}`, 'Costo Total'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `${esDia ? 'Día' : 'Mes'}: ${formatearEtiqueta(label)}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cantidad" 
              name="Cantidad de Servicios"
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }}
              dot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: '#8884d8',
                fill: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="costoTotal" 
              name="Costo Total"
              stroke="#82ca9d" 
              strokeWidth={2}
              activeDot={{ r: 8, stroke: '#82ca9d', strokeWidth: 2, fill: '#fff' }}
              dot={false}
              yAxisId="right"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickFormatter={(value) => {
                return new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;