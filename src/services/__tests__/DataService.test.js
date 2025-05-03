// src/services/__tests__/DataService.test.js
import DataService from '../DataService';

// Mock para sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store,
  };
})();

// Mock para document.createElement
document.createElement = jest.fn().mockImplementation(tag => {
  if (tag === 'a') {
    return {
      setAttribute: jest.fn(),
      click: jest.fn(),
    };
  }
  return {};
});

// Mock para URL.createObjectURL
URL.createObjectURL = jest.fn();

// Mock para Papa Parse
jest.mock('papaparse', () => ({
  unparse: jest.fn().mockReturnValue('mocked,csv,data'),
}));

describe('DataService', () => {
  beforeEach(() => {
    // Configurar mocks para sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
    });
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('saveToStorage', () => {
    it('should save data to sessionStorage', () => {
      // Datos de prueba
      const data = [
        { id: 1, name: 'Test 1', fechaRegistro: new Date(), fechaAsignacion: null },
        { id: 2, name: 'Test 2', fechaRegistro: null, fechaAsignacion: new Date() },
      ];
      
      // Ejecutar método
      const result = DataService.saveToStorage(data, 'test_key', 2);
      
      // Verificar resultado
      expect(result).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test_key_totalChunks', '1');
    });
  });

  describe('loadFromStorage', () => {
    it('should load data from sessionStorage', () => {
      // Configurar datos de prueba
      const mockDate = '2023-01-01T00:00:00.000Z';
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'test_key_totalChunks') return '1';
        if (key === 'test_key_chunk_0') {
          return JSON.stringify([
            { id: 1, name: 'Test 1', fechaRegistro: mockDate, fechaAsignacion: null },
            { id: 2, name: 'Test 2', fechaRegistro: null, fechaAsignacion: mockDate },
          ]);
        }
        return null;
      });

      // Ejecutar método
      const result = DataService.loadFromStorage('test_key');
      
      // Verificar resultado
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].fechaRegistro instanceof Date).toBe(true);
      expect(result[1].fechaAsignacion instanceof Date).toBe(true);
    });
  });

  describe('clearStorage', () => {
    it('should clear data from sessionStorage', () => {
      // Configurar datos de prueba
      mockSessionStorage.getItem.mockReturnValue('2');
      
      // Ejecutar método
      const result = DataService.clearStorage('test_key');
      
      // Verificar resultado
      expect(result).toBe(true);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledTimes(3);
    });
  });
});