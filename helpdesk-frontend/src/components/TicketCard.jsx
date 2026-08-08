import React from "react";
import {
  Clock,
  AlertCircle,
  Tag,
  CheckCircle2,
  Hourglass,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";

function TicketCard({ ticket }) {
  const getPriorityBadge = (priorite) => {
    switch (priorite) {
      case "HAUTE":
        return {
          label: "Haute",
          className: "bg-red-50 text-red-700 border-red-200"
        };
      case "MOYENNE":
        return {
          label: "Moyenne",
          className: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "BASSE":
      default:
        return {
          label: "Faible",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLU":
      case "CLOTURE":
        return {
          label: "Résolu",
          icon: CheckCircle2,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "EN_COURS":
      case "EN_ATTENTE":
        return {
          label: "En cours",
          icon: Hourglass,
          className: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
      case "NOUVEAU":
      default:
        return {
          label: "Nouveau",
          icon: AlertCircle,
          className: "bg-blue-50 text-blue-700 border-blue-200"
        };
    }
  };

  const priorityBadge = getPriorityBadge(ticket.priorite || ticket.priority);
  const statusBadge = getStatusBadge(ticket.status || ticket.statut);
  const StatusIcon = statusBadge.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Aujourd'hui";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            #{ticket.id || "0"}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${statusBadge.className}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusBadge.label}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${priorityBadge.className}`}
          >
            Priorité {priorityBadge.label}
          </span>
        </div>

        <div className="flex items-center text-xs text-slate-400 gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(ticket.dateCreation || ticket.date)}</span>
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
        {ticket.titre}
      </h3>

      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
        {ticket.description || "Aucune description fournie."}
      </p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {ticket.createurId && (
            <span className="bg-slate-50 px-2 py-1 rounded-md text-slate-600">
              Auteur: #{ticket.createurId}
            </span>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
        >
          <span>Détails</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default TicketCard;