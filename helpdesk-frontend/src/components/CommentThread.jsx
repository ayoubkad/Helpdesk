import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import "./CommentThread.css";

function CommentThread({ ticketId }) {
  const { userRole } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Only Technicien and Admin can create internal notes
  const canCreateInternalNote =
    userRole === "TECHNICIEN" || userRole === "ADMIN";

  const getComments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/tickets/${ticketId}/comments`
      );

      setComments(response.data);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des commentaires :",
        err
      );

      setError("Impossible de charger les commentaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      getComments();
    }
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Veuillez écrire un commentaire.");
      return;
    }

    const internalValue = canCreateInternalNote
      ? isInternal
      : false;

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        `/api/tickets/${ticketId}/comments`,
        {
          contenu: content.trim(),
          estInterne: internalValue,
        }
      );

      setComments((prevComments) => [
        ...prevComments,
        response.data,
      ]);

      setContent("");
      setIsInternal(false);
    } catch (err) {
      console.error(
        "Erreur lors de l'ajout du commentaire :",
        err
      );

      setError("Impossible d'ajouter le commentaire.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comment-thread">

      <h3 className="comment-title">
        Commentaires
      </h3>

      {loading && (
        <p>Chargement des commentaires...</p>
      )}

      {!loading && comments.length === 0 && (
        <p>Aucun commentaire pour le moment.</p>
      )}

      {!loading && comments.length > 0 && (
        <div className="comments-list">

          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-card ${
                comment.estInterne
                  ? "internal-comment"
                  : ""
              }`}
            >

              <div className="comment-header">

                <strong>
                  {comment.auteurNom || "Utilisateur"}
                </strong>

                {comment.estInterne && (
                  <span className="internal-badge">
                    🔒 Note interne
                  </span>
                )}

              </div>

              <p className="comment-content">
                {comment.contenu}
              </p>

            </div>
          ))}

        </div>
      )}

      {error && (
        <p className="comment-error">
          {error}
        </p>
      )}

      <form
        className="comment-form"
        onSubmit={handleSubmit}
      >

        <textarea
          className="comment-textarea"
          placeholder="Écrire un commentaire..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={sending}
          rows={4}
        />

        {canCreateInternalNote && (
          <label className="internal-checkbox">

            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) =>
                setIsInternal(e.target.checked)
              }
              disabled={sending}
            />

            Note interne

          </label>
        )}

        <button
          type="submit"
          className="comment-submit"
          disabled={sending || !content.trim()}
        >
          {sending ? "Envoi..." : "Ajouter"}
        </button>

      </form>

    </div>
  );
}

export default CommentThread;