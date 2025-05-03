import React, { useEffect, useRef } from 'react';
import LineChartComponent from './ChartComponents/LineChartComponent';
import BarChartComponent from './ChartComponents/BarChartComponent';
import PieChartComponent from './ChartComponents/PieChartComponent';
import { useDashboard } from '../../context/DashboardContext';

const ChartGrid = ({ chartData, onChartClick }) => {
  // Obtener el título dinámico de la gráfica de tiempo (puede ser "Servicios por Mes" o "Servicios por Día")
  const tituloGraficaTiempo = chartData.tituloGraficaTiempo || "Servicios por Mes";
  
  // Referencias para el exportador PDF
  const lineChartRef = useRef(null);
  const operatorChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const unitChartRef = useRef(null);
  const clientChartRef = useRef(null);
  const hourChartRef = useRef(null);
  
  // Obtener la función del contexto para registrar referencias
  const { chartRefs } = useDashboard();
  
  // Registrar referencias para exportación
  useEffect(() => {
    // Actualizar referencias en el contexto
    if (chartRefs) {
      chartRefs.lineChart = lineChartRef;
      chartRefs.operatorChart = operatorChartRef;
      chartRefs.statusChart = statusChartRef;
      chartRefs.unitChart = unitChartRef;
      chartRefs.clientChart = clientChartRef;
      chartRefs.hourChart = hourChartRef;
    }
  }, [chartRefs]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Services by Period (Day or Month) - Ocupa 2 columnas */}
      <div className="col-span-1 md:col-span-2" ref={lineChartRef}>
        <LineChartComponent 
          data={chartData.serviciosPorPeriodo}
          title={tituloGraficaTiempo}
          nameKey="periodo"
        />
      </div>
      
      {/* Services by Operator */}
      <div ref={operatorChartRef}>
        <BarChartComponent 
          data={chartData.serviciosPorOperador}
          title="Servicios por Operador (Top 10)"
          nameKey="operador"
          vertical={true}
          color="#8884d8"
          onClick={(data) => onChartClick('operador', data)}
        />
      </div>
      
      {/* Services by Status */}
      <div ref={statusChartRef}>
        <PieChartComponent 
          data={chartData.serviciosPorEstatus}
          title="Servicios por Estatus"
          nameKey="estatus"
          onClick={(data) => onChartClick('estatus', data)}
        />
      </div>
      
      {/* Services by Operational Unit */}
      <div ref={unitChartRef}>
        <BarChartComponent 
          data={chartData.serviciosPorUnidad}
          title="Servicios por Unidad Operativa"
          nameKey="unidad"
          color="#82ca9d"
        />
      </div>
      
      {/* Services by Client */}
      <div ref={clientChartRef}>
        <BarChartComponent 
          data={chartData.serviciosPorCliente}
          title="Servicios por Cliente"
          nameKey="cliente"
          color="#FF8042"
          vertical={true}
          onClick={(data) => onChartClick('cliente', data)}
        />
      </div>
      
      {/* 24-hour distribution */}
      <div className="col-span-1 md:col-span-2" ref={hourChartRef}>
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