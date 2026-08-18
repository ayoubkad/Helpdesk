import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* Routes publiques */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard USER */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Dashboard TECHNICIEN */}
            <Route
              path="/technician"
              element={
                <ProtectedRoute allowedRoles={["TECHNICIEN"]}>
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />

            {/* Création de ticket - USER */}
            <Route
              path="/create-ticket"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />

            {/* Dashboard ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Route inconnue */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;