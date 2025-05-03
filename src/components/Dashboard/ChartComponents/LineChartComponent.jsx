import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ data, title }) => {
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
  
  // Determinar si esta es la gráfica de Servicios por Mes
  const isMonthChart = title === "Servicios por Mes";
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className={isMonthChart ? "h-80" : "h-64"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ 
              top: 5, 
              right: 30, 
              left: 20, 
              bottom: 60 // Aumentado el margen inferior
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="mes" 
              angle={-45} // Rotar etiquetas
              textAnchor="end" // Alinear el texto al final
              height={60} // Aumentar espacio para etiquetas
              tick={{ fontSize: 12 }} // Ajustar tamaño de fuente
              interval={0} // Mostrar todas las etiquetas
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} servicios`, 'Cantidad']}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cantidad" 
              stroke="#8884d8" 
              strokeWidth={2} // Línea más gruesa
              activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }} // Punto activo más visible
              dot={{ 
                r: 4, 
                strokeWidth: 2,
                stroke: '#8884d8',
                fill: '#fff'
              }} // Hacer los puntos más visibles
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;