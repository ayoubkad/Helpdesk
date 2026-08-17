import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import TicketDetailsModal from "../components/TicketDetailsModal";
import {
  Wrench,
  LogOut,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  Calendar,
  User,
  Folder,
  ChevronRight,
  X,
  Inbox,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  Flame
} from "lucide-react";
import "./TechnicianDashboard.css";

const API_URL = "http://localhost:8081/api";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { userEmail, userRole, userId, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtres
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const displayEmail = userEmail || localStorage.getItem("userEmail") || "technicien@helpdesk.pro";

  // Récupérer le nom de la catégorie de manière robuste
  const getTicketCategoryName = (ticket) => {
    if (ticket.categorieNom) return ticket.categorieNom;
    if (ticket.categorie?.nom) return ticket.categorie.nom;
    if (ticket.categorieId) {
      const found = categories.find((c) => String(c.id) === String(ticket.categorieId));
      if (found?.nom) return found.nom;
      return `Catégorie #${ticket.categorieId}`;
    }
    return "Général";
  };

  // Récupérer la valeur du statut quelle que soit sa clé dans l'objet JSON
  const getTicketStatus = (ticket) => {
    return ticket.statutTicket || ticket.statut || ticket.status || "NOUVEAU";
  };

  // Récupérer la priorité
  const getTicketPriority = (ticket) => {
    return ticket.priorite || ticket.priority || "MOYENNE";
  };

  // Configuration des statuts
  const getStatusConfig = (rawStatus) => {
    switch (rawStatus) {
      case "NOUVEAU":
        return {
          label: "Nouveau",
          icon: AlertCircle,
          className: "badge-status-new",
        };
      case "EN_COURS":
        return {
          label: "En cours",
          icon: Clock,
          className: "badge-status-inprogress",
        };
      case "RESOLU":
        return {
          label: "Résolu",
          icon: CheckCircle2,
          className: "badge-status-resolved",
        };
      case "CLOTURE":
        return {
          label: "Clôturé",
          icon: Lock,
          className: "badge-status-closed",
        };
      default:
        return {
          label: rawStatus,
          icon: AlertCircle,
          className: "badge-status-default",
        };
    }
  };

  // Configuration de la priorité
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "HAUTE":
        return {
          label: "Haute",
          className: "badge-priority-high",
          icon: Flame
        };
      case "MOYENNE":
        return {
          label: "Moyenne",
          className: "badge-priority-medium",
          icon: null
        };
      case "BASSE":
      default:
        return {
          label: "Faible",
          className: "badge-priority-low",
          icon: null
        };
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error("Erreur chargement catégories :", err);
    }
  };

  const fetchTickets = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Session expirée. Veuillez vous reconnecter.");

      const response = await axios.get(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(response.data || []);
    } catch (err) {
      console.error("Erreur chargement tickets :", err);
      setError("Impossible de récupérer les tickets pour le moment.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenModal = (id) => {
    setSelectedTicketId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
    fetchTickets(true);
  };

  const handleResetFilters = () => {
    setFilterStatus("ALL");
    setFilterCategory("ALL");
    setFilterPriority("ALL");
    setSearchTerm("");
  };

  // Filtrage des tickets
  const filteredTickets = tickets.filter((ticket) => {
    const currentStatus = getTicketStatus(ticket);
    const currentPriority = getTicketPriority(ticket);
    const currentCatId = ticket.categorieId || ticket.categorie?.id;

    // Filtre Statut
    let matchesStatus = true;
    if (filterStatus === "MY_TICKETS") {
      const currentTechId = userId || localStorage.getItem("userId");
      const techMatches =
        (ticket.technicienId && String(ticket.technicienId) === String(currentTechId)) ||
        (ticket.technicien?.id && String(ticket.technicien.id) === String(currentTechId)) ||
        (ticket.technicien?.email && ticket.technicien.email.toLowerCase() === displayEmail.toLowerCase());
      matchesStatus = techMatches;
    } else if (filterStatus !== "ALL") {
      matchesStatus = currentStatus === filterStatus;
    }

    // Filtre Catégorie
    const matchesCategory =
      filterCategory === "ALL" ||
      String(currentCatId) === String(filterCategory);

    // Filtre Priorité
    const matchesPriority =
      filterPriority === "ALL" || currentPriority === filterPriority;

    // Recherche globale
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      ticket.titre?.toLowerCase().includes(term) ||
      ticket.description?.toLowerCase().includes(term) ||
      String(ticket.id).includes(term) ||
      ticket.createur?.nom?.toLowerCase().includes(term) ||
      ticket.createur?.email?.toLowerCase().includes(term);

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Calcul des compteurs en temps réel
  const countTotal = tickets.length;
  const countNew = tickets.filter((t) => getTicketStatus(t) === "NOUVEAU").length;
  const countInProgress = tickets.filter((t) => getTicketStatus(t) === "EN_COURS").length;
  const countResolved = tickets.filter((t) => getTicketStatus(t) === "RESOLU").length;
  const countClosed = tickets.filter((t) => getTicketStatus(t) === "CLOTURE").length;

  const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterCategory !== "ALL" ||
    filterPriority !== "ALL" ||
    searchTerm.trim() !== "";

  return (
    <div className="tech-dashboard-page">
      {/* Top Navigation Bar */}
      <header className="tech-header">
        <div className="tech-header-inner">
          <div className="tech-brand-section">
            <div className="tech-logo-icon">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="tech-brand-title">
                Helpdesk<span className="brand-accent">Pro</span>
                <span className="tech-role-badge">
                  <ShieldCheck className="w-3 h-3" />
                  {userRole || "TECHNICIEN"}
                </span>
              </div>
              <p className="tech-user-email">
                Connecté en tant que <strong>{displayEmail}</strong>
              </p>
            </div>
          </div>

          <div className="tech-header-actions">
            <button
              className={`tech-btn-action btn-refresh ${isRefreshing ? "is-spinning" : ""}`}
              onClick={() => fetchTickets(true)}
              title="Rafraîchir les tickets"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "spin-animation" : ""}`} />
              <span className="hidden-xs">Actualiser</span>
            </button>

            <div className="header-divider"></div>

            <button
              className="tech-btn-action btn-logout"
              onClick={handleLogout}
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden-xs">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="tech-main-container">
        {/* Title & Headline */}
        <div className="tech-dashboard-title-bar">
          <div>
            <h1 className="tech-main-title">Espace d'Intervention Technique</h1>
            <p className="tech-main-subtitle">
              Supervisez, traitez et résolvez les incidents signalés par les utilisateurs en temps réel.
            </p>
          </div>
        </div>

        {/* Interactive Stats Grid / Quick Status Filter */}
        <div className="tech-stats-grid">
          {/* Card: Total */}
          <div
            className={`tech-stat-card card-total ${filterStatus === "ALL" ? "is-active" : ""}`}
            onClick={() => setFilterStatus("ALL")}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper icon-total">
              <Layers className="w-5 h-5" />
            </div>
            <div className="stat-data">
              <span className="stat-number">{countTotal}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
            <div className="stat-indicator"></div>
          </div>

          {/* Card: Nouveaux */}
          <div
            className={`tech-stat-card card-new ${filterStatus === "NOUVEAU" ? "is-active" : ""}`}
            onClick={() => setFilterStatus("NOUVEAU")}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper icon-new">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="stat-data">
              <span className="stat-number">{countNew}</span>
              <span className="stat-label">Nouveaux</span>
            </div>
            <div className="stat-indicator"></div>
          </div>

          {/* Card: En cours */}
          <div
            className={`tech-stat-card card-inprogress ${filterStatus === "EN_COURS" ? "is-active" : ""}`}
            onClick={() => setFilterStatus("EN_COURS")}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper icon-inprogress">
              <Clock className="w-5 h-5" />
            </div>
            <div className="stat-data">
              <span className="stat-number">{countInProgress}</span>
              <span className="stat-label">En cours</span>
            </div>
            <div className="stat-indicator"></div>
          </div>

          {/* Card: Résolus */}
          <div
            className={`tech-stat-card card-resolved ${filterStatus === "RESOLU" ? "is-active" : ""}`}
            onClick={() => setFilterStatus("RESOLU")}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper icon-resolved">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="stat-data">
              <span className="stat-number">{countResolved}</span>
              <span className="stat-label">Résolus</span>
            </div>
            <div className="stat-indicator"></div>
          </div>

          {/* Card: Clôturés */}
          <div
            className={`tech-stat-card card-closed ${filterStatus === "CLOTURE" ? "is-active" : ""}`}
            onClick={() => setFilterStatus("CLOTURE")}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper icon-closed">
              <Lock className="w-5 h-5" />
            </div>
            <div className="stat-data">
              <span className="stat-number">{countClosed}</span>
              <span className="stat-label">Clôturés</span>
            </div>
            <div className="stat-indicator"></div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="tech-filter-panel">
          <div className="filter-panel-top">
            {/* Search Input */}
            <div className="tech-search-container">
              <Search className="search-icon w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, description, auteur ou #ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tech-search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm("")}
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="status-pill-group">
              <button
                className={`status-chip ${filterStatus === "ALL" ? "active" : ""}`}
                onClick={() => setFilterStatus("ALL")}
              >
                Tous ({countTotal})
              </button>
              <button
                className={`status-chip chip-new ${filterStatus === "NOUVEAU" ? "active" : ""}`}
                onClick={() => setFilterStatus("NOUVEAU")}
              >
                Nouveaux ({countNew})
              </button>
              <button
                className={`status-chip chip-inprogress ${filterStatus === "EN_COURS" ? "active" : ""}`}
                onClick={() => setFilterStatus("EN_COURS")}
              >
                En cours ({countInProgress})
              </button>
              <button
                className={`status-chip chip-resolved ${filterStatus === "RESOLU" ? "active" : ""}`}
                onClick={() => setFilterStatus("RESOLU")}
              >
                Résolus ({countResolved})
              </button>
              <button
                className={`status-chip chip-closed ${filterStatus === "CLOTURE" ? "active" : ""}`}
                onClick={() => setFilterStatus("CLOTURE")}
              >
                Clôturés ({countClosed})
              </button>
            </div>
          </div>

          <div className="filter-panel-bottom">
            <div className="dropdown-filters-row">
              {/* Category Dropdown */}
              <div className="filter-select-wrapper">
                <Folder className="select-icon w-4 h-4 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="tech-select"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Dropdown */}
              <div className="filter-select-wrapper">
                <SlidersHorizontal className="select-icon w-4 h-4 text-slate-400" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="tech-select"
                >
                  <option value="ALL">Toutes les priorités</option>
                  <option value="HAUTE">Priorité Haute</option>
                  <option value="MOYENNE">Priorité Moyenne</option>
                  <option value="BASSE">Priorité Faible</option>
                </select>
              </div>

              {/* Reset filters button */}
              {hasActiveFilters && (
                <button
                  className="btn-reset-filters"
                  onClick={handleResetFilters}
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            <div className="results-count-badge">
              <span>
                <strong>{filteredTickets.length}</strong> ticket{filteredTickets.length > 1 ? "s" : ""} affiché{filteredTickets.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="tech-error-banner">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="error-content">
              <h4>Erreur de chargement</h4>
              <p>{error}</p>
            </div>
            <button className="btn-retry" onClick={() => fetchTickets(false)}>
              Réessayer
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !error && (
          <div className="tech-tickets-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="ticket-card-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-pill w-16"></div>
                  <div className="skeleton-pill w-24"></div>
                  <div className="skeleton-pill w-20 ml-auto"></div>
                </div>
                <div className="skeleton-line title"></div>
                <div className="skeleton-line desc"></div>
                <div className="skeleton-line desc-short"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-pill w-28"></div>
                  <div className="skeleton-pill w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTickets.length === 0 && (
          <div className="tech-empty-state">
            <div className="empty-icon-box">
              <Inbox className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="empty-title">Aucun ticket trouvé</h3>
            <p className="empty-desc">
              {hasActiveFilters
                ? "Aucun ticket ne correspond à vos critères de recherche ou de filtrage actuels."
                : "Il n'y a actuellement aucun ticket d'assistance enregistré."}
            </p>
            {hasActiveFilters && (
              <button className="btn-empty-reset" onClick={handleResetFilters}>
                <RotateCcw className="w-4 h-4" />
                <span>Effacer les filtres</span>
              </button>
            )}
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && filteredTickets.length > 0 && (
          <div className="tech-tickets-grid">
            {filteredTickets.map((ticket) => {
              const statusCfg = getStatusConfig(getTicketStatus(ticket));
              const StatusIcon = statusCfg.icon;
              const priorityCfg = getPriorityConfig(getTicketPriority(ticket));
              const PriorityIcon = priorityCfg.icon;

              const isAssigned = ticket.technicien || ticket.technicienId;
              const isAssignedToMe =
                (ticket.technicienId && String(ticket.technicienId) === String(userId)) ||
                (ticket.technicien?.email && ticket.technicien.email.toLowerCase() === displayEmail.toLowerCase());

              const creatorName =
                ticket.createur?.nom ||
                ticket.createur?.email ||
                (ticket.createurId ? `Utilisateur #${ticket.createurId}` : "Anonyme");

              return (
                <div
                  key={ticket.id}
                  className="tech-ticket-card"
                  onClick={() => handleOpenModal(ticket.id)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Card Top Badges */}
                  <div className="ticket-card-meta-row">
                    <div className="meta-left-badges">
                      <span className="ticket-number-badge">
                        #{String(ticket.id).padStart(4, "0")}
                      </span>

                      <span className="ticket-cat-badge" title="Catégorie">
                        <Folder className="w-3 h-3 text-indigo-500" />
                        <span>{getTicketCategoryName(ticket)}</span>
                      </span>

                      <span className={`ticket-prio-badge ${priorityCfg.className}`}>
                        {PriorityIcon && <PriorityIcon className="w-3 h-3 inline mr-0.5" />}
                        {priorityCfg.label}
                      </span>
                    </div>

                    <span className={`ticket-status-pill ${statusCfg.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <div className="ticket-card-content">
                    <h3 className="ticket-title-text" title={ticket.titre}>
                      {ticket.titre}
                    </h3>
                    <p className="ticket-desc-text">
                      {ticket.description || "Aucune description détaillée."}
                    </p>
                  </div>

                  {/* Card Author & Details row */}
                  <div className="ticket-creator-row">
                    <div className="creator-info" title={`Créé par ${creatorName}`}>
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="creator-name">{creatorName}</span>
                    </div>

                    <div className="date-info">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {ticket.dateCreation
                          ? new Date(ticket.dateCreation).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "Date inconnue"}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="ticket-card-bottom-bar">
                    <div className="assignment-status">
                      {isAssigned ? (
                        <span className={`assigned-pill ${isAssignedToMe ? "assigned-me" : "assigned-other"}`}>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>
                            {isAssignedToMe
                              ? "Assigné à vous"
                              : ticket.technicien?.nom || ticket.technicien?.email || `Tech #${ticket.technicienId}`}
                          </span>
                        </span>
                      ) : (
                        <span className="unassigned-pill">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Non assigné</span>
                        </span>
                      )}
                    </div>

                    <div className="view-details-action">
                      <span>Intervenir</span>
                      <ChevronRight className="w-4 h-4 text-indigo-500 action-arrow" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Ticket Details & Action Modal */}
      {isModalOpen && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={() => fetchTickets(true)}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;