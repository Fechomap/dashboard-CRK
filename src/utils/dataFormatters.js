// Formatear fecha para mostrar
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    console.warn('Error al formatear fecha:', e);
    return '';
  }
};

// Formatear número con separador de miles
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  try {
    return number.toLocaleString('es-MX');
  } catch (e) {
    return '0';
  }
};