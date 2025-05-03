// src/App.jsx
import React from 'react';
import './App.css';
import Dashboard from './Dashboard';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <div className="App">
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    </div>
  );
}

export default App;