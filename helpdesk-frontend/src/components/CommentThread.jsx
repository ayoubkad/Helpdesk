import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import { MessageSquare, Send, Lock, User, Loader2 } from "lucide-react";
import "./CommentThread.css";

function CommentThread({ ticketId }) {
  const { userRole } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const canCreateInternalNote =
    userRole === "TECHNICIEN" || userRole === "ADMIN";

  const getComments = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/tickets/${ticketId}/comments`);
      setComments(response.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des commentaires :", err);
      setError("Impossible de charger les commentaires.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    getComments();
  }, [getComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Veuillez écrire un commentaire.");
      return;
    }

    const internalValue = canCreateInternalNote ? isInternal : false;

    try {
      setSending(true);
      setError("");

      const response = await api.post(`/api/tickets/${ticketId}/comments`, {
        contenu: content.trim(),
        estInterne: internalValue,
      });

      setComments((prevComments) => [...prevComments, response.data]);
      setContent("");
      setIsInternal(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
      setError("Impossible d'ajouter le commentaire.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comment-thread-container">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Commentaires ({comments.length})
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-medium">Chargement des commentaires...</span>
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-xs text-slate-500 py-4 text-center">
          Aucun commentaire pour le moment. Soyez le premier à répondre !
        </p>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                comment.estInterne
                  ? "bg-amber-50/70 border-amber-200 text-amber-950"
                  : "bg-white border-slate-200/80 text-slate-800 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User className="w-3 h-3" />
                  </div>
                  <span>{comment.auteurNom || "Utilisateur"}</span>
                </div>
                {comment.estInterne && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    <Lock className="w-2.5 h-2.5" />
                    Note interne
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap">{comment.contenu}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mb-3 font-medium">{error}</p>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none text-slate-800 placeholder:text-slate-400"
          placeholder="Écrire une réponse ou observation..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={sending}
          rows={3}
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          {canCreateInternalNote && (
            <label className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={sending}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Note interne</span>
            </label>
          )}

          <button
            type="submit"
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            disabled={sending || !content.trim()}
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Envoyer</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentThread;