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
      
      {/* Services by Client - Nueva gráfica */}
      <BarChartComponent 
        data={chartData.serviciosPorCliente}
        title="Servicios por Cliente"
        nameKey="cliente"
        color="#FF8042"
        vertical={true}
        onClick={(data) => onChartClick('cliente', data)}
      />
      
      {/* Response Times */}
      <BarChartComponent 
        data={chartData.tiemposDeAtencion}
        title="Tiempos de Atención"
        nameKey="rango"
        color="#ffc658"
      />
    </div>
  );
};

export default ChartGrid;