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
  FolderTree,
  ArrowRight
} from "lucide-react";
import "./CreateTicket.css";

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
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const priorities = [
    {
      id: "BASSE",
      label: "Faible",
      desc: "Impact mineur / demande générale",
      color: "priority-low"
    },
    {
      id: "MOYENNE",
      label: "Moyenne",
      desc: "Problème fonctionnel standard",
      color: "priority-medium"
    },
    {
      id: "HAUTE",
      label: "Haute",
      desc: "Blocage critique ou urgent",
      color: "priority-high"
    }
  ];

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories");
        setCategories(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            categorieId: response.data[0].id.toString()
          }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        const defaultCategories = [
          { id: 1, nom: "Informatique", description: "Logiciels et outils métier" },
          { id: 2, nom: "Réseau", description: "Connexion Internet et VPN" },
          { id: 3, nom: "Matériel", description: "Équipements et périphériques" },
          { id: 4, nom: "Sécurité", description: "Accès, mots de passe et droits" },
          { id: 5, nom: "Autre", description: "Demandes diverses" }
        ];
        setCategories(defaultCategories);
        setFormData(prev => ({
          ...prev,
          categorieId: defaultCategories[0].id.toString()
        }));
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    const trimmed = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "titre":
        if (!trimmed) error = "Le titre du ticket est requis";
        else if (trimmed.length < 4) error = "Au moins 4 caractères requis";
        break;
      case "description":
        if (!trimmed) error = "La description est requise";
        else if (trimmed.length < 10) error = "Au moins 10 caractères requis";
        break;
      case "priorite":
        if (!trimmed) error = "Sélectionnez une priorité";
        break;
      case "categorieId":
        if (!value) error = "Sélectionnez une catégorie";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (status.type) setStatus({ type: null, message: "" });

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

  const handleCategorySelect = (catId) => {
    const idStr = catId.toString();
    setFormData((prev) => ({ ...prev, categorieId: idStr }));
    setTouched((prev) => ({ ...prev, categorieId: true }));
    setErrors((prev) => ({ ...prev, categorieId: "" }));
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
      priorite: true,
      categorieId: true
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

      const ticketData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        priorite: formData.priorite,
        categorieId: parseInt(formData.categorieId)
      };

      const response = await api.post(
        `/api/tickets?createurId=${currentUserId}`,
        ticketData
      );

      setStatus({
        type: "success",
        message: `Le ticket n° ${response.data.id || ""} a été créé avec succès !`
      });

      setFormData({
        titre: "",
        description: "",
        priorite: "MOYENNE",
        categorieId: categories.length > 0 ? categories[0].id.toString() : ""
      });
      setTouched({});
      setErrors({});

    } catch (error) {
      console.error("Erreur création ticket:", error);
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Erreur lors de la création du ticket.";
      setStatus({
        type: "error",
        message: typeof serverMsg === "string" ? serverMsg : "Erreur serveur."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="ticket-form-container">
        
        {/* Navigation */}
        <div className="back-nav">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Dashboard</span>
          </Link>
        </div>

        {/* Card Main */}
        <div className="ticket-card">
          
          {/* Header */}
          <div className="ticket-header">
            <div className="header-glow" />
            <div className="header-content">
              <div className="header-icon">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h1 className="header-title">Créer un nouveau ticket</h1>
              <p className="header-subtitle">
                Remplissez les informations ci-dessous pour transmettre votre demande.
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="ticket-form-body">
            
            {status.type === "error" && (
              <div className="banner-error">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="text-sm font-medium">{status.message}</div>
              </div>
            )}

            {status.type === "success" && (
              <div className="banner-success">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold shrink-0" />
                  <div>
                    <p className="font-bold text-gold">Succès !</p>
                    <p className="text-sm opacity-90">{status.message}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="btn-dashboard">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ticket-form" noValidate>
              
              {/* Titre */}
              <div className="form-group">
                <label htmlFor="titre" className="form-label">
                  Titre du ticket <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    value={formData.titre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Problème d'accès à l'application..."
                    className={`form-input ${errors.titre && touched.titre ? 'input-error' : ''}`}
                  />
                </div>
                {errors.titre && touched.titre && (
                  <p className="error-text">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.titre}
                  </p>
                )}
              </div>

              {/* Catégorie - Liste à choix unique */}
              <div className="form-group">
                <label className="form-label flex items-center justify-between">
                  <span>Catégorie du problème <span className="required">*</span></span>
                  {loadingCategories && (
                    <span className="loading-tag">
                      <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
                    </span>
                  )}
                </label>

                <div className="category-grid">
                  {categories.map((cat) => {
                    const isSelected = formData.categorieId === cat.id.toString();
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`category-card ${isSelected ? "category-selected" : ""}`}
                      >
                        <div className="category-header">
                          <FolderTree className="category-icon" />
                          <span className="category-name">{cat.nom}</span>
                        </div>
                        {cat.description && (
                          <p className="category-desc">{cat.description}</p>
                        )}
                        <div className="radio-indicator">
                          <span className="radio-dot" />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.categorieId && touched.categorieId && (
                  <p className="error-text">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.categorieId}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description détaillée <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Décrivez précisément votre problème..."
                  className={`form-textarea ${errors.description && touched.description ? 'input-error' : ''}`}
                />
                {errors.description && touched.description && (
                  <p className="error-text">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Priorité */}
              <div className="form-group">
                <label className="form-label">
                  Priorité d'intervention <span className="required">*</span>
                </label>
                <div className="priority-grid">
                  {priorities.map((p) => {
                    const isSelected = formData.priorite === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePrioritySelect(p.id)}
                        className={`priority-btn ${isSelected ? `priority-selected ${p.color}` : 'priority-unselected'}`}
                      >
                        <div className="priority-header">
                          <span className="priority-label">{p.label}</span>
                          <span className={`priority-badge ${p.color}`}>
                            {p.id}
                          </span>
                        </div>
                        <p className="priority-desc">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-submit">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Création en cours...</span>
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