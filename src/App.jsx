// src/App.jsx - Versión con arquitectura refactorizada
import React from 'react';
import './App.css';
import Dashboard from './Dashboard';
import { DashboardProvider } from './contexts/DashboardProvider.jsx';

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