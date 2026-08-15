import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Send,
  PlusCircle,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

function CreateTicket() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    priorite: "MOYENNE",
    categorieId: ""
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };
    fetchCategories();
  }, []);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const priorities = [
    {
      id: "BASSE",
      label: "Faible",
      desc: "Impact mineur / demande générale",
      color: "text-emerald-700 bg-emerald-50 border-emerald-300 ring-emerald-500/20"
    },
    {
      id: "MOYENNE",
      label: "Moyenne",
      desc: "Problème fonctionnel standard",
      color: "text-amber-700 bg-amber-50 border-amber-300 ring-amber-500/20"
    },
    {
      id: "HAUTE",
      label: "Haute",
      desc: "Blocage critique ou urgent",
      color: "text-red-700 bg-red-50 border-red-300 ring-red-500/20"
    }
  ];

  const validateField = (name, value) => {
    let error = "";
    const trimmed = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "titre":
        if (!trimmed) {
          error = "Le titre du ticket est requis";
        } else if (trimmed.length < 4) {
          error = "Le titre doit comporter au moins 4 caractères";
        }
        break;
      case "description":
        if (!trimmed) {
          error = "La description du problème est requise";
        } else if (trimmed.length < 10) {
          error = "Veuillez fournir au moins 10 caractères pour bien décrire le problème";
        }
        break;
      case "priorite":
        if (!trimmed) {
          error = "Veuillez sélectionner un niveau de priorité";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value
    };
    setFormData(updated);

    if (status.type) {
      setStatus({ type: null, message: "" });
    }

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handlePrioritySelect = (pId) => {
    setFormData((prev) => ({ ...prev, priorite: pId }));
    setTouched((prev) => ({ ...prev, priorite: true }));
    setErrors((prev) => ({ ...prev, priorite: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    setTouched({
      titre: true,
      description: true,
      priorite: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (!validateForm()) {
      setStatus({
        type: "error",
        message: "Veuillez remplir correctement tous les champs obligatoires."
      });
      return;
    }

    setLoading(true);

    try {
      const currentUserId = userId || localStorage.getItem("userId") || 1;

      const response = await api.post(
        `/api/tickets?createurId=${currentUserId}`,
        {
          titre: formData.titre.trim(),
          description: formData.description.trim(),
          priorite: formData.priorite,
          categorieId: formData.categorieId ? Number(formData.categorieId) : null
        }
      );

      console.log("Ticket créé avec succès :", response.data);

      setStatus({
        type: "success",
        message: `Le ticket n° ${response.data.id || ""} a été créé avec succès !`
      });

      // Réinitialiser le formulaire
      setFormData({
        titre: "",
        description: "",
        priorite: "MOYENNE",
        categorieId: ""
      });
      setTouched({});
      setErrors({});

    } catch (error) {
      console.error("Erreur lors de la création du ticket :", error);
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Erreur lors de la création du ticket. Vérifiez votre connexion et vos permissions.";
      setStatus({
        type: "error",
        message: typeof serverMsg === "string" ? serverMsg : "Erreur serveur lors de la création."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Navigation back button */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Dashboard</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 sm:px-10 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner mb-3 border border-white/20">
                <PlusCircle className="w-7 h-7 text-white stroke-[2.2]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Créer un nouveau ticket
              </h1>
              <p className="mt-1.5 text-blue-100 text-sm max-w-md">
                Décrivez votre problème en détail pour une prise en charge rapide par notre équipe technique.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-10">
            
            {/* Error banner */}
            {status.type === "error" && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{status.message}</div>
              </div>
            )}

            {/* Success banner */}
            {status.type === "success" && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 animate-fadeIn">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-sm text-left">
                    <p className="font-bold text-emerald-950">Succès !</p>
                    <p className="text-emerald-800 mt-0.5">{status.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-colors"
                  >
                    <span>Voir le Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* Titre */}
              <div>
                <label htmlFor="titre" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre du ticket <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    value={formData.titre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Problème d'accès à l'application ou panne réseau"
                    className={`block w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                      errors.titre && touched.titre
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : touched.titre && !errors.titre && formData.titre
                        ? "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    }`}
                  />
                </div>
                {errors.titre && touched.titre && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.titre}
                  </p>
                )}
              </div>
              {/* Catégorie */}
              <div>
                <label htmlFor="categorieId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catégorie
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    id="categorieId"
                    name="categorieId"
                    value={formData.categorieId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-8 py-2.5 sm:py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none text-slate-900"
                  >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Décrivez les étapes du problème, les messages d'erreur éventuels..."
                  className={`block w-full px-3.5 py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                    errors.description && touched.description
                      ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : touched.description && !errors.description && formData.description
                      ? "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                ></textarea>
                {errors.description && touched.description && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Priorité d'intervention <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {priorities.map((p) => {
                    const isSelected = formData.priorite === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePrioritySelect(p.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                          isSelected
                            ? `${p.color} ring-2 shadow-sm font-semibold`
                            : "border-slate-200 bg-slate-50/40 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{p.label}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/70 border border-current/20">
                            {p.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug font-normal">
                          {p.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Création du ticket en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Créer le ticket</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateTicket;