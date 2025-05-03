import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ 
  data, 
  title, 
  dataKey = 'cantidad', 
  nameKey = 'unidad',
  color = '#82ca9d',
  vertical = false,
  onClick = null,
  fullWidth = false
}) => {
  // Determinar si estamos mostrando la gráfica de 24 horas o la de unidades operativas o la de operadores
  const is24HourChart = title === "Distribución de Contactos por Hora del Día";
  const isUnitChart = title === "Servicios por Unidad Operativa";
  const isOperatorChart = title === "Servicios por Operador (Top 10)";
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className={`${is24HourChart ? 'h-96' : 'h-64'} flex items-center justify-center`}>
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }
  
  // Aumentar la altura para la gráfica de 24 horas o unidades operativas
  const chartHeight = is24HourChart ? 400 : ((isUnitChart || isOperatorChart) ? 400 : 240);
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className={`${is24HourChart || isUnitChart || (isOperatorChart && vertical) ? 'h-96' : 'h-64'}`}>
        <ResponsiveContainer width="100%" height="100%">
          {vertical ? (
            <BarChart
              data={data}
              margin={isOperatorChart ? 
                { top: 5, right: 30, left: 20, bottom: 5 } : 
                { top: 5, right: 30, left: 20, bottom: 5 }
              }
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey={nameKey} 
                type="category" 
                width={isOperatorChart ? 200 : 150} // Mayor ancho para nombres largos en operadores
                tick={{ 
                  fontSize: 10,
                  width: isOperatorChart ? 180 : 140, // Permitir que el texto ocupe más espacio
                  // Para operadores, se formatea para mostrar nombre y apellido en dos líneas
                  formatter: isOperatorChart ? 
                    (value) => {
                      // Si el nombre contiene espacios, dividir en múltiples líneas
                      if (value && value.includes(' ')) {
                        const parts = value.split(' ');
                        // Agregar saltos de línea entre palabras
                        return parts.join('\n');
                      }
                      return value;
                    } : 
                    undefined
                }}
                // Ajuste para mostrar todas las etiquetas
                interval={0}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                onClick={onClick}
              />
            </BarChart>
          ) : (
            <BarChart
              data={data}
              margin={{ 
                top: 5, 
                right: 30, 
                left: 20, 
                // Aumentar el margen inferior para todas las gráficas horizontales
                bottom: 100 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={nameKey} 
                // Aplicar rotación a todas las etiquetas de gráficas horizontales
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
                interval={0} // Mostrar todas las etiquetas
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={dataKey} 
                fill={color}
                onClick={onClick}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;