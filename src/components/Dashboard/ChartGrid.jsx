import React from 'react';
import LineChartComponent from './ChartComponents/LineChartComponent';
import BarChartComponent from './ChartComponents/BarChartComponent';
import PieChartComponent from './ChartComponents/PieChartComponent';

const ChartGrid = ({ chartData, onChartClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Services by Month */}
      <LineChartComponent 
        data={chartData.serviciosPorMes}
        title="Servicios por Mes"
      />
      
      {/* Services by Operator */}
      <BarChartComponent 
        data={chartData.serviciosPorOperador}
        title="Servicios por Operador (Top 10)"
        nameKey="operador"
        vertical={true}
        color="#8884d8"
        onClick={(data) => onChartClick('operador', data)}
      />
      
      {/* Services by Operational Unit */}
      <BarChartComponent 
        data={chartData.serviciosPorUnidad}
        title="Servicios por Unidad Operativa"
        nameKey="unidad"
        color="#82ca9d"
      />
      
      {/* Services by Status */}
      <PieChartComponent 
        data={chartData.serviciosPorEstatus}
        title="Servicios por Estatus"
        nameKey="estatus"
        onClick={(data) => onChartClick('estatus', data)}
      />
      
      {/* Services by Client */}
      <BarChartComponent 
        data={chartData.serviciosPorCliente}
        title="Servicios por Cliente"
        nameKey="cliente"
        color="#FF8042"
        vertical={true}
        onClick={(data) => onChartClick('cliente', data)}
      />
      
      {/* NUEVA GRÁFICA: 24-hour distribution */}
      <div className="col-span-1 md:col-span-2">
        <BarChartComponent 
          data={chartData.serviciosPorHora}
          title="Distribución de Contactos por Hora del Día"
          nameKey="hora"
          dataKey="cantidad"
          color="#ffc658"
        />
      </div>
    </div>
  );
};

export default ChartGrid;