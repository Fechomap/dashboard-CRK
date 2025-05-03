import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const AnalyticsAssistant = () => {
  const { 
    filteredData, 
    chartData, 
    filters, 
    fileName 
  } = useDashboard();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  
  // Generar insights cuando cambian los datos o filtros
  useEffect(() => {
    if (isOpen && filteredData.length > 0) {
      generateInsights();
    }
  }, [isOpen, filteredData, filters]);
  
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen && insights.length === 0) {
      generateInsights();
    }
  };
  
  const generateInsights = () => {
    setIsLoading(true);
    
    // Simulamos un tiempo de procesamiento para el análisis
    setTimeout(() => {
      const newInsights = analyzeData();
      setInsights(newInsights);
      setIsLoading(false);
    }, 1000);
  };
  
  // Función principal de análisis
  const analyzeData = () => {
    const insights = [];
    
    try {
      // 1. Análisis de tendencia temporal
      if (chartData.serviciosPorPeriodo && chartData.serviciosPorPeriodo.length > 0) {
        const periodos = [...chartData.serviciosPorPeriodo];
        
        if (periodos.length > 1) {
          // Determinar tendencia
          const primeros = periodos.slice(0, Math.ceil(periodos.length / 2));
          const ultimos = periodos.slice(Math.ceil(periodos.length / 2));
          
          const promedioInicial = primeros.reduce((sum, item) => sum + item.cantidad, 0) / primeros.length;
          const promedioFinal = ultimos.reduce((sum, item) => sum + item.cantidad, 0) / ultimos.length;
          
          const cambio = ((promedioFinal - promedioInicial) / promedioInicial) * 100;
          
          let tendencia = '';
          if (cambio > 10) {
            tendencia = 'crecimiento significativo';
          } else if (cambio > 5) {
            tendencia = 'ligero crecimiento';
          } else if (cambio < -10) {
            tendencia = 'disminución significativa';
          } else if (cambio < -5) {
            tendencia = 'ligera disminución';
          } else {
            tendencia = 'estabilidad';
          }
          
          insights.push({
            title: 'Tendencia Temporal',
            content: `Los servicios muestran una ${tendencia} del ${Math.abs(cambio).toFixed(1)}% en el período analizado. ${
              cambio > 0 
                ? 'Es recomendable evaluar los factores que han contribuido a este incremento para potenciarlos.' 
                : cambio < 0 
                  ? 'Es importante identificar y abordar los factores que han contribuido a esta disminución.' 
                  : 'Esta estabilidad puede ser una buena base para planificar crecimiento futuro.'
            }`
          });
          
          // Identificar pico y valle
          const maximo = Math.max(...periodos.map(p => p.cantidad));
          const minimo = Math.min(...periodos.map(p => p.cantidad));
          
          const periodoMaximo = periodos.find(p => p.cantidad === maximo)?.periodo || '';
          const periodoMinimo = periodos.find(p => p.cantidad === minimo)?.periodo || '';
          
          if (periodoMaximo && periodoMinimo) {
            insights.push({
              title: 'Picos y Valles',
              content: `El período con mayor actividad fue ${formatPeriodo(periodoMaximo)} con ${maximo} servicios, mientras que ${formatPeriodo(periodoMinimo)} presentó la menor actividad con ${minimo} servicios. Analizar los factores específicos de estos períodos puede ayudar a entender los patrones de demanda.`
            });
          }
        }
      }
      
      // 2. Análisis de operadores
      if (chartData.serviciosPorOperador && chartData.serviciosPorOperador.length > 0) {
        const operadores = [...chartData.serviciosPorOperador];
        
        if (operadores.length > 1) {
          // Top operadores
          const topOperadores = operadores.slice(0, Math.min(3, operadores.length));
          
          // Análisis de distribución de carga
          const totalServicios = operadores.reduce((sum, op) => sum + op.cantidad, 0);
          const porcentajeTop = (topOperadores.reduce((sum, op) => sum + op.cantidad, 0) / totalServicios) * 100;
          
          insights.push({
            title: 'Análisis de Operadores',
            content: `Los 3 operadores principales (${topOperadores.map(op => op.operador).join(', ')}) manejan el ${porcentajeTop.toFixed(1)}% de los servicios. ${
              porcentajeTop > 70 
                ? 'Existe una alta concentración de carga, lo que podría indicar un riesgo operativo. Considere redistribuir la carga o capacitar a más operadores.' 
                : porcentajeTop > 50 
                  ? 'La distribución de carga es moderada. Se recomienda revisar la capacidad de cada operador para optimizar el rendimiento.' 
                  : 'La carga de trabajo está bien distribuida entre los operadores, lo que reduce riesgos operativos.'
            }`
          });
          
          // Identificar operadores que podrían necesitar apoyo
          if (topOperadores[0].cantidad > topOperadores[1].cantidad * 1.5) {
            insights.push({
              title: 'Sobrecarga de Operadores',
              content: `El operador ${topOperadores[0].operador} está manejando una cantidad desproporcionada de servicios. Considere revisar su carga de trabajo y posiblemente redistribuir tareas para evitar saturación y garantizar la calidad de servicio.`
            });
          }
        }
      }
      
      // 3. Análisis de estatus
      if (chartData.serviciosPorEstatus && chartData.serviciosPorEstatus.length > 0) {
        const estatusData = [...chartData.serviciosPorEstatus];
        
        // Buscar tasa de conclusión
        const concluidos = estatusData.find(e => e.estatus === 'Concluido' || e.estatus.toLowerCase().includes('conclu'));
        const cancelados = estatusData.find(e => e.estatus === 'Cancelado' || e.estatus.toLowerCase().includes('cancel'));
        
        if (concluidos && cancelados) {
          const totalRelevante = concluidos.cantidad + cancelados.cantidad;
          const tasaConclusion = (concluidos.cantidad / totalRelevante) * 100;
          
          insights.push({
            title: 'Tasa de Conclusión',
            content: `La tasa de conclusión de servicios es del ${tasaConclusion.toFixed(1)}%. ${
              tasaConclusion > 90 
                ? 'Este es un excelente indicador de eficiencia operativa.' 
                : tasaConclusion > 75 
                  ? 'Este es un buen rendimiento, pero hay margen de mejora. Considere analizar los motivos de cancelación más frecuentes.' 
                  : 'Esta tasa sugiere problemas en el proceso de servicio. Es urgente identificar las causas principales de cancelación y abordarlas.'
            }`
          });
        }
      }
      
      // 4. Análisis de distribución horaria
      if (chartData.serviciosPorHora && chartData.serviciosPorHora.length > 0) {
        const horasData = [...chartData.serviciosPorHora];
        
        // Identificar horas pico y horas valle
        const horasOrdenadas = [...horasData].sort((a, b) => b.cantidad - a.cantidad);
        const horasPico = horasOrdenadas.slice(0, 3);
        const horasValle = [...horasOrdenadas].reverse().slice(0, 3);
        
        insights.push({
          title: 'Distribución Horaria',
          content: `Las horas de mayor actividad son ${horasPico.map(h => h.hora).join(', ')} con un promedio de ${
            (horasPico.reduce((sum, h) => sum + h.cantidad, 0) / horasPico.length).toFixed(1)
          } servicios. Las horas de menor actividad son ${horasValle.map(h => h.hora).join(', ')}. Se recomienda reforzar el personal durante las horas pico y considerar capacitación o tareas administrativas durante las horas valle.`
        });
        
        // Identificar bloques de alta demanda
        let bloqueMañana = 0;
        let bloqueTarde = 0;
        let bloqueNoche = 0;
        
        horasData.forEach(h => {
          const hora = parseInt(h.hora.split(':')[0]);
          if (hora >= 6 && hora < 12) bloqueMañana += h.cantidad;
          else if (hora >= 12 && hora < 18) bloqueTarde += h.cantidad;
          else bloqueNoche += h.cantidad;
        });
        
        const totalServicios = bloqueMañana + bloqueTarde + bloqueNoche;
        const porcentajeMañana = (bloqueMañana / totalServicios) * 100;
        const porcentajeTarde = (bloqueTarde / totalServicios) * 100;
        const porcentajeNoche = (bloqueNoche / totalServicios) * 100;
        
        let bloqueMaximo = 'tarde';
        let porcentajeMaximo = porcentajeTarde;
        
        if (porcentajeMañana > porcentajeTarde && porcentajeMañana > porcentajeNoche) {
          bloqueMaximo = 'mañana';
          porcentajeMaximo = porcentajeMañana;
        } else if (porcentajeNoche > porcentajeTarde && porcentajeNoche > porcentajeMañana) {
          bloqueMaximo = 'noche';
          porcentajeMaximo = porcentajeNoche;
        }
        
        insights.push({
          title: 'Bloques Horarios',
          content: `El bloque de ${bloqueMaximo} concentra el ${porcentajeMaximo.toFixed(1)}% de la actividad. La distribución es: mañana (6-12h): ${porcentajeMañana.toFixed(1)}%, tarde (12-18h): ${porcentajeTarde.toFixed(1)}%, noche (18-6h): ${porcentajeNoche.toFixed(1)}%. Ajuste su programación de personal para alinearse con esta distribución.`
        });
      }
      
      // 5. Análisis de unidades operativas
      if (chartData.serviciosPorUnidad && chartData.serviciosPorUnidad.length > 0) {
        const unidades = [...chartData.serviciosPorUnidad];
        
        if (unidades.length > 1) {
          // Top unidades
          const topUnidades = unidades.slice(0, Math.min(3, unidades.length));
          
          // Unidades con menor rendimiento
          const unidadesBajo = [...unidades].sort((a, b) => a.cantidad - b.cantidad).slice(0, Math.min(2, unidades.length));
          
          insights.push({
            title: 'Rendimiento por Unidad Operativa',
            content: `Las unidades más activas son ${topUnidades.map(u => u.unidad).join(', ')}, mientras que ${unidadesBajo.map(u => u.unidad).join(', ')} muestran menor actividad. Evalúe si esta distribución se alinea con sus expectativas o si se requieren ajustes en la asignación de recursos.`
          });
        }
      }
      
      // 6. Recomendaciones generales basadas en el análisis
      insights.push({
        title: 'Recomendaciones',
        content: `
          1. Establezca metas de crecimiento basadas en la tendencia actual y en los picos históricos identificados.
          2. Revise la distribución de carga entre operadores para optimizar la eficiencia y evitar sobrecarga.
          3. Ajuste la programación de personal según la distribución horaria para maximizar la cobertura en horas pico.
          4. Evalúe el rendimiento por unidad operativa y considere redistribuir recursos si es necesario.
          5. Implemente un seguimiento regular de estos indicadores para identificar cambios en patrones y tendencias.
        `
      });
      
    } catch (error) {
      console.error("Error al analizar datos:", error);
      insights.push({
        title: 'Error de Análisis',
        content: 'No se pudieron analizar los datos correctamente. Por favor, verifique que los datos cargados sean válidos e intente nuevamente.'
      });
    }
    
    return insights;
  };
  
  const formatPeriodo = (periodo) => {
    if (!periodo) return '';
    
    // Si es formato YYYY-MM-DD
    if (periodo.length === 10 && periodo.includes('-')) {
      const [año, mes, dia] = periodo.split('-');
      return `${dia}/${mes}/${año}`;
    }
    
    // Si es formato YYYY-MM
    if (periodo.length === 7 && periodo.includes('-')) {
      const [año, mes] = periodo.split('-');
      const nombresMeses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      return `${nombresMeses[parseInt(mes) - 1]} de ${año}`;
    }
    
    return periodo;
  };
  
  if (!isOpen) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <Button 
          variant="primary" 
          onClick={toggleAssistant}
          className="flex items-center shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Asistente Analítico
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Asistente Analítico</h2>
          <button 
            onClick={toggleAssistant}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <LoadingSpinner message="Analizando datos..." />
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No hay datos disponibles para analizar.</p>
              <p className="text-gray-400 mt-2">Cargue un archivo Excel y aplique filtros para obtener insights.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Análisis basado en {filteredData.length} registros 
                  {fileName && ` de "${fileName}"`}
                  {filters.fechaInicio && ` desde ${filters.fechaInicio}`}
                  {filters.fechaFin && ` hasta ${filters.fechaFin}`}.
                </p>
              </div>
              
              <div className="space-y-6">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">{insight.title}</h3>
                    <p className="text-gray-700 whitespace-pre-line">{insight.content}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <Button 
            variant="secondary" 
            onClick={toggleAssistant}
          >
            Cerrar
          </Button>
          <Button 
            variant="primary" 
            onClick={generateInsights}
            disabled={isLoading || filteredData.length === 0}
          >
            Actualizar Análisis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAssistant;