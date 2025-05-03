// src/services/PDFExportService.js
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

class PDFExportService {
  /**
   * Exporta los gráficos y estadísticas del dashboard a un archivo PDF
   * @param {Object} options - Opciones de exportación
   * @param {Array} options.charts - Lista de referencias a elementos DOM de gráficos
   * @param {Object} options.stats - Datos estadísticos
   * @param {string} options.filename - Nombre del archivo de salida
   * @param {Object} options.filters - Filtros aplicados
   * @param {string} options.fileName - Nombre del archivo Excel original
   */
  static async exportToPDF({
    charts,
    stats,
    filename = 'dashboard-report.pdf',
    filters,
    fileName
  }) {
    try {
      // Crear nuevo documento PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Configuración de página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // margen en mm
      const contentWidth = pageWidth - (margin * 2);
      
      // Posición Y actual (comenzando después del margen superior)
      let yPos = margin;
      
      // Dibujar encabezado
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dashboard de Análisis de Servicios', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Añadir información del archivo y filtros
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (fileName) {
        pdf.text(`Archivo: ${fileName}`, margin, yPos);
        yPos += 6;
      }
      
      // Añadir información de filtros
      if (filters) {
        let filtrosTexto = 'Filtros aplicados: ';
        
        if (filters.fechaInicio || filters.fechaFin) {
          filtrosTexto += `Período: ${filters.fechaInicio || 'inicio'} al ${filters.fechaFin || 'fin'}`;
        }
        
        if (filters.operador && filters.operador.length > 0) {
          filtrosTexto += `, Operadores: ${filters.operador.length} seleccionados`;
        }
        
        if (filters.estatus && filters.estatus.length > 0) {
          filtrosTexto += `, Estatus: ${filters.estatus.join(', ')}`;
        }
        
        pdf.text(filtrosTexto, margin, yPos, {
          maxWidth: contentWidth
        });
        yPos += 10;
      }
      
      // Añadir fecha de generación
      const fechaActual = new Date().toLocaleString('es-MX');
      pdf.text(`Reporte generado: ${fechaActual}`, margin, yPos);
      yPos += 8;
      
      // Añadir estadísticas en una tabla
      if (stats) {
        yPos += 5;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estadísticas Generales', margin, yPos);
        yPos += 6;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        // Crear tabla de estadísticas
        const statsData = [
          ['Total de Servicios', stats.totalServices.toString()],
          ['Servicios Concluidos', stats.completedServices.toString()],
          ['Costo Total', `$${stats.totalCost.toLocaleString('es-MX')}`],
          ['Promedio Costo Total', `$${stats.averageCost.toLocaleString('es-MX')}`],
          ['Operadores Activos', stats.activeOperators.toString()]
        ];
        
        // Configuración de tabla
        const cellPadding = 2;
        const cellWidth = [contentWidth * 0.7, contentWidth * 0.3];
        const cellHeight = 8;
        
        // Dibujar filas
        statsData.forEach((row, rowIndex) => {
          // Alternar color de fondo
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(240, 240, 240);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          
          // Dibujar rectangulo de fondo
          pdf.rect(
            margin, 
            yPos, 
            cellWidth[0] + cellWidth[1], 
            cellHeight, 
            'F'
          );
          
          // Texto
          pdf.text(row[0], margin + cellPadding, yPos + cellHeight/2 + 1);
          pdf.text(row[1], margin + cellWidth[0] - cellPadding, yPos + cellHeight/2 + 1, {
            align: 'right'
          });
          
          yPos += cellHeight;
        });
        
        yPos += 10; // Espacio después de la tabla
      }
      
      // Procesar cada gráfico
      if (charts && charts.length > 0) {
        // Añadir título para la sección de gráficos
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Gráficas', margin, yPos);
        yPos += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        for (let i = 0; i < charts.length; i++) {
          const chart = charts[i];
          if (!chart) continue;
          
          // Verificar si necesitamos una nueva página
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = margin;
          }
          
          try {
            // Convertir gráfico a canvas
            const canvas = await html2canvas(chart, {
              scale: 2, // Mayor escala para mejor calidad
              logging: false,
              useCORS: true
            });
            
            // Obtener datos de imagen
            const imgData = canvas.toDataURL('image/png');
            
            // Calcular la altura proporcional para mantener la relación de aspecto
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Comprobar si la imagen cabe en la página actual
            if (yPos + imgHeight > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }
            
            // Añadir imagen al PDF
            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            
            // Actualizar posición Y para el siguiente elemento
            yPos += imgHeight + 10;
          } catch (error) {
            console.error(`Error al procesar gráfico ${i}:`, error);
          }
        }
      }
      
      // Añadir pie de página
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
      
      // Guardar el PDF
      pdf.save(filename);
      
      return true;
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw new Error(`Error al exportar a PDF: ${error.message}`);
    }
  }
}

export default PDFExportService;