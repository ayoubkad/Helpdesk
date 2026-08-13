import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";
import TicketList from "../components/TicketList";
import {
  Plus,
  Search,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  ListTodo,
  FileText,
  AlertCircle,
  X,
  Send,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { userId, userEmail, userRole, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    priorite: "MOYENNE",
    categorieId: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: null,
    message: "",
  });

  // =========================================================
  // PRIORITES
  // =========================================================

  const priorities = [
    {
      id: "BASSE",
      label: "Faible",
      desc: "Demande standard",
      className: "priority-low",
    },
    {
      id: "MOYENNE",
      label: "Moyenne",
      desc: "Problème courant",
      className: "priority-medium",
    },
    {
      id: "HAUTE",
      label: "Haute",
      desc: "Urgence / bloquant",
      className: "priority-high",
    },
  ];

  // =========================================================
  // CHARGER LES TICKETS
  // =========================================================

  const fetchTickets = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/tickets");
      setTickets(response.data || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des tickets :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHARGER LES CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    setCategoriesLoading(true);

    try {
      const response = await api.get("/api/categories");

      console.log(
        "Catégories reçues :",
        response.data
      );

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des catégories :",
        error
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================================================
  // CHARGEMENT INITIAL
  // =========================================================

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.titre.trim()) {
      errors.titre = "Le titre est obligatoire";
    } else if (formData.titre.trim().length < 4) {
      errors.titre =
        "Le titre doit comporter au moins 4 caractères";
    }

    if (!formData.description.trim()) {
      errors.description =
        "La description est obligatoire";
    } else if (formData.description.trim().length < 10) {
      errors.description =
        "Veuillez fournir au moins 10 caractères pour la description";
    }

    if (!formData.categorieId) {
      errors.categorieId =
        "Veuillez choisir une catégorie";
    }

    if (!formData.priorite) {
      errors.priorite =
        "Veuillez choisir une priorité";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // CREER UN TICKET
  // =========================================================

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    setFeedback({
      type: null,
      message: "",
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUserId =
        userId ||
        localStorage.getItem("userId") ||
        1;

      const response = await api.post(
        `/api/tickets?createurId=${currentUserId}`,
        {
          titre: formData.titre.trim(),
          description: formData.description.trim(),
          priorite: formData.priorite,
          categorieId: Number(formData.categorieId),
        }
      );

      // Ajouter le ticket créé directement à la liste
      setTickets((prev) => [
        response.data,
        ...prev,
      ]);

      setFeedback({
        type: "success",
        message: "Ticket créé avec succès !",
      });

      // Réinitialiser le formulaire
      setFormData({
        titre: "",
        description: "",
        priorite: "MOYENNE",
        categorieId: "",
      });

      setFormErrors({});

      // Actualiser depuis le backend
      await fetchTickets();

      setTimeout(() => {
        setIsModalOpen(false);

        setFeedback({
          type: null,
          message: "",
        });
      }, 1200);

    } catch (error) {
      console.error(
        "Erreur lors de la création du ticket :",
        error
      );

      const serverMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Une erreur est survenue lors de la création du ticket.";

      setFeedback({
        type: "error",
        message:
          typeof serverMsg === "string"
            ? serverMsg
            : "Erreur serveur lors de la création.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // FERMER LE MODAL
  // =========================================================

  const closeCreateModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);

    setFeedback({
      type: null,
      message: "",
    });

    setFormErrors({});
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================================================
  // STATISTIQUES
  // =========================================================

  const totalCount = tickets.length;

  const enAttenteCount = tickets.filter(
    (t) =>
      (t.status || t.statut) === "NOUVEAU" ||
      (t.status || t.statut) === "EN_ATTENTE"
  ).length;

  const enCoursCount = tickets.filter(
    (t) =>
      (t.status || t.statut) === "EN_COURS"
  ).length;

  const resolusCount = tickets.filter(
    (t) =>
      (t.status || t.statut) === "RESOLU" ||
      (t.status || t.statut) === "CLOTURE"
  ).length;

  // =========================================================
  // FILTRAGE
  // =========================================================

  const filteredTickets = tickets.filter((ticket) => {
    const search =
      searchQuery.toLowerCase();

    const matchSearch =
      (ticket.titre || "")
        .toLowerCase()
        .includes(search) ||
      (ticket.description || "")
        .toLowerCase()
        .includes(search) ||
      String(ticket.id || "")
        .includes(search);

    const status =
      ticket.status ||
      ticket.statut ||
      "NOUVEAU";

    if (filterStatus === "ALL") {
      return matchSearch;
    }

    if (filterStatus === "EN_ATTENTE") {
      return (
        matchSearch &&
        (
          status === "NOUVEAU" ||
          status === "EN_ATTENTE"
        )
      );
    }

    if (filterStatus === "EN_COURS") {
      return (
        matchSearch &&
        status === "EN_COURS"
      );
    }

    if (filterStatus === "RESOLU") {
      return (
        matchSearch &&
        (
          status === "RESOLU" ||
          status === "CLOTURE"
        )
      );
    }

    return matchSearch;
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard-shell">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="dashboard-navbar">

        <div className="dashboard-navbar-inner">

          <div className="brand-area">

            <div className="brand-icon">
              <ShieldCheck />
            </div>

            <div className="brand-text">

              <span className="brand-name">
                Helpdesk<span>Pro</span>
              </span>

              <span className="role-badge">
                {userRole || "USER"}
              </span>

            </div>

          </div>

          <div className="navbar-actions">

            {userEmail && (
              <span className="user-email">
                {userEmail}
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(true)
              }
              className="gold-button new-ticket-button"
            >
              <Plus />
              <span>Nouveau ticket</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-button"
              title="Se déconnecter"
            >
              <LogOut />
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="dashboard-heading">

          <div>

            <div className="eyebrow">
              ESPACE SUPPORT
            </div>

            <h1>
              Tableau de bord
            </h1>

            <p>
              Consultez, gérez et créez vos tickets
              de support technique en temps réel.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setIsModalOpen(true)
            }
            className="gold-button mobile-create-button"
          >
            <Plus />
            <span>Créer un ticket</span>
          </button>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="stats-grid">

          <button
            type="button"
            onClick={() =>
              setFilterStatus("ALL")
            }
            className={`stat-card ${
              filterStatus === "ALL"
                ? "stat-card-active"
                : ""
            }`}
          >
            <div className="stat-top">
              <span>Total tickets</span>
              <LayoutDashboard />
            </div>

            <strong>
              {totalCount}
            </strong>

            <span className="stat-line" />
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatus("EN_ATTENTE")
            }
            className={`stat-card ${
              filterStatus === "EN_ATTENTE"
                ? "stat-card-active"
                : ""
            }`}
          >
            <div className="stat-top">
              <span>En attente</span>
              <Clock />
            </div>

            <strong>
              {enAttenteCount}
            </strong>

            <span className="stat-line" />
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatus("EN_COURS")
            }
            className={`stat-card ${
              filterStatus === "EN_COURS"
                ? "stat-card-active"
                : ""
            }`}
          >
            <div className="stat-top">
              <span>En cours</span>
              <ListTodo />
            </div>

            <strong>
              {enCoursCount}
            </strong>

            <span className="stat-line" />
          </button>

          <button
            type="button"
            onClick={() =>
              setFilterStatus("RESOLU")
            }
            className={`stat-card ${
              filterStatus === "RESOLU"
                ? "stat-card-active"
                : ""
            }`}
          >
            <div className="stat-top">
              <span>Résolus</span>
              <CheckCircle2 />
            </div>

            <strong>
              {resolusCount}
            </strong>

            <span className="stat-line" />
          </button>

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="search-filter-panel">

          <div className="search-box">

            <Search />

            <input
              type="text"
              placeholder="Rechercher par mot-clé, titre, description..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                aria-label="Effacer"
              >
                <X />
              </button>
            )}

          </div>

          <div className="filter-group">

            <span className="filter-label">
              Filtrer :
            </span>

            <button
              type="button"
              onClick={() =>
                setFilterStatus("ALL")
              }
              className={
                filterStatus === "ALL"
                  ? "filter-active"
                  : ""
              }
            >
              Tous ({totalCount})
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterStatus("EN_ATTENTE")
              }
              className={
                filterStatus === "EN_ATTENTE"
                  ? "filter-active"
                  : ""
              }
            >
              En attente ({enAttenteCount})
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterStatus("EN_COURS")
              }
              className={
                filterStatus === "EN_COURS"
                  ? "filter-active"
                  : ""
              }
            >
              En cours ({enCoursCount})
            </button>

            <button
              type="button"
              onClick={() =>
                setFilterStatus("RESOLU")
              }
              className={
                filterStatus === "RESOLU"
                  ? "filter-active"
                  : ""
              }
            >
              Résolus ({resolusCount})
            </button>

          </div>

        </div>

        {/* =================================================
            TICKETS
        ================================================= */}

        <div className="tickets-heading">

          <div>

            <span className="section-kicker">
              SUPPORT
            </span>

            <h2>
              Tickets récents
            </h2>

          </div>

          <span className="ticket-count">
            {filteredTickets.length} ticket(s)
          </span>

        </div>

        <div className="ticket-list-wrapper">

          <TicketList
            tickets={filteredTickets}
            loading={loading}
            categories={categories}
          />

        </div>

      </main>

      {/* =====================================================
          MODAL CREATION TICKET
      ===================================================== */}

      {isModalOpen && (

        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeCreateModal();
            }
          }}
        >

          <div className="ticket-modal">

            {/* HEADER */}

            <div className="modal-header">

              <div className="modal-title-area">

                <div className="modal-icon">
                  <FileText />
                </div>

                <div>

                  <h3>
                    Nouveau Ticket
                  </h3>

                  <p>
                    Déposer un incident ou une demande de support
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="modal-close"
              >
                <X />
              </button>

            </div>

            {/* BODY */}

            <div className="modal-body">

              {/* FEEDBACK */}

              {feedback.type === "error" && (
                <div className="feedback feedback-error">
                  <AlertCircle />
                  <span>
                    {feedback.message}
                  </span>
                </div>
              )}

              {feedback.type === "success" && (
                <div className="feedback feedback-success">
                  <CheckCircle2 />
                  <span>
                    {feedback.message}
                  </span>
                </div>
              )}

              <form
                onSubmit={handleCreateTicket}
                className="ticket-form"
                noValidate
              >

                {/* TITRE */}

                <div className="form-field">

                  <label htmlFor="modal-titre">
                    Titre du problème{" "}
                    <span>*</span>
                  </label>

                  <input
                    id="modal-titre"
                    type="text"
                    placeholder="Ex: Problème d'imprimante ou accès réseau"
                    value={formData.titre}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        titre: e.target.value,
                      });

                      if (formErrors.titre) {
                        setFormErrors({
                          ...formErrors,
                          titre: "",
                        });
                      }
                    }}
                    className={
                      formErrors.titre
                        ? "input-error"
                        : ""
                    }
                  />

                  {formErrors.titre && (
                    <p className="field-error">
                      <AlertCircle />
                      {formErrors.titre}
                    </p>
                  )}

                </div>

                {/* DESCRIPTION */}

                <div className="form-field">

                  <label htmlFor="modal-desc">
                    Description détaillée{" "}
                    <span>*</span>
                  </label>

                  <textarea
                    id="modal-desc"
                    rows="4"
                    placeholder="Précisez le problème rencontré..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      });

                      if (
                        formErrors.description
                      ) {
                        setFormErrors({
                          ...formErrors,
                          description: "",
                        });
                      }
                    }}
                    className={
                      formErrors.description
                        ? "input-error"
                        : ""
                    }
                  />

                  {formErrors.description && (
                    <p className="field-error">
                      <AlertCircle />
                      {formErrors.description}
                    </p>
                  )}

                </div>

                {/* CATEGORIE */}

                <div className="form-field">

                  <label htmlFor="modal-categorie">
                    Catégorie{" "}
                    <span>*</span>
                  </label>

                  <select
                    id="modal-categorie"
                    value={formData.categorieId}
                    disabled={categoriesLoading}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        categorieId:
                          e.target.value,
                      });

                      if (
                        formErrors.categorieId
                      ) {
                        setFormErrors({
                          ...formErrors,
                          categorieId: "",
                        });
                      }
                    }}
                    className={
                      formErrors.categorieId
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      {categoriesLoading
                        ? "Chargement des catégories..."
                        : "Sélectionnez une catégorie"}
                    </option>

                    {categories.map(
                      (categorie) => (
                        <option
                          key={categorie.id}
                          value={categorie.id}
                        >
                          {categorie.nom ||
                            categorie.name ||
                            categorie.libelle ||
                            `Catégorie #${categorie.id}`}
                        </option>
                      )
                    )}

                  </select>

                  {!categoriesLoading &&
                    categories.length === 0 && (
                      <p className="field-error">
                        <AlertCircle />
                        Aucune catégorie disponible.
                      </p>
                    )}

                  {formErrors.categorieId && (
                    <p className="field-error">
                      <AlertCircle />
                      {formErrors.categorieId}
                    </p>
                  )}

                </div>

                {/* PRIORITE */}

                <div className="form-field">

                  <label>
                    Niveau de priorité{" "}
                    <span>*</span>
                  </label>

                  <div className="priority-grid">

                    {priorities.map((p) => {

                      const isSelected =
                        formData.priorite === p.id;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              priorite: p.id,
                            })
                          }
                          className={`priority-card ${
                            isSelected
                              ? `selected ${p.className}`
                              : ""
                          }`}
                        >

                          <strong>
                            {p.label}
                          </strong>

                          <small>
                            {p.desc}
                          </small>

                        </button>
                      );
                    })}

                  </div>

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="cancel-button"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      categoriesLoading
                    }
                    className="gold-button submit-button"
                  >

                    {isSubmitting ? (
                      <>
                        <Loader2 className="spin" />
                        <span>
                          Création...
                        </span>
                      </>
                    ) : (
                      <>
                        <Send />
                        <span>
                          Créer le ticket
                        </span>
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;