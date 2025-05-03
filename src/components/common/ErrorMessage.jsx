import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-white p-8 rounded shadow text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <p className="text-xl mb-4">{message}</p>
      {onRetry && (
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;