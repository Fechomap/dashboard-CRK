// src/services/OpenAIService.js

/**
 * Servicio para interactuar con la API de OpenAI (ChatGPT)
 */
class OpenAIService {
  /**
   * URL base de la API de OpenAI
   */
  static API_URL = 'https://api.openai.com/v1/chat/completions';
  
  /**
   * Modelo a utilizar (GPT-4-Turbo por defecto para análisis avanzado)
   */
  static MODEL = 'gpt-4-turbo-preview';
  
  /**
   * Obtiene la API key desde variables de entorno
   * @returns {string} API key
   */
  static getApiKey() {
    // Primero intenta obtener la API key desde el localStorage (no recomendado para producción)
    const apiKey = localStorage.getItem('openai_api_key');
    
    // Para entornos de producción, es mejor usar variables de entorno
    // const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key de OpenAI no configurada');
    }
    
    return apiKey;
  }
  
  /**
   * Guarda la API key en localStorage
   * @param {string} apiKey - API key de OpenAI
   * @returns {boolean} - Éxito de la operación
   */
  static saveApiKey(apiKey) {
    if (!apiKey) return false;
    
    try {
      localStorage.setItem('openai_api_key', apiKey);
      return true;
    } catch (error) {
      console.error('Error al guardar API key:', error);
      return false;
    }
  }
  
  /**
   * Verifica si la API key está configurada
   * @returns {boolean} - true si la API key está configurada
   */
  static isConfigured() {
    try {
      const apiKey = this.getApiKey();
      return !!apiKey;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Genera un análisis crítico basado en los datos del dashboard
   * @param {Object} dashboardData - Datos del dashboard para analizar
   * @returns {Promise<Object>} - Análisis generado por ChatGPT
   */
  static async generateCriticalAnalysis(dashboardData) {
    try {
      const apiKey = this.getApiKey();
      
      // Generar el prompt para ChatGPT
      const prompt = this.buildAnalysisPrompt(dashboardData);
      
      // Realizar la solicitud a la API
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: "system",
              content: "Eres un analista de datos experto especializado en análisis operativo y de tendencias. Tu trabajo es proporcionar análisis crítico profesional y detallado basado en datos de dashboards operativos. Sé directo, honesto y constructivo en tus críticas, destacando áreas de preocupación y recomendando acciones correctivas específicas. Usa un tono profesional y ejecutivo."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 3500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en API de OpenAI: ${errorData.error?.message || 'Error desconocido'}`);
      }
      
      const data = await response.json();
      
      // Procesar la respuesta y convertirla al formato esperado
      return this.processResponse(data.choices[0].message.content);
      
    } catch (error) {
      console.error('Error al generar análisis crítico:', error);
      throw error;
    }
  }
  
  /**
   * Procesa la respuesta de ChatGPT y la convierte al formato esperado
   * @param {string} responseText - Texto de respuesta de ChatGPT
   * @returns {Object} - Análisis estructurado
   */
  static processResponse(responseText) {
    try {
      // Extraer solo el JSON de la respuesta (eliminar cualquier texto explicativo)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      // Parsear el JSON
      const analysisData = JSON.parse(jsonString);
      
      // Verificar que tenga la estructura esperada
      if (!analysisData.executive_summary || !analysisData.sections || !analysisData.conclusion) {
        throw new Error('Estructura de respuesta inválida');
      }
      
      return analysisData;
    } catch (error) {
      console.error('Error al procesar respuesta:', error);
      
      // Si hay error en el procesamiento, devolver un formato predeterminado
      return {
        executive_summary: {
          title: "Resumen del Análisis",
          content: responseText.substring(0, 300) + "..."
        },
        sections: [
          {
            title: "Análisis Detallado",
            content: responseText
          }
        ],
        conclusion: {
          title: "Conclusión",
          content: "Se ha producido un error al formatear la respuesta. Por favor, revise el análisis completo en la sección anterior."
        }
      };
    }
  }

  /**
   * Construye el prompt para el análisis crítico ejecutivo
   * @param {Object} data - Datos del dashboard
   * @returns {string} - Prompt para ChatGPT
   */
  static buildAnalysisPrompt(data) {
    const {
      filteredData,
      chartData,
      filters,
      fileName
    } = data;
    
    // Total de servicios
    const totalServicios = filteredData.length;
    
    // Calcular ingresos totales
    let costoTotal = 0;
    filteredData.forEach(item => {
      if (typeof item.costoTotal === 'number') {
        costoTotal += item.costoTotal;
      } else if (typeof item.costoTotal === 'string') {
        const costo = parseFloat(item.costoTotal.replace(/[^\d.-]/g, ''));
        if (!isNaN(costo)) {
          costoTotal += costo;
        }
      }
    });
    
    // Costo promedio por servicio
    const costoPromedio = totalServicios > 0 ? costoTotal / totalServicios : 0;
    
    // Contar por estatus
    let serviciosConcluidos = 0;
    let serviciosCancelados = 0;
    let serviciosPendientes = 0;
    
    filteredData.forEach(item => {
      const estatus = (item.estatus || '').toLowerCase();
      if (estatus.includes('conclu')) serviciosConcluidos++;
      else if (estatus.includes('cancel')) serviciosCancelados++;
      else serviciosPendientes++;
    });
    
    // Calcular tasa de conclusión
    const tasaConclusionPct = totalServicios > 0 ? (serviciosConcluidos / totalServicios) * 100 : 0;
    const tasaCancelacionPct = totalServicios > 0 ? (serviciosCancelados / totalServicios) * 100 : 0;
    
    // Obtener distribución por operador
    const distribOperadores = chartData.serviciosPorOperador 
      ? chartData.serviciosPorOperador.map(op => `${op.operador}: ${op.cantidad} servicios (${((op.cantidad/totalServicios)*100).toFixed(1)}%)`)
      : [];
    
    // Obtener distribución por unidad
    const distribUnidades = chartData.serviciosPorUnidad
      ? chartData.serviciosPorUnidad.map(u => `${u.unidad}: ${u.cantidad} servicios (${((u.cantidad/totalServicios)*100).toFixed(1)}%)`)
      : [];
    
    // Obtener distribución por hora - filtrada para horario operativo (9:00-24:00)
    const horasOperativas = chartData.serviciosPorHora
      ? chartData.serviciosPorHora.filter(h => {
          const hora = parseInt(h.hora.split(':')[0], 10);
          return hora >= 9 && hora <= 23; // Solo horas entre 9:00 y 23:00
        })
      : [];
    
    // Obtener horas pico y valle dentro del horario operativo
    const horasPico = horasOperativas.length > 0
      ? [...horasOperativas].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5).map(h => `${h.hora}: ${h.cantidad} servicios`)
      : [];
    
    const horasValle = horasOperativas.length > 0
      ? [...horasOperativas].sort((a, b) => a.cantidad - b.cantidad).slice(0, 5).map(h => `${h.hora}: ${h.cantidad} servicios`)
      : [];
    
    // Analizar tendencias temporales
    let tendenciaDesc = "No hay suficientes datos para analizar tendencias";
    if (chartData.serviciosPorPeriodo && chartData.serviciosPorPeriodo.length > 1) {
      const periodos = [...chartData.serviciosPorPeriodo];
      // Determinar tendencia
      const primeros = periodos.slice(0, Math.ceil(periodos.length / 2));
      const ultimos = periodos.slice(Math.ceil(periodos.length / 2));
      
      const promedioInicial = primeros.reduce((sum, item) => sum + item.cantidad, 0) / primeros.length;
      const promedioFinal = ultimos.reduce((sum, item) => sum + item.cantidad, 0) / ultimos.length;
      
      const cambio = ((promedioFinal - promedioInicial) / promedioInicial) * 100;
      
      tendenciaDesc = `Tendencia: ${cambio > 0 ? 'Incremento' : 'Descenso'} de ${Math.abs(cambio).toFixed(1)}% entre la primera y segunda mitad del período analizado`;
    }
    
    // Obtener fecha actual para cálculos
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    
    // Obtener días hábiles restantes en el mes
    const ultimoDiaMes = new Date(añoActual, mesActual, 0).getDate();
    const diasRestantesTotal = ultimoDiaMes - diaActual + 1;
    
    // Calcular días operativos restantes (lunes a viernes, y 2 sábados al mes)
    let diasOperativosRestantes = 0;
    let sabadosContados = 0;
    
    for (let i = diaActual; i <= ultimoDiaMes; i++) {
      const fecha = new Date(añoActual, mesActual - 1, i);
      const diaSemana = fecha.getDay(); // 0 = domingo, 1-5 = lunes a viernes, 6 = sábado
      
      if (diaSemana >= 1 && diaSemana <= 5) {
        // Lunes a viernes
        diasOperativosRestantes++;
      } else if (diaSemana === 6 && sabadosContados < 2) {
        // Sábado (máximo 2 por mes)
        diasOperativosRestantes++;
        sabadosContados++;
      }
    }
    
    // Construir el prompt completo
    return `
Actúa como un consultor analítico ejecutivo especializado en gestión de servicios, con enfoque en operaciones y optimización de ingresos. Necesito un análisis ejecutivo preciso, orientado a metas específicas y con recomendaciones accionables, basado en los datos de nuestro dashboard operativo.

CONTEXTO EMPRESARIAL ESPECÍFICO:
- Somos una empresa de servicios con una META FINANCIERA DE 600,000 PESOS MENSUALES
- Horario operativo: 9:00 AM a 12:00 AM (medianoche) exclusivamente
- Días operativos: Lunes a viernes todos, y aproximadamente 2 sábados al mes
- No operamos domingos bajo ninguna circunstancia
- Hoy es ${diaActual} de ${mesActual} de ${añoActual}
- Quedan aproximadamente ${diasOperativosRestantes} días operativos en este mes

DATOS FINANCIEROS Y OPERATIVOS:
- Total de Servicios analizados: ${totalServicios}
- Ingresos totales en el período: $${costoTotal.toLocaleString('es-MX')}
- Costo promedio por servicio: $${costoPromedio.toFixed(2).toLocaleString('es-MX')}
- Servicios Concluidos: ${serviciosConcluidos} (${tasaConclusionPct.toFixed(1)}%)
- Servicios Cancelados: ${serviciosCancelados} (${tasaCancelacionPct.toFixed(1)}%)
- Servicios Pendientes: ${serviciosPendientes}
${fileName ? `- Archivo analizado: ${fileName}` : ''}
${filters.fechaInicio ? `- Período analizado: ${filters.fechaInicio} a ${filters.fechaFin}` : ''}
- ${tendenciaDesc}

DISTRIBUCIÓN POR OPERADOR:
${distribOperadores.join('\n')}

DISTRIBUCIÓN POR UNIDAD OPERATIVA:
${distribUnidades.join('\n')}

PATRONES HORARIOS (SOLO HORAS OPERATIVAS 9AM-12AM):
Horas de mayor actividad:
${horasPico.join('\n')}

Horas de menor actividad dentro del horario operativo:
${horasValle.join('\n')}

OBJETIVOS ESPECÍFICOS DEL ANÁLISIS:
1. Calcular y recomendar el objetivo diario de ingresos necesario para alcanzar los 600,000 pesos mensuales, considerando los días operativos restantes.
2. Identificar las horas de baja actividad DENTRO del horario operativo (9AM-12AM) donde podríamos aumentar la captación de servicios.
3. Evaluar la distribución de carga entre operadores y recomendar ajustes para maximizar la productividad.
4. Proponer estrategias específicas para aumentar la tasa de conclusión de servicios.
5. Desarrollar un plan práctico y progresivo para regularizar el rendimiento y asegurar el cumplimiento de la meta mensual.

Tu análisis debe ser altamente práctico, con cálculos específicos de metas diarias/semanales y recomendaciones concretas sobre cómo aumentar la generación de ingresos en las franjas horarias más débiles dentro de nuestro horario operativo (9AM-12AM).

Estructura tu respuesta EXCLUSIVAMENTE en este formato JSON:
{
  "executive_summary": {
    "title": "Resumen Ejecutivo y Objetivos Financieros",
    "content": "Análisis de la situación actual y cálculo de metas diarias específicas para alcanzar los 600,000 pesos mensuales"
  },
  "sections": [
    {
      "title": "Proyección Financiera y Metas Diarias",
      "content": "Cálculos detallados de objetivos diarios y semanales para alcanzar la meta mensual"
    },
    {
      "title": "Análisis de Franjas Horarias y Optimización",
      "content": "Evaluación de rendimiento por hora dentro del horario operativo (9AM-12AM)"
    },
    {
      "title": "Distribución de Carga y Eficiencia Operativa",
      "content": "Análisis de la distribución del trabajo entre operadores y unidades"
    },
    {
      "title": "Estrategias para Incrementar Servicios Concluidos",
      "content": "Recomendaciones específicas para aumentar la tasa de conclusión"
    }
  ],
  "conclusion": {
    "title": "Plan de Acción Inmediato",
    "content": "Pasos específicos a implementar en las próximas 24-48 horas para regularizar el rendimiento"
  }
}

IMPORTANTE: 
- Enfócate EXCLUSIVAMENTE en el análisis de las horas entre 9AM y 12AM (medianoche) ya que son nuestras horas operativas
- Incluye cálculos específicos de cuánto debemos generar diariamente para alcanzar la meta mensual de 600,000 pesos
- Proporciona recomendaciones detalladas para las horas de baja actividad dentro del horario operativo
- Considera la tendencia actual y ajusta tus recomendaciones a la realidad de nuestros datos
- Tu respuesta debe contener EXCLUSIVAMENTE el JSON solicitado sin explicaciones adicionales
    `;
  }
}

export default OpenAIService;