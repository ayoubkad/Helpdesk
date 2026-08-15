import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Calendar,
  Layers,
  ChevronRight,
  User,
  Flame,
  UserCheck
} from "lucide-react";

function TicketCard({ ticket, onSelect }) {
  const getPriorityBadge = (priorite) => {
    switch (priorite) {
      case "HAUTE":
        return {
          label: "Haute",
          icon: Flame,
          className: "bg-red-50 text-red-700 border-red-200"
        };
      case "MOYENNE":
        return {
          label: "Moyenne",
          icon: null,
          className: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "BASSE":
      default:
        return {
          label: "Faible",
          icon: null,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLU":
      case "CLOTURE":
        return {
          label: status === "CLOTURE" ? "Clôturé" : "Résolu",
          icon: CheckCircle2,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "EN_COURS":
      case "EN_ATTENTE":
        return {
          label: status === "EN_ATTENTE" ? "En attente" : "En cours",
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
  const PriorityIcon = priorityBadge.icon;
  const statusBadge = getStatusBadge(ticket.status || ticket.statut);
  const StatusIcon = statusBadge.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Aujourd'hui";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const creatorName =
    ticket.createur?.nom ||
    ticket.createur?.email ||
    (ticket.createurId ? `Utilisateur #${ticket.createurId}` : null);

  const handleClick = () => {
    if (onSelect) {
      onSelect(ticket.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              #{String(ticket.id || 0).padStart(4, "0")}
            </span>
            {(ticket.categorieNom || ticket.categorie?.nom) && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{ticket.categorieNom || ticket.categorie?.nom}</span>
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${priorityBadge.className}`}
            >
              {PriorityIcon && <PriorityIcon className="w-3 h-3" />}
              <span>{priorityBadge.label}</span>
            </span>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusBadge.className}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusBadge.label}</span>
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {ticket.titre}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {ticket.description || "Aucune description fournie."}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(ticket.dateCreation || ticket.date)}</span>
          </div>
          {creatorName && (
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[120px] truncate">{creatorName}</span>
            </div>
          )}
          {ticket.technicien && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{ticket.technicien.nom || "Tech assigné"}</span>
            </div>
          )}
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          <span>Détails</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export default TicketCard;