// src/App.jsx - Versión con ancho completo
import React from 'react';
import './App.css';
import Dashboard from './Dashboard';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <div className="App w-full min-h-screen bg-gray-100">
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    </div>
  );
}

export default App;