import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './features/admin';
import './css/admin.css';

// Mock authentication check
const useAuth = () => {
  return { user: { role: 'admin' } }; // Mock admin user
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/admin/*" 
            element={
              user?.role === 'admin' 
                ? <AdminPanel /> 
                : <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-bold">FoodXchange Platform</h1><p className="mt-4">Main app content goes here.</p><a href="/admin" className="text-blue-500 hover:underline">Go to Admin Dashboard</a></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
