import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

// Données statiques pour la démonstration (Mock Data)
const staticStatusData = [
  { name: "Résolus", value: 48 },
  { name: "En cours", value: 32 },
  { name: "Ouverts", value: 25 },
  { name: "Fermés", value: 15 },
];

const staticCategoryData = [
  { name: "Réseau", tickets: 25 },
  { name: "Matériel", tickets: 18 },
  { name: "Logiciel", tickets: 30 },
  { name: "Compte", tickets: 12 },
];

const staticMetrics = {
  totalTickets: 120,
  resolvedTickets: 48,
  inProgressTickets: 32,
  resolutionRate: "40%",
};

const COLORS = ["#d4af37", "#f0c75e", "#8c721f", "#555555"];

function AdminDashboard() {
  const [metrics, setMetrics] = useState(staticMetrics);
  const [statusData, setStatusData] = useState(staticStatusData);
  const [categoryData, setCategoryData] = useState(staticCategoryData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mode Démo/Mock : Chargement direct des données statiques
    // (L'appel API vers http://localhost:8081/api/admin/metrics sera réactivé jeudi)
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Dashboard Administrateur</h1>
          <p>Vue globale des tickets et des statistiques</p>
        </div>
        <div className="admin-badge">ADMIN</div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🎫</div>
          <div className="kpi-content">
            <span>Total Tickets</span>
            <strong>{metrics.totalTickets}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✓</div>
          <div className="kpi-content">
            <span>Tickets Résolus</span>
            <strong>{metrics.resolvedTickets}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <span>Tickets En Cours</span>
            <strong>{metrics.inProgressTickets}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">%</div>
          <div className="kpi-content">
            <span>Taux de Résolution</span>
            <strong>{metrics.resolutionRate}</strong>
          </div>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="charts-grid">
        {/* PIE CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Répartition par statut</h2>
            <span>Tickets</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Répartition par catégorie</h2>
            <span>Tickets</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="tickets"
                  radius={[6, 6, 0, 0]}
                  fill="#d4af37"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;