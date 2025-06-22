import React, { memo } from 'react';
import { formatNumber } from '../../utils/dataFormatters';

// Fragmento completo modificado - Memoizado para evitar re-renders innecesarios
const StatsCard = memo(({ title, value, color = 'blue', prefix = '' }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
  };
  
  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
  };
  
  return (
    <div className={`p-4 rounded shadow ${bgColors[color]}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-2xl font-semibold ${textColors[color]}`}>
        {/* Usar solo el prefijo sin formatNumber que añade otro $ */}
        {prefix}{Math.round(value).toLocaleString('es-MX')}
      </p>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;