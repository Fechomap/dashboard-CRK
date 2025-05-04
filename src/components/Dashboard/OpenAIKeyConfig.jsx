import React, { useState, useEffect } from 'react';
import OpenAIService from '../../services/OpenAIService';
import Button from '../common/Button';

const OpenAIKeyConfig = ({ onClose, onSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  // Verificar si la API key ya está configurada
  useEffect(() => {
    setIsConfigured(OpenAIService.isConfigured());
    
    if (OpenAIService.isConfigured()) {
      try {
        // Mostrar los últimos 4 caracteres de la API key (por seguridad)
        const key = OpenAIService.getApiKey();
        const maskedKey = `sk-...${key.slice(-4)}`;
        setApiKey(maskedKey);
      } catch (error) {
        console.error("Error al obtener API key:", error);
      }
    }
  }, []);
  
  const handleSave = () => {
    setError('');
    
    // Validar formato de API key
    if (!apiKey.startsWith('sk-') && !isConfigured) {
      setError('La API key debe comenzar con "sk-"');
      return;
    }
    
    // Si no se ha modificado la key enmascarada, no hacer nada
    if (apiKey.startsWith('sk-...') && isConfigured) {
      onClose();
      return;
    }
    
    try {
      const success = OpenAIService.saveApiKey(apiKey);
      
      if (success) {
        setIsConfigured(true);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError('Error al guardar la API key');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };
  
  const handleClear = () => {
    try {
      localStorage.removeItem('openai_api_key');
      setApiKey('');
      setIsConfigured(false);
    } catch (error) {
      setError(`Error al eliminar la API key: ${error.message}`);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Configuración de OpenAI API</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 text-sm mb-4">
          Para utilizar el análisis avanzado con ChatGPT, es necesario configurar una API key de OpenAI.
          Puedes obtenerla en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a>.
        </p>
        
        <div className="flex items-center space-x-2">
          <div className="flex-grow">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key de OpenAI
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        
        <p className="text-gray-500 text-xs mt-2">
          La API key se almacenará localmente en tu navegador. No se comparte con ningún servidor.
        </p>
      </div>
      
      <div className="flex justify-between">
        {isConfigured && (
          <Button 
            variant="danger"
            onClick={handleClear}
            className="text-sm"
          >
            Eliminar API Key
          </Button>
        )}
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={onClose}
            className="text-sm"
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave}
            className="text-sm"
          >
            {isConfigured ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenAIKeyConfig;