import React, { useState, useEffect } from "react";
import axios from "axios";
import TicketDetailsModal from "../components/TicketDetailsModal";
import "./TechnicianDashboard.css";

const API_URL = "http://localhost:8081/api";

const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const userEmail = localStorage.getItem("userEmail") || "technicien@gmail.com";

  // Récupérer la valeur du statut quelle que soit sa clé dans l'objet JSON
  const getTicketStatus = (ticket) => {
    return ticket.statutTicket || ticket.statut || ticket.status || "NOUVEAU";
  };

  // Normalisation du libellé du statut pour l'affichage
  const getStatusLabel = (ticket) => {
    const rawStatus = getTicketStatus(ticket);
    const statusMap = {
      NOUVEAU: "NOUVEAU",
      EN_COURS: "EN COURS",
      RESOLU: "RÉSOLU",
      CLOTURE: "CLÔTURÉ",
    };
    return statusMap[rawStatus] || rawStatus;
  };

  const getStatusBadgeClass = (ticket) => {
    const rawStatus = getTicketStatus(ticket);
    const classMap = {
      NOUVEAU: "badge-new",
      EN_COURS: "badge-inprogress",
      RESOLU: "badge-resolved",
      CLOTURE: "badge-closed",
    };
    return classMap[rawStatus] || "badge-default";
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token introuvable");

      const response = await axios.get(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Tickets reçus :", response.data);
      setTickets(response.data);
    } catch (err) {
      console.error("Erreur chargement tickets :", err);
      setError("Impossible de charger les tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenModal = (id) => {
    setSelectedTicketId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
    fetchTickets(); // Actualise le Dashboard dès la fermeture de la modale
  };

  // Filtrage des tickets
  const filteredTickets = tickets.filter((ticket) => {
    const currentStatus = getTicketStatus(ticket);
    const matchesStatus = filterStatus === "ALL" || currentStatus === filterStatus;
    const matchesSearch =
      ticket.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calcul des compteurs
  const countTotal = tickets.length;
  const countNew = tickets.filter((t) => getTicketStatus(t) === "NOUVEAU").length;
  const countInProgress = tickets.filter((t) => getTicketStatus(t) === "EN_COURS").length;
  const countResolved = tickets.filter((t) => getTicketStatus(t) === "RESOLU").length;
  const countClosed = tickets.filter((t) => getTicketStatus(t) === "CLOTURE").length;

  return (
    <div className="dashboard-container">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h2>🛠️ Dashboard Technicien</h2>
          <p>Bienvenue, <strong>{userEmail}</strong></p>
        </div>
        <div className="header-actions">
          <span className="role-pill">TECHNICIEN</span>
          <button className="btn-refresh" onClick={fetchTickets}>🔄</button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{countTotal}</h3>
          <p>TOTAL TICKETS</p>
        </div>
        <div className="stat-card card-new">
          <h3>{countNew}</h3>
          <p>NOUVEAUX</p>
        </div>
        <div className="stat-card card-inprogress">
          <h3>{countInProgress}</h3>
          <p>EN COURS</p>
        </div>
        <div className="stat-card card-resolved">
          <h3>{countResolved}</h3>
          <p>RÉSOLUS</p>
        </div>
        <div className="stat-card card-closed">
          <h3>{countClosed}</h3>
          <p>CLÔTURÉS</p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Statut :</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">📋 Tous les statuts</option>
            <option value="NOUVEAU">🆕 Nouveau</option>
            <option value="EN_COURS">🔄 En cours</option>
            <option value="RESOLU">✅ Résolu</option>
            <option value="CLOTURE">🔒 Clôturé</option>
          </select>
          <span className="ticket-count">{filteredTickets.length} ticket(s)</span>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Rechercher un ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des cartes de tickets */}
      {loading ? (
        <p>Chargement des tickets...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="tickets-grid">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => handleOpenModal(ticket.id)}
            >
              <div className="ticket-card-header">
                <span className="ticket-id">#{String(ticket.id).padStart(4, "0")}</span>
                <span className="ticket-category">
                  📁 {ticket.categorie?.nom || "Général"}
                </span>
                <span className={`status-pill ${getStatusBadgeClass(ticket)}`}>
                  {getStatusLabel(ticket)}
                </span>
              </div>

              <h4 className="ticket-card-title">{ticket.titre}</h4>
              <p className="ticket-card-desc">{ticket.description}</p>

              <div className="ticket-card-footer">
                <span className="ticket-date">
                  📅 {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString("fr-FR") : "Inconnu"}
                </span>
                <span className="ticket-assignee">
                  {ticket.technicien?.nom || ticket.technicien?.email || (ticket.technicienId ? `Tech #${ticket.technicienId}` : "⏳ Non assigné")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de détails */}
      {isModalOpen && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;