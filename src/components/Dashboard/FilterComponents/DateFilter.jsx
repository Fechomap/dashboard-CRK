import React from 'react';

const DateFilter = ({ fechaInicio, fechaFin, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</label>
      <div className="flex space-x-2">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => onChange('fechaInicio', e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => onChange('fechaFin', e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default DateFilter;