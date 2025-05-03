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
  // Determinar si estamos mostrando la gráfica de 24 horas
  const is24HourChart = title === "Distribución de Contactos por Hora del Día";
  
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
  
  // Aumentar la altura para la gráfica de 24 horas
  const chartHeight = is24HourChart ? 400 : 240;
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className={`${is24HourChart ? 'h-96' : 'h-64'}`}>
        <ResponsiveContainer width="100%" height="100%">
          {vertical ? (
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey={nameKey} 
                type="category" 
                width={150} 
                tick={{ fontSize: 10 }}
                // Ajuste especial para la gráfica de 24 horas
                interval={is24HourChart ? 0 : 'preserveStartEnd'}
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
                // Aumentar el margen inferior si es la gráfica de 24 horas para dar más espacio a las etiquetas
                bottom: is24HourChart ? 20 : 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={nameKey} 
                // Ajustes específicos para la gráfica de 24 horas
                angle={is24HourChart ? -45 : 0}
                textAnchor={is24HourChart ? "end" : "middle"}
                height={is24HourChart ? 60 : 30}
                tick={{ fontSize: is24HourChart ? 10 : 12 }}
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