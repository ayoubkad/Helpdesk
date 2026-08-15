import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Lock,
  User,
  Folder,
  Calendar,
  MessageSquare,
  Send,
  AlertCircle,
  X,
  ShieldCheck,
  UserCheck,
  Flame,
  Loader2,
  RefreshCw,
  Info
} from "lucide-react";
import "./TicketDetailsModal.css";

const API_URL = "http://localhost:8081/api";

const TicketDetailsModal = ({
  ticketId: propTicketId,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onUpdate
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const ticketId = propTicketId || params.ticketId;
  const isOpen = propIsOpen !== undefined ? propIsOpen : true;

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userRole, setUserRole] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // In-modal toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleClose = useCallback(() => {
    if (propOnClose) {
      propOnClose();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/dashboard");
      }
    }
  }, [propOnClose, navigate]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Normalisation du rôle
  const normalizeRole = (role) => {
    if (!role) return null;
    let normalized = String(role).toUpperCase().trim();
    if (normalized.startsWith("ROLE_")) {
      normalized = normalized.substring(5);
    }
    return normalized;
  };

  // Vérification du rôle technicien / admin
  const isTechnicianRole = (role) => {
    const normalized = normalizeRole(role);
    return (
      normalized === "TECHNICIEN" ||
      normalized === "ADMIN" ||
      normalized === "ADMINISTRATEUR"
    );
  };

  // Décoder le JWT
  const decodeJWT = (token) => {
    try {
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Erreur décodage JWT :", err);
      return null;
    }
  };

  // Extraction du rôle au chargement du composant
  useEffect(() => {
    const getRole = () => {
      const token = localStorage.getItem("token");
      const storedRole =
        localStorage.getItem("userRole") ||
        localStorage.getItem("role") ||
        sessionStorage.getItem("userRole");

      if (token) {
        const payload = decodeJWT(token);
        let jwtRole = null;

        if (payload) {
          if (payload.role) jwtRole = payload.role;
          else if (Array.isArray(payload.roles)) jwtRole = payload.roles[0];
          else if (Array.isArray(payload.authorities)) jwtRole = payload.authorities[0];
        }

        const normalizedJWT = normalizeRole(jwtRole);
        if (normalizedJWT) {
          setUserRole(normalizedJWT);
          setIsTechnician(isTechnicianRole(normalizedJWT));
          return;
        }
      }

      if (storedRole) {
        const normalizedRole = normalizeRole(storedRole);
        setUserRole(normalizedRole);
        setIsTechnician(isTechnicianRole(normalizedRole));
      } else {
        setUserRole(null);
        setIsTechnician(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };

    getRole();
    fetchCategories();
  }, []);

  // Récupérer les détails du ticket
  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Session introuvable");

      const response = await axios.get(`${API_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTicket(response.data);
    } catch (err) {
      console.error("Erreur chargement ticket :", err);
      setError(
        err.response?.data?.message || "Impossible de charger les détails du ticket."
      );
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Récupérer les commentaires
  const fetchComments = useCallback(async () => {
    if (!ticketId) return;
    setCommentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token absent");

      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(response.data || []);
    } catch (err) {
      console.error("Erreur chargement commentaires :", err);
      if (err.response?.status === 403) setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [ticketId]);

  // Charger les données du ticket et des commentaires à l'ouverture
  useEffect(() => {
    if (!isOpen || !ticketId) return;
    fetchTicketDetails();
    fetchComments();
  }, [isOpen, ticketId, fetchTicketDetails, fetchComments]);

  // Ajouter un commentaire
  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("error", "Vous devez être connecté.");
        return;
      }

      await axios.post(
        `${API_URL}/tickets/${ticketId}/comments`,
        {
          contenu: newComment.trim(),
          estInterne: isInternal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNewComment("");
      setIsInternal(false);
      await fetchComments();
      showToast("success", "Commentaire publié avec succès !");
    } catch (err) {
      console.error("Erreur ajout commentaire :", err);
      showToast(
        "error",
        err.response?.data?.message || "Erreur lors de l'ajout du commentaire."
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // S'assigner le ticket : Appel /assigner?techId={id}
  const handleAssignToMe = async () => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!token) {
        showToast("error", "Vous n'êtes pas authentifié.");
        return;
      }

      if (!isTechnician) {
        showToast("error", `Action réservée aux techniciens. Rôle : ${userRole || "inconnu"}`);
        return;
      }

      let currentUserId = storedUserId;
      if (!currentUserId && token) {
        const payload = decodeJWT(token);
        currentUserId = payload?.id || payload?.userId || payload?.sub;
      }

      if (!currentUserId) {
        showToast("error", "Impossible de déterminer votre identifiant utilisateur.");
        return;
      }

      await axios.put(
        `${API_URL}/tickets/${ticketId}/assigner?techId=${currentUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Ticket assigné avec succès à votre compte !");
      if (onUpdate) onUpdate();
      await fetchTicketDetails();
    } catch (err) {
      console.error("Erreur assignation :", err);
      if (err.response?.status === 403) {
        showToast("error", "Refus backend (403) : permissions insuffisantes.");
        return;
      }
      showToast("error", err.response?.data?.message || "Erreur lors de l'assignation.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Changer le statut : Appel /statut?statutTicket={statut}
  const handleChangeStatus = async (newStatus) => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("error", "Vous n'êtes pas authentifié.");
        return;
      }

      await axios.put(
        `${API_URL}/tickets/${ticketId}/statut?statutTicket=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", `Statut mis à jour : ${getStatusLabel(newStatus)}`);
      if (onUpdate) onUpdate();
      await fetchTicketDetails();
    } catch (err) {
      console.error("Erreur changement statut :", err);
      if (err.response?.status === 403) {
        showToast("error", "Le serveur refuse la modification de statut (403).");
        return;
      }
      showToast(
        "error",
        err.response?.data?.message || "Erreur lors de la modification du statut."
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Non défini";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NOUVEAU":
        return "modal-status-new";
      case "EN_COURS":
      case "EN_ATTENTE":
        return "modal-status-inprogress";
      case "RESOLU":
        return "modal-status-resolved";
      case "CLOTURE":
        return "modal-status-closed";
      default:
        return "modal-status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "NOUVEAU":
        return AlertCircle;
      case "EN_COURS":
      case "EN_ATTENTE":
        return Clock;
      case "RESOLU":
        return CheckCircle2;
      case "CLOTURE":
        return Lock;
      default:
        return Info;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      NOUVEAU: "Nouveau",
      EN_COURS: "En cours",
      EN_ATTENTE: "En attente",
      RESOLU: "Résolu",
      CLOTURE: "Clôturé",
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "HAUTE":
        return "Haute";
      case "MOYENNE":
        return "Moyenne";
      case "BASSE":
      default:
        return "Faible";
    }
  };

  const getCategoryName = () => {
    if (!ticket) return "Non définie";
    if (ticket.categorieNom) return ticket.categorieNom;
    if (ticket.categorie?.nom) return ticket.categorie.nom;
    if (ticket.categorieId) {
      const found = categories.find((c) => String(c.id) === String(ticket.categorieId));
      if (found?.nom) return found.nom;
      return `Catégorie #${ticket.categorieId}`;
    }
    return "Général";
  };

  if (!isOpen) return null;

  const ticketStatus = ticket ? (ticket.status || ticket.statut || "NOUVEAU") : "NOUVEAU";
  const StatusIconComponent = getStatusIcon(ticketStatus);

  return (
    <div className="ticket-modal-backdrop" onClick={handleClose}>
      <div
        className="ticket-modal-card animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="ticket-modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon-box">
              <Wrench className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="modal-header-title-row">
                <h2 className="modal-header-title">
                  Ticket #{String(ticket?.id || ticketId).padStart(4, "0")}
                </h2>
                {ticket && (
                  <span className={`modal-status-badge ${getStatusClass(ticketStatus)}`}>
                    <StatusIconComponent className="w-3.5 h-3.5" />
                    <span>{getStatusLabel(ticketStatus)}</span>
                  </span>
                )}
              </div>
              <p className="modal-header-subtitle">
                Centre de suivi et d'intervention d'incident
              </p>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Fermer la fenêtre (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Modal Toast Banner */}
        {toast && (
          <div className={`modal-toast-banner ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span className="toast-text">{toast.message}</span>
            <button
              className="toast-close-btn"
              onClick={() => setToast(null)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="ticket-modal-body">
          {loading && (
            <div className="modal-loading-state">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="loading-text">Chargement des données du ticket...</p>
            </div>
          )}

          {error && (
            <div className="modal-error-state">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <h4 className="error-title">Erreur de chargement</h4>
              <p className="error-desc">{error}</p>
              <button onClick={fetchTicketDetails} className="btn-modal-retry">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          {!loading && !error && ticket && (
            <>
              {/* Ticket Details Box */}
              <div className="ticket-details-box">
                <h3 className="ticket-view-title">{ticket.titre || "Sans titre"}</h3>
                <p className="ticket-view-desc">
                  {ticket.description || "Aucune description fournie."}
                </p>

                {/* Metadata Grid */}
                <div className="ticket-meta-grid">
                  {/* Category */}
                  <div className="meta-card">
                    <div className="meta-card-header">
                      <Folder className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Catégorie</span>
                    </div>
                    <span className="meta-card-val category-tag">
                      {getCategoryName()}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="meta-card">
                    <div className="meta-card-header">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Priorité</span>
                    </div>
                    <span className={`meta-card-val priority-tag priority-${(ticket.priorite || ticket.priority || 'MOYENNE').toLowerCase()}`}>
                      {getPriorityLabel(ticket.priorite || ticket.priority)}
                    </span>
                  </div>

                  {/* Creator */}
                  <div className="meta-card">
                    <div className="meta-card-header">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Créé par</span>
                    </div>
                    <span className="meta-card-val font-semibold">
                      {ticket.createur?.nom ||
                        ticket.createur?.email ||
                        (ticket.createurId ? `Utilisateur #${ticket.createurId}` : "Inconnu")}
                    </span>
                  </div>

                  {/* Assigned Tech */}
                  <div className="meta-card">
                    <div className="meta-card-header">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Assigné à</span>
                    </div>
                    <span className="meta-card-val">
                      {ticket.technicien?.nom ||
                        ticket.technicien?.email ||
                        (ticket.technicienId ? `Technicien #${ticket.technicienId}` : "Non assigné")}
                    </span>
                  </div>

                  {/* Date Creation */}
                  <div className="meta-card col-span-full">
                    <div className="meta-card-header">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date d'enregistrement</span>
                    </div>
                    <span className="meta-card-val text-xs text-slate-500">
                      {formatDate(ticket.dateCreation)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Controls (if user has Technician/Admin role) */}
              {isTechnician && (
                <div className="modal-technician-panel">
                  <div className="panel-header">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="panel-title">Panneau d'Intervention Technicien</span>
                    </div>
                    <span className="panel-badge">{userRole}</span>
                  </div>

                  <div className="panel-actions-row">
                    {!ticket.technicien && !ticket.technicienId ? (
                      <button
                        onClick={handleAssignToMe}
                        className="btn-action-primary"
                        disabled={isActionLoading}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>S'assigner ce ticket</span>
                      </button>
                    ) : (
                      <div className="assigned-status-chip">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>
                          Pris en charge par :{" "}
                          <strong>
                            {ticket.technicien?.nom ||
                              ticket.technicien?.email ||
                              `Tech #${ticket.technicienId}`}
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="status-button-group">
                      <button
                        onClick={() => handleChangeStatus("EN_COURS")}
                        className={`btn-state btn-state-progress ${ticketStatus === "EN_COURS" ? "active-state" : ""}`}
                        disabled={isActionLoading || ticketStatus === "EN_COURS"}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>En cours</span>
                      </button>

                      <button
                        onClick={() => handleChangeStatus("RESOLU")}
                        className={`btn-state btn-state-resolved ${ticketStatus === "RESOLU" ? "active-state" : ""}`}
                        disabled={isActionLoading || ticketStatus === "RESOLU"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Résolu</span>
                      </button>

                      <button
                        onClick={() => handleChangeStatus("CLOTURE")}
                        className={`btn-state btn-state-closed ${ticketStatus === "CLOTURE" ? "active-state" : ""}`}
                        disabled={isActionLoading || ticketStatus === "CLOTURE"}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Clôturer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Collaborative Comments Section */}
              <div className="modal-comments-section">
                <div className="comments-section-header">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h4 className="comments-heading">
                      Historique des échanges ({comments.length})
                    </h4>
                  </div>
                  <button
                    className="btn-comments-refresh"
                    onClick={fetchComments}
                    title="Actualiser les messages"
                    disabled={commentsLoading}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${commentsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {commentsLoading && (
                  <div className="comments-loading-box">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span>Chargement des commentaires...</span>
                  </div>
                )}

                {!commentsLoading && comments.length === 0 && (
                  <div className="no-comments-box">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-1" />
                    <p>Aucun commentaire publié pour l'instant.</p>
                  </div>
                )}

                {!commentsLoading && comments.length > 0 && (
                  <div className="comments-feed">
                    {comments.map((comment) => {
                      const isInternalNote =
                        comment.estInterne || comment.isInternal || comment.internal;

                      return (
                        <div
                          key={comment.id}
                          className={`comment-bubble ${isInternalNote ? "is-internal-note" : ""}`}
                        >
                          <div className="comment-bubble-header">
                            <div className="author-info">
                              <div className="author-avatar">
                                <User className="w-3.5 h-3.5 text-slate-600" />
                              </div>
                              <span className="author-name">
                                {comment.auteurNom || comment.auteur?.nom || "Utilisateur"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isInternalNote && (
                                <span className="internal-badge">
                                  <Lock className="w-3 h-3" />
                                  Note interne
                                </span>
                              )}
                              <span className="comment-timestamp">
                                {formatDate(comment.datePublication || comment.dateCreation)}
                              </span>
                            </div>
                          </div>

                          <p className="comment-message-text">
                            {comment.contenu || comment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comment Input Form */}
                <form className="comment-composer-box" onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un message ou une note sur ce ticket..."
                    rows={3}
                    className="composer-textarea"
                    disabled={isSubmittingComment}
                  />

                  <div className="composer-footer">
                    {isTechnician && (
                      <label className="composer-internal-checkbox">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          disabled={isSubmittingComment}
                        />
                        <span>Note interne (réservée aux techniciens)</span>
                      </label>
                    )}

                    <button
                      type="submit"
                      className="btn-send-comment"
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Envoyer</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="ticket-modal-footer">
          <button className="btn-modal-dismiss" onClick={handleClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;