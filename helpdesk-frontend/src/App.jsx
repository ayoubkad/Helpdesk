import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import TicketDetailsModal from "./components/TicketDetailsModal";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Route publique d'inscription */}
          <Route path="/register" element={<Register />} />
          
          {/* Route publique de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
          path="/tickets/:ticketId"
          element={
            <ProtectedRoute>
              <TicketDetailsModal />
            </ProtectedRoute>
          }
        />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          
          {/* Redirection par défaut */}
          
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;