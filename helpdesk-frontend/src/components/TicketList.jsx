import React, { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  X,
  User,
  Tag,
  Loader2,
  FileText,
} from "lucide-react";

import api from "../services/api";

function TicketList({
  tickets = [],
  loading = false,
  categories = [],
}) {
  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState("");

  // =========================================================
  // CATEGORIE
  // =========================================================

  const getCategoryName = (ticket) => {
    if (!ticket) {
      return "Non définie";
    }

    // Cas 1 : categorie = "Réseau"
    if (
      typeof ticket.categorie === "string"
    ) {
      return ticket.categorie;
    }

    // Cas 2 : categorie = { id, nom }
    if (ticket.categorie?.nom) {
      return ticket.categorie.nom;
    }

    if (ticket.categorie?.name) {
      return ticket.categorie.name;
    }

    if (ticket.categorie?.libelle) {
      return ticket.categorie.libelle;
    }

    // Cas 3 : category
    if (ticket.category?.nom) {
      return ticket.category.nom;
    }

    if (ticket.category?.name) {
      return ticket.category.name;
    }

    if (ticket.category?.libelle) {
      return ticket.category.libelle;
    }

    // Cas 4 : categorieId
    const categoryId =
      ticket.categorieId ??
      ticket.categoryId ??
      ticket.categorie?.id ??
      ticket.category?.id;

    if (categoryId != null) {
      const category = categories.find(
        (cat) =>
          Number(cat.id) ===
          Number(categoryId)
      );

      if (category) {
        return (
          category.nom ||
          category.name ||
          category.libelle ||
          `Catégorie #${category.id}`
        );
      }
    }

    return "Non définie";
  };

  // =========================================================
  // OUVRIR DETAILS
  // =========================================================

  const handleOpenDetails = async (ticket) => {
    setDetailsError("");
    setDetailsLoading(true);
    setSelectedTicket(ticket);

    try {
      if (ticket?.id) {

        const response = await api.get(
          `/api/tickets/${ticket.id}`
        );

        setSelectedTicket(response.data);
      }

    } catch (error) {

      console.error(
        "Erreur lors du chargement des détails :",
        error
      );

      setDetailsError(
        "Impossible de charger les détails complets du ticket."
      );

    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // FERMER
  // =========================================================

  const handleCloseDetails = () => {
    setSelectedTicket(null);
    setDetailsError("");
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Non définie";
    }

    try {
      return new Date(date).toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "Non définie";
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusInfo = (ticket) => {

    const status =
      ticket?.statut ??
      ticket?.status ??
      ticket?.statutTicket ??
      "NOUVEAU";

    const map = {

      NOUVEAU: {
        label: "Nouveau",
        className:
          "ticket-status-new",
        icon: <AlertCircle />,
      },

      EN_ATTENTE: {
        label: "En attente",
        className:
          "ticket-status-pending",
        icon: <Clock3 />,
      },

      EN_COURS: {
        label: "En cours",
        className:
          "ticket-status-progress",
        icon: <Clock3 />,
      },

      RESOLU: {
        label: "Résolu",
        className:
          "ticket-status-resolved",
        icon: <CheckCircle2 />,
      },

      CLOTURE: {
        label: "Clôturé",
        className:
          "ticket-status-closed",
        icon: <CheckCircle2 />,
      },

      FERME: {
        label: "Fermé",
        className:
          "ticket-status-closed",
        icon: <CheckCircle2 />,
      },
    };

    return (
      map[status] || {
        label: status,
        className:
          "ticket-status-default",
        icon: <AlertCircle />,
      }
    );
  };

  // =========================================================
  // PRIORITE
  // =========================================================

  const getPriorityInfo = (priority) => {

    const map = {

      BASSE: {
        label: "Faible",
        className:
          "ticket-priority-low",
      },

      MOYENNE: {
        label: "Moyenne",
        className:
          "ticket-priority-medium",
      },

      HAUTE: {
        label: "Haute",
        className:
          "ticket-priority-high",
      },
    };

    return (
      map[priority] || {
        label: priority || "Moyenne",
        className:
          "ticket-priority-medium",
      }
    );
  };

  // =========================================================
  // AUTEUR
  // =========================================================

  const getAuthorName = (ticket) => {

    const createur =
      ticket?.createur;

    if (typeof createur === "string") {
      return createur;
    }

    if (
      createur?.prenom &&
      createur?.nom
    ) {
      return `${createur.prenom} ${createur.nom}`;
    }

    if (createur?.prenom) {
      return createur.prenom;
    }

    if (createur?.nom) {
      return createur.nom;
    }

    if (createur?.name) {
      return createur.name;
    }

    if (createur?.email) {
      return createur.email;
    }

    if (ticket?.createurEmail) {
      return ticket.createurEmail;
    }

    if (ticket?.auteur) {
      return ticket.auteur;
    }

    return "Utilisateur";
  };

  // =========================================================
  // TECHNICIEN
  // =========================================================

  const getTechnicianName = (ticket) => {

    const technicien =
      ticket?.technicien;

    if (typeof technicien === "string") {
      return technicien;
    }

    if (
      technicien?.prenom &&
      technicien?.nom
    ) {
      return `${technicien.prenom} ${technicien.nom}`;
    }

    if (technicien?.prenom) {
      return technicien.prenom;
    }

    if (technicien?.nom) {
      return technicien.nom;
    }

    if (technicien?.name) {
      return technicien.name;
    }

    if (technicien?.email) {
      return technicien.email;
    }

    if (ticket?.technicienEmail) {
      return ticket.technicienEmail;
    }

    return "Non assigné";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="ticket-list-loading">

        <Loader2 className="ticket-loading-spinner" />

        <p>
          Chargement des tickets...
        </p>

      </div>
    );
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (!tickets.length) {

    return (
      <div className="ticket-list-empty">

        <div className="empty-ticket-icon">
          <FileText />
        </div>

        <h3>
          Aucun ticket
        </h3>

        <p>
          Aucun ticket ne correspond à votre recherche.
        </p>

      </div>
    );
  }

  // =========================================================
  // LIST
  // =========================================================

  return (
    <>

      <div className="tickets-grid">

        {tickets.map((ticket, index) => {

          const statusInfo =
            getStatusInfo(ticket);

          const priorityInfo =
            getPriorityInfo(
              ticket?.priorite
            );

          const creationDate =
            ticket?.dateCreation ??
            ticket?.createdAt ??
            ticket?.dateCreated ??
            ticket?.creationDate;

          return (

            <article
              key={
                ticket?.id ??
                `ticket-${index}`
              }
              className="ticket-card"
            >

              {/* HEADER */}

              <div className="ticket-card-top">

                <span className="ticket-number">
                  #
                  {ticket?.id ??
                    index + 1}
                </span>

                <div className="ticket-badges">

                  <span
                    className={`ticket-status ${statusInfo.className}`}
                  >
                    {React.cloneElement(
                      statusInfo.icon,
                      {
                        size: 14,
                      }
                    )}

                    {statusInfo.label}
                  </span>

                  <span
                    className={`ticket-priority ${priorityInfo.className}`}
                  >
                    Priorité{" "}
                    {priorityInfo.label}
                  </span>

                </div>

                <div className="ticket-date">

                  <CalendarDays
                    size={15}
                  />

                  <span>
                    {formatDate(
                      creationDate
                    )}
                  </span>

                </div>

              </div>

              {/* CONTENT */}

              <div className="ticket-card-content">

                <h3 className="ticket-title">
                  {ticket?.titre ||
                    "Sans titre"}
                </h3>

                <p className="ticket-description">
                  {ticket?.description ||
                    "Aucune description"}
                </p>

              </div>

              {/* FOOTER */}

              <div className="ticket-card-footer">

                <span className="ticket-author">
                  Auteur :{" "}
                  {getAuthorName(ticket)}
                </span>

                <button
                  type="button"
                  className="ticket-details-button"
                  onClick={() =>
                    handleOpenDetails(ticket)
                  }
                >
                  <span>
                    Détails
                  </span>

                  <ChevronRight
                    size={17}
                  />
                </button>

              </div>

            </article>
          );
        })}

      </div>

      {/* =====================================================
          MODAL DETAILS
      ===================================================== */}

      {selectedTicket && (

        <div
          className="ticket-details-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseDetails();
            }

          }}
        >

          <div className="ticket-details-modal">

            {/* HEADER */}

            <div className="ticket-details-header">

              <div className="ticket-details-title">

                <div className="ticket-details-icon">
                  <FileText />
                </div>

                <div>

                  <span>
                    TICKET #
                    {selectedTicket.id}
                  </span>

                  <h2>
                    {selectedTicket.titre ||
                      "Sans titre"}
                  </h2>

                </div>

              </div>

              <button
                type="button"
                className="ticket-details-close"
                onClick={
                  handleCloseDetails
                }
              >
                <X />
              </button>

            </div>

            {/* BODY */}

            <div className="ticket-details-body">

              {detailsLoading && (

                <div className="ticket-details-loading">

                  <Loader2 className="ticket-loading-spinner" />

                  <span>
                    Chargement...
                  </span>

                </div>

              )}

              {detailsError && (

                <div className="ticket-details-error">

                  <AlertCircle />

                  <span>
                    {detailsError}
                  </span>

                </div>

              )}

              {/* DESCRIPTION */}

              <section className="details-section">

                <div className="details-section-title">

                  <FileText />

                  <h3>
                    Description
                  </h3>

                </div>

                <div className="details-description">

                  {selectedTicket.description ||
                    "Aucune description disponible."}

                </div>

              </section>

              {/* INFORMATIONS */}

              <section className="details-section">

                <div className="details-section-title">

                  <Tag />

                  <h3>
                    Informations du ticket
                  </h3>

                </div>

                <div className="details-info-grid">

                  {/* CATEGORIE */}

                  <div className="details-info-item">

                    <span className="details-label">
                      Catégorie
                    </span>

                    <strong>
                      {getCategoryName(
                        selectedTicket
                      )}
                    </strong>

                  </div>

                  {/* PRIORITE */}

                  <div className="details-info-item">

                    <span className="details-label">
                      Priorité
                    </span>

                    <strong
                      className={
                        getPriorityInfo(
                          selectedTicket.priorite
                        ).className
                      }
                    >
                      {
                        getPriorityInfo(
                          selectedTicket.priorite
                        ).label
                      }
                    </strong>

                  </div>

                  {/* STATUS */}

                  <div className="details-info-item">

                    <span className="details-label">
                      Statut
                    </span>

                    <strong>
                      {
                        getStatusInfo(
                          selectedTicket
                        ).label
                      }
                    </strong>

                  </div>

                  {/* DATE */}

                  <div className="details-info-item">

                    <span className="details-label">
                      Date de création
                    </span>

                    <strong>
                      {formatDate(
                        selectedTicket.dateCreation ??
                        selectedTicket.createdAt ??
                        selectedTicket.dateCreated ??
                        selectedTicket.creationDate
                      )}
                    </strong>

                  </div>

                </div>

              </section>

              {/* AFFECTATION */}

              <section className="details-section">

                <div className="details-section-title">

                  <User />

                  <h3>
                    Affectation
                  </h3>

                </div>

                <div className="details-info-grid">

                  <div className="details-info-item">

                    <span className="details-label">
                      Auteur
                    </span>

                    <strong>
                      {getAuthorName(
                        selectedTicket
                      )}
                    </strong>

                  </div>

                  <div className="details-info-item">

                    <span className="details-label">
                      Technicien
                    </span>

                    <strong>
                      {getTechnicianName(
                        selectedTicket
                      )}
                    </strong>

                  </div>

                </div>

              </section>

            </div>

            {/* FOOTER */}

            <div className="ticket-details-footer">

              <button
                type="button"
                className="ticket-details-close-button"
                onClick={
                  handleCloseDetails
                }
              >
                Fermer
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

export default TicketList;