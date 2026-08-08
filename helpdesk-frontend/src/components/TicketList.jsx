import React, { useState, useEffect } from "react";
import api from "../services/api";
import TicketCard from "./TicketCard";
import { Inbox, Loader2, RefreshCw } from "lucide-react";

function TicketList({ tickets: parentTickets, onRefresh, loading: parentLoading }) {
  const [internalTickets, setInternalTickets] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const fetchTickets = async () => {
    setInternalLoading(true);
    try {
      const response = await api.get("/api/tickets");
      setInternalTickets(response.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!parentTickets) {
      fetchTickets();
    }
  }, [parentTickets]);

  const tickets = parentTickets !== undefined ? parentTickets : internalTickets;
  const loading = parentLoading !== undefined ? parentLoading : internalLoading;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Chargement des tickets en cours...</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">Aucun ticket trouvé</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Vous n'avez pas encore de ticket enregistré ou aucun ticket ne correspond à vos filtres de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id || Math.random()} ticket={ticket} />
      ))}
    </div>
  );
}

export default TicketList;