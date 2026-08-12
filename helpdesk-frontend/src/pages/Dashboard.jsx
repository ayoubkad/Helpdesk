import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";
import TicketList from "../components/TicketList";
import {
  Plus,
  Search,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  ListTodo,
  FileText,
  AlertCircle,
  X,
  Send,
  Loader2,
  LogOut,
  ShieldCheck,
  Tag,
  Sparkles,
  Inbox,
  Filter
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { userId, userEmail, userRole, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal State for Ticket Creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    priorite: "MOYENNE",
    categorieId: ""
  });
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const priorities = [
    {
      id: "BASSE",
      label: "Faible",
      desc: "Demande standard",
      color: "text-emerald-700 bg-emerald-50 border-emerald-300 ring-emerald-500/20"
    },
    {
      id: "MOYENNE",
      label: "Moyenne",
      desc: "Problème courant",
      color: "text-amber-700 bg-amber-50 border-amber-300 ring-amber-500/20"
    },
    {
      id: "HAUTE",
      label: "Haute",
      desc: "Urgence / bloquant",
      color: "text-red-700 bg-red-50 border-red-300 ring-red-500/20"
    }
  ];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/tickets");
      setTickets(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
  try {
    const response = await api.get("/api/categories");
    setCategories(response.data);
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
  }
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) {
      errors.titre = "Le titre est obligatoire";
    } else if (formData.titre.trim().length < 4) {
      errors.titre = "Le titre doit comporter au moins 4 caractères";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Veuillez fournir au moins 10 caractères pour la description";
    }

    if (!formData.priorite) {
      errors.priorite = "Veuillez choisir une priorité";
    }
    if (!formData.categorieId) {
      errors.categorieId = "Veuillez choisir une catégorie";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ticket creation handler directly inside Dashboard
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: "" });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const currentUserId = userId || localStorage.getItem("userId") || 1;

      const response = await api.post(
        `/api/tickets?createurId=${currentUserId}`,
        {
          titre: formData.titre.trim(),
          description: formData.description.trim(),
          priorite: formData.priorite,
          categorieId: formData.categorieId
        }
      );

      console.log("Nouveau ticket créé :", response.data);

      // Add newly created ticket to the top of list
      setTickets((prev) => [response.data, ...prev]);

      setFeedback({
        type: "success",
        message: "Ticket créé avec succès !"
      });

      // Reset form
      setFormData({
        titre: "",
        description: "",
        priorite: "MOYENNE",
        categorieId: ""
      });
      setFormErrors({});

      // Close modal after brief delay or keep open with success confirmation
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback({ type: null, message: "" });
      }, 1200);

    } catch (error) {
      console.error("Erreur lors de la création du ticket :", error);
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Une erreur est survenue lors de la création du ticket.";
      setFeedback({
        type: "error",
        message: typeof serverMsg === "string" ? serverMsg : "Erreur serveur lors de la création."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Real-time statistics computed from actual tickets
  const totalCount = tickets.length;
  const enAttenteCount = tickets.filter(
    (t) => (t.status || t.statut) === "NOUVEAU" || (t.status || t.statut) === "EN_ATTENTE"
  ).length;
  const enCoursCount = tickets.filter(
    (t) => (t.status || t.statut) === "EN_COURS"
  ).length;
  const resolusCount = tickets.filter(
    (t) => (t.status || t.statut) === "RESOLU" || (t.status || t.statut) === "CLOTURE"
  ).length;

  // Filtered tickets based on search and status
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      (t.titre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const tStatus = t.status || t.statut || "NOUVEAU";
    if (filterStatus === "ALL") return matchSearch;
    if (filterStatus === "EN_ATTENTE")
      return matchSearch && (tStatus === "NOUVEAU" || tStatus === "EN_ATTENTE");
    if (filterStatus === "EN_COURS")
      return matchSearch && tStatus === "EN_COURS";
    if (filterStatus === "RESOLU")
      return matchSearch && (tStatus === "RESOLU" || tStatus === "CLOTURE");

    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Helpdesk<span className="text-indigo-600">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {userRole || "Portail"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden md:inline-block text-xs font-medium text-slate-500">
                {userEmail}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouveau ticket</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Consultez, gérez et créez vos tickets de support technique en temps réel.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer sm:hidden"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Créer un ticket</span>
          </button>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setFilterStatus("ALL")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Tickets</span>
              <LayoutDashboard className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("EN_ATTENTE")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "EN_ATTENTE"
                ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>En attente</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{enAttenteCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("EN_COURS")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "EN_COURS"
                ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>En cours</span>
              <ListTodo className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{enCoursCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("RESOLU")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "RESOLU"
                ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Résolus</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{resolusCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, titre, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden md:inline">
              Filtrer :
            </span>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tous ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus("EN_ATTENTE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                filterStatus === "EN_ATTENTE"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              En attente ({enAttenteCount})
            </button>
            <button
              onClick={() => setFilterStatus("EN_COURS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                filterStatus === "EN_COURS"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              En cours ({enCoursCount})
            </button>
            <button
              onClick={() => setFilterStatus("RESOLU")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                filterStatus === "RESOLU"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Résolus ({resolusCount})
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Tickets récents ({filteredTickets.length})
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un ticket</span>
          </button>
        </div>

        <TicketList tickets={filteredTickets} loading={loading} />

      </main>

      {/* =================================================================== */}
      {/* INTEGRATED CREATE TICKET MODAL INSIDE DASHBOARD */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden transition-all duration-300">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nouveau Ticket</h3>
                  <p className="text-xs text-blue-100">Déposer un incident ou une demande de support</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6">
              
              {/* Feedback messages */}
              {feedback.type === "error" && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{feedback.message}</span>
                </div>
              )}

              {feedback.type === "success" && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4" noValidate>
                
                {/* Titre */}
                <div>
                  <label htmlFor="modal-titre" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Titre du problème <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-titre"
                    type="text"
                    placeholder="Ex: Problème d'imprimante ou accès réseau"
                    value={formData.titre}
                    onChange={(e) => {
                      setFormData({ ...formData, titre: e.target.value });
                      if (formErrors.titre) setFormErrors({ ...formErrors, titre: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 outline-none text-slate-900 placeholder:text-slate-400 transition-all ${
                      formErrors.titre
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    }`}
                  />
                  {formErrors.titre && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.titre}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="modal-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description détaillée <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="modal-desc"
                    rows="3"
                    placeholder="Précisez le problème rencontré..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description) setFormErrors({ ...formErrors, description: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 outline-none text-slate-900 placeholder:text-slate-400 transition-all ${
                      formErrors.description
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    }`}
                  ></textarea>
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau de priorité <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {priorities.map((p) => {
                      const isSelected = formData.priorite === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, priorite: p.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? `${p.color} ring-2 font-bold shadow-xs`
                              : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                            {p.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Catégorie */}
                <div>
                <label
                    htmlFor="modal-categorie"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                    Catégorie <span className="text-red-500">*</span>
                </label>

                <select
                    id="modal-categorie"
                    value={formData.categorieId}
                    onChange={(e) =>
                    setFormData({
                        ...formData,
                        categorieId: e.target.value
                    })
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-none text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="">Choisir une catégorie</option>

                    {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.nom}
                    </option>
                    ))}
                </select>
                {formErrors.categorieId && (
                    <p className="mt-1 text-xs text-red-600">
                        {formErrors.categorieId}
                    </p>
                )}
                </div>

                {/* Modal Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Créer le ticket</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;