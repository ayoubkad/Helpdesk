import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import CommentThread from "../components/CommentThread";

function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/tickets/${ticketId}`);

        setTicket(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement du ticket :", err);
        setError("Impossible de charger le ticket.");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="p-8">
        Chargement du ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8">
        Ticket introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Retour
        </button>

        {/* Informations du ticket */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            {ticket.titre}
          </h1>

          <p className="text-slate-600 mb-5">
            {ticket.description || "Aucune description."}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">

            <span className="px-3 py-1 bg-slate-100 rounded-lg">
              Priorité : {ticket.priorite}
            </span>

            <span className="px-3 py-1 bg-slate-100 rounded-lg">
              Statut : {ticket.status || ticket.statut}
            </span>

          </div>

        </div>

        {/* Commentaires */}
        <CommentThread ticketId={ticketId} />

      </div>
    </div>
  );
}

export default TicketDetails;