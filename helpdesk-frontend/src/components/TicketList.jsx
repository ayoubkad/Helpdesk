import React, { useState, useEffect } from "react";
import api from "../services/api";
import TicketCard from "./TicketCard";
import { Inbox, RotateCcw } from "lucide-react";

function TicketList({
  tickets: parentTickets,
  loading: parentLoading,
  onSelectTicket,
  onResetFilters
}) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="h-5 w-24 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-100 rounded-full ml-auto animate-pulse"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-100 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-slate-100 rounded-md mb-1 animate-pulse"></div>
              <div className="h-4 w-2/3 bg-slate-100 rounded-md mb-4 animate-pulse"></div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-100 rounded-md animate-pulse"></div>
              <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          <Inbox className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-slate-800">Aucun ticket trouvé</h4>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-4">
          Vous n'avez pas encore de ticket enregistré ou aucun ticket ne correspond à vos filtres actuels.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id || Math.random()}
          ticket={ticket}
          onSelect={onSelectTicket}
        />
      ))}
    </div>
  );
}

export default TicketList;