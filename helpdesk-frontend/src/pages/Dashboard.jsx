import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";
import TicketList from "../components/TicketList";
import TicketDetailsModal from "../components/TicketDetailsModal";
import { getCurrentUserId } from "../utils/ticketDisplay";
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
  RotateCcw,
  RefreshCw,
  Folder,
  SlidersHorizontal,
  Flame
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { userId, userEmail, userRole, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  // Details Modal State
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Creation Modal State
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

  const fetchTickets = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const currentUserId = getCurrentUserId(userId);

      // Le dashboard utilisateur ne doit jamais appeler l'endpoint global.
      if (!currentUserId) {
        setTickets([]);
        return;
      }

      const response = await api.get(`/api/tickets/user/${encodeURIComponent(currentUserId)}`);
      setTickets(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories :", error);
    }
  }, []);

  useEffect(() => {
    if (!getCurrentUserId(userId)) return;
    fetchTickets();
    fetchCategories();
  }, [userId, fetchTickets, fetchCategories]);

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
      errors.description = "La description doit comporter au moins 10 caractères";
    }

    if (!formData.categorieId) {
      errors.categorieId = "Veuillez sélectionner une catégorie";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    try {
      const payload = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        priorite: formData.priorite,
        categorieId: Number(formData.categorieId)
      };

      const currentUserId = userId || localStorage.getItem("userId");
      const url = currentUserId ? `/api/tickets?createurId=${currentUserId}` : "/api/tickets";

      await api.post(url, payload);
      await fetchTickets(true);

      setFeedback({
        type: "success",
        message: "Ticket créé avec succès !"
      });

      setFormData({
        titre: "",
        description: "",
        priorite: "MOYENNE",
        categorieId: ""
      });
      setFormErrors({});

      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback({ type: null, message: "" });
      }, 1000);
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

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicketId(null);
    fetchTickets(true);
  };

  const handleResetFilters = () => {
    setFilterStatus("ALL");
    setFilterCategory("ALL");
    setFilterPriority("ALL");
    setSearchQuery("");
  };

  // Real-time statistics
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

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      !searchQuery.trim() ||
      (t.titre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.id).includes(searchQuery);

    const tStatus = t.status || t.statut || "NOUVEAU";
    let matchStatus = true;
    if (filterStatus === "EN_ATTENTE") {
      matchStatus = tStatus === "NOUVEAU" || tStatus === "EN_ATTENTE";
    } else if (filterStatus === "EN_COURS") {
      matchStatus = tStatus === "EN_COURS";
    } else if (filterStatus === "RESOLU") {
      matchStatus = tStatus === "RESOLU" || tStatus === "CLOTURE";
    }

    const tCatId = t.categorieId || t.categorie?.id;
    const matchCat = filterCategory === "ALL" || String(tCatId) === String(filterCategory);

    const tPriority = t.priorite || t.priority || "MOYENNE";
    const matchPriority = filterPriority === "ALL" || tPriority === filterPriority;

    return matchSearch && matchStatus && matchCat && matchPriority;
  });

  const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterCategory !== "ALL" ||
    filterPriority !== "ALL" ||
    searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Helpdesk<span className="text-indigo-600">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {userRole || "UTILISATEUR"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {userEmail && (
              <span className="hidden md:inline-block text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                {userEmail}
              </span>
            )}

            <button
              onClick={() => fetchTickets(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Actualiser les tickets"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Nouveau ticket</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

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
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setFilterStatus("ALL")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-[1.01]"
                : "bg-white border-slate-200/70 shadow-xs hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Tickets</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <LayoutDashboard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("EN_ATTENTE")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "EN_ATTENTE"
                ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.01]"
                : "bg-white border-slate-200/70 shadow-xs hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>En attente</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{enAttenteCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("EN_COURS")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "EN_COURS"
                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.01]"
                : "bg-white border-slate-200/70 shadow-xs hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>En cours</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{enCoursCount}</p>
          </div>

          <div
            onClick={() => setFilterStatus("RESOLU")}
            className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              filterStatus === "RESOLU"
                ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.01]"
                : "bg-white border-slate-200/70 shadow-xs hover:border-slate-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Résolus</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{resolusCount}</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé, titre, description, #ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
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

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  filterStatus === "ALL"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tous ({totalCount})
              </button>
              <button
                onClick={() => setFilterStatus("EN_ATTENTE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  filterStatus === "EN_ATTENTE"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                En attente ({enAttenteCount})
              </button>
              <button
                onClick={() => setFilterStatus("EN_COURS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  filterStatus === "EN_COURS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                En cours ({enCoursCount})
              </button>
              <button
                onClick={() => setFilterStatus("RESOLU")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  filterStatus === "RESOLU"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Résolus ({resolusCount})
              </button>
            </div>
          </div>

          {/* Secondary Dropdown Filters Row */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative flex items-center">
                <Folder className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="relative flex items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="ALL">Toutes les priorités</option>
                  <option value="HAUTE">Priorité Haute</option>
                  <option value="MOYENNE">Priorité Moyenne</option>
                  <option value="BASSE">Priorité Faible</option>
                </select>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              <strong>{filteredTickets.length}</strong> ticket{filteredTickets.length > 1 ? "s" : ""} trouvé{filteredTickets.length > 1 ? "s" : ""}
            </div>
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

        <TicketList
          tickets={filteredTickets}
          loading={loading}
          onSelectTicket={handleSelectTicket}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* =================================================================== */}
      {/* INTEGRATED CREATE TICKET MODAL */}
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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {feedback.message && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titre du ticket <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Problème d'accès à la messagerie"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 outline-none transition-all ${
                    formErrors.titre
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                />
                {formErrors.titre && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.titre}
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  name="categorieId"
                  value={formData.categorieId}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 outline-none transition-all cursor-pointer ${
                    formErrors.categorieId
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                >
                  <option value="">Sélectionnez une catégorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
                {formErrors.categorieId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.categorieId}
                  </p>
                )}
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Niveau de priorité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => {
                    const isSelected = formData.priorite === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setFormData((prev) => ({ ...prev, priorite: p.id }))}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? `${p.color} border-current ring-2 shadow-xs`
                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className="text-xs font-bold">{p.label}</span>
                          {p.id === "HAUTE" && <Flame className="w-3 h-3 text-red-500" />}
                        </div>
                        <span className="text-[10px] text-slate-500 opacity-90 line-clamp-1">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez les symptômes, messages d'erreur et étapes pour reproduire..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50/50 outline-none transition-all resize-none ${
                    formErrors.description
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Soumettre le ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TICKET DETAILS MODAL */}
      {/* =================================================================== */}
      {isDetailsModalOpen && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          onUpdate={() => fetchTickets(true)}
        />
      )}
    </div>
  );
}

export default Dashboard;
