import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TicketDetailsModal.css";

const API_URL = "http://localhost:8081/api";

const TicketDetailsModal = ({ ticketId, isOpen, onClose, onUpdate }) => {
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userRole, setUserRole] = useState(null);
  const [isTechnician, setIsTechnician] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

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

    getRole();
  }, []);

  // Charger les données du ticket et des commentaires à l'ouverture
  useEffect(() => {
    if (!isOpen || !ticketId) return;
    fetchTicketDetails();
    fetchComments();
  }, [isOpen, ticketId]);

  // Récupérer les détails du ticket
  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token absent");

      const response = await axios.get(`${API_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTicket(response.data);
    } catch (err) {
      console.error("Erreur chargement ticket :", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement du ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les commentaires
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token absent");

      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(response.data);
    } catch (err) {
      console.error("Erreur chargement commentaires :", err);
      if (err.response?.status === 403) setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Ajouter un commentaire
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vous devez être connecté.");
        return;
      }

      await axios.post(
        `${API_URL}/tickets/${ticketId}/comments`,
        {
          content: newComment.trim(),
          isInternal: isInternal,
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
      alert("✅ Commentaire ajouté avec succès");
    } catch (err) {
      console.error("Erreur ajout commentaire :", err);
      alert(
        err.response?.data?.message || "❌ Erreur lors de l'ajout du commentaire"
      );
    }
  };

  // S'assigner le ticket : Appel /assigner?techId={id}
  const handleAssignToMe = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!token) {
        alert("❌ Vous n'êtes pas authentifié.");
        return;
      }

      if (!isTechnician) {
        alert(`❌ Vous n'avez pas les droits. Rôle : ${userRole || "inconnu"}`);
        return;
      }

      let currentUserId = storedUserId;
      if (!currentUserId && token) {
        const payload = decodeJWT(token);
        currentUserId = payload?.id || payload?.userId || payload?.sub;
      }

      if (!currentUserId) {
        alert("❌ Impossible de déterminer votre ID utilisateur.");
        return;
      }

      await axios.put(
        `${API_URL}/tickets/${ticketId}/assigner?techId=${currentUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Ticket assigné avec succès !");
      if (onUpdate) onUpdate();
      await fetchTicketDetails();
    } catch (err) {
      console.error("Erreur assignation :", err);
      if (err.response?.status === 403) {
        alert("❌ Refus backend (403). Le token JWT ne contient pas le rôle TECHNICIEN.");
        return;
      }
      alert(err.response?.data?.message || "❌ Erreur lors de l'assignation");
    }
  };

  // Changer le statut : Appel /statut?statutTicket={statut}
  const handleChangeStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Vous n'êtes pas authentifié.");
        return;
      }

      await axios.put(
        `${API_URL}/tickets/${ticketId}/statut?statutTicket=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Statut changé en : ${getStatusLabel(newStatus)}`);
      if (onUpdate) onUpdate();
      await fetchTicketDetails();
    } catch (err) {
      console.error("Erreur changement statut :", err);
      if (err.response?.status === 403) {
        alert("❌ Le serveur refuse la modification de statut (403).");
        return;
      }
      alert(
        err.response?.data?.message || "❌ Erreur lors du changement de statut"
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Non défini";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      NOUVEAU: "status-new",
      EN_COURS: "status-inprogress",
      RESOLU: "status-resolved",
      CLOTURE: "status-closed",
    };
    return statusMap[status] || "status-default";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      NOUVEAU: "Nouveau",
      EN_COURS: "En cours",
      RESOLU: "Résolu",
      CLOTURE: "Clôturé",
    };
    return statusMap[status] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket #{ticket?.id || ticketId}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <p>Chargement du ticket...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={fetchTicketDetails} className="btn-retry-small">
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && ticket && (
            <>
              <h3 className="ticket-title">{ticket.titre || "Sans titre"}</h3>
              <p className="ticket-description">
                {ticket.description || "Aucune description"}
              </p>

              <div className="ticket-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">CATÉGORIE</span>
                  <span className="metadata-value">
                    {ticket.categorie?.nom || "Non définie"}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">CRÉÉ PAR</span>
                  <span className="metadata-value">
                    {ticket.createur?.nom ||
                      ticket.createur?.email ||
                      (ticket.createurId ? `Utilisateur #${ticket.createurId}` : "Inconnu")}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">ASSIGNÉ À</span>
                  <span className="metadata-value">
                    {ticket.technicien?.nom ||
                      ticket.technicien?.email ||
                      (ticket.technicienId ? `Technicien #${ticket.technicienId}` : "Non assigné")}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">STATUT</span>
                  <span className={`status-badge ${getStatusClass(ticket.status || ticket.statut)}`}>
                    {getStatusLabel(ticket.status || ticket.statut)}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">DATE DE CRÉATION</span>
                  <span className="metadata-value">
                    {formatDate(ticket.dateCreation)}
                  </span>
                </div>
              </div>

              {isTechnician ? (
                <div className="technician-actions">
                  <p className="technician-badge">
                    ✅ Mode Technicien ({userRole})
                  </p>

                  {!ticket.technicien && !ticket.technicienId && (
                    <button onClick={handleAssignToMe} className="btn-assign">
                      📋 S'assigner ce ticket
                    </button>
                  )}

                  {(ticket.technicien || ticket.technicienId) && (
                    <p className="assigned-info">
                      ✅ Assigné à :{" "}
                      <strong>
                        {ticket.technicien?.nom ||
                          ticket.technicien?.email ||
                          `Technicien #${ticket.technicienId}`}
                      </strong>
                    </p>
                  )}

                  <div className="status-actions">
                    <button
                      onClick={() => handleChangeStatus("EN_COURS")}
                      className="btn-status btn-inprogress"
                      disabled={ticket.status === "EN_COURS" || ticket.statut === "EN_COURS"}
                    >
                      🔄 En cours
                    </button>

                    <button
                      onClick={() => handleChangeStatus("RESOLU")}
                      className="btn-status btn-resolved"
                      disabled={ticket.status === "RESOLU" || ticket.statut === "RESOLU"}
                    >
                      ✅ Résolu
                    </button>

                    <button
                      onClick={() => handleChangeStatus("CLOTURE")}
                      className="btn-status btn-closed"
                      disabled={ticket.status === "CLOTURE" || ticket.statut === "CLOTURE"}
                    >
                      🔒 Clôturer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-access-message">
                  <p className="no-access">⛔ Vous ne pouvez pas modifier ce ticket.</p>
                  <p className="role-detected">Rôle détecté : {userRole || "Aucun"}</p>
                </div>
              )}

              <div className="comments-section">
                <h4>💬 Commentaires</h4>

                {commentsLoading && (
                  <div className="comments-loading">
                    <div className="spinner-small"></div>
                    <p>Chargement des commentaires...</p>
                  </div>
                )}

                {!commentsLoading && comments.length === 0 && (
                  <p className="no-comments">Aucun commentaire pour le moment</p>
                )}

                {!commentsLoading &&
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`comment-item ${comment.isInternal || comment.internal ? "internal" : ""}`}
                    >
                      <div className="comment-header">
                        <span className="comment-author">
                          👤 {comment.auteurNom || comment.auteur?.nom || "Inconnu"}
                        </span>
                        <span className="comment-date">
                          {formatDate(comment.datePublication || comment.dateCreation)}
                        </span>
                        {(comment.isInternal || comment.internal) && (
                          <span className="internal-badge">🔒 Note Interne</span>
                        )}
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}

                <div className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    rows="3"
                    className="comment-textarea"
                  />

                  {isTechnician && (
                    <div className="comment-options">
                      <label className="internal-checkbox">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        🔒 Note interne (visible uniquement par techniciens/admin)
                      </label>
                    </div>
                  )}

                  <button
                    onClick={handleAddComment}
                    className="btn-add-comment"
                    disabled={!newComment.trim()}
                  >
                    📤 Envoyer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;