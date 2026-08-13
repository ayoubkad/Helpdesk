import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    LogIn,
    Home,
    HelpCircle,
    Award,
    ChevronRight
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });

    // Password strength computation
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-[#2a2a2a]', text: '' };
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score === 1) return { score: 25, label: 'Faible', color: 'bg-red-500', text: 'text-red-400' };
        if (score === 2) return { score: 50, label: 'Moyen', color: 'bg-amber-500', text: 'text-amber-400' };
        if (score === 3) return { score: 75, label: 'Bon', color: 'bg-amber-500', text: 'text-amber-400' };
        return { score: 100, label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-400' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    // Single field validation helper
    const validateField = (name, value, allData = formData) => {
        let error = '';
        const trimmed = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'nom':
                if (!trimmed) error = 'Le nom est requis';
                else if (trimmed.length < 2) error = 'Le nom doit comporter au moins 2 caractères';
                break;
            case 'prenom':
                if (!trimmed) error = 'Le prénom est requis';
                else if (trimmed.length < 2) error = 'Le prénom doit comporter au moins 2 caractères';
                break;
            case 'email':
                if (!trimmed) {
                    error = 'L\'adresse email est requise';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                    error = 'Format d\'email invalide (ex: exemple@domaine.com)';
                }
                break;
            case 'telephone':
                if (!trimmed) {
                    error = 'Le numéro de téléphone est requis';
                } else if (!/^[0-9+() -]{8,20}$/.test(trimmed)) {
                    error = 'Numéro de téléphone invalide (ex: 06 12 34 56 78)';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Le mot de passe est requis';
                } else if (value.length < 6) {
                    error = 'Le mot de passe doit comporter au moins 6 caractères';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    error = 'Veuillez confirmer votre mot de passe';
                } else if (value !== allData.password) {
                    error = 'Les mots de passe ne correspondent pas';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedFormData);

        if (status.type) {
            setStatus({ type: null, message: '' });
        }

        if (touched[name]) {
            const fieldError = validateField(name, value, updatedFormData);
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError
            }));
        }

        if (name === 'password' && touched.confirmPassword) {
            const confirmErr = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
            setErrors((prev) => ({
                ...prev,
                confirmPassword: confirmErr
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const fieldError = validateField(name, value, formData);
        setErrors((prev) => ({
            ...prev,
            [name]: fieldError
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key], formData);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        const allTouched = Object.keys(formData).reduce((acc, curr) => {
            acc[curr] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        if (!validateForm()) {
            setStatus({
                type: 'error',
                message: 'Veuillez corriger les erreurs indiquées dans le formulaire.'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/register', {
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                email: formData.email.trim(),
                telephone: formData.telephone.trim(),
                password: formData.password,
                role: {
                    nom: 'USER'
                }
            });

            console.log('Registration success:', response.data);
            setStatus({
                type: 'success',
                message: typeof response.data === 'string'
                    ? response.data
                    : 'Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.'
            });

            setFormData({
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                password: '',
                confirmPassword: ''
            });
            setTouched({});
            setErrors({});

        } catch (error) {
            console.error('Registration error:', error);
            const serverMessage = error.response?.data?.message || error.response?.data || "Une erreur est survenue lors de l'inscription.";
            setStatus({
                type: 'error',
                message: typeof serverMessage === 'string' ? serverMessage : "Erreur lors de l'enregistrement."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Left Section - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-lg">
                    
                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#141414] rounded-2xl flex items-center justify-center border border-[#d4a843]/30 shadow-lg shadow-[#d4a843]/5">
                                <ShieldCheck className="w-7 h-7 text-[#d4a843]" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Créer un compte
                        </h1>
                        <p className="mt-2 text-[#888888] text-sm sm:text-base max-w-md mx-auto">
                            Rejoignez la plateforme Helpdesk pour gérer et suivre vos tickets en temps réel.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {status.type === 'error' && (
                        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50 flex items-start gap-3 text-red-300 animate-fadeIn">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm font-medium">{status.message}</div>
                        </div>
                    )}

                    {status.type === 'success' && (
                        <div className="mb-6 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-200 animate-fadeIn">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-700/50">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-sm text-left">
                                    <p className="font-bold text-emerald-300">Inscription réussie !</p>
                                    <p className="text-emerald-400/80 mt-0.5">{status.message}</p>
                                </div>
                            </div>
                            <Link
                                to="/login"
                                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4a843] hover:bg-[#c49a38] text-black text-sm font-semibold rounded-xl shadow-lg shadow-[#d4a843]/20 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Se connecter</span>
                            </Link>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        
                        {/* Nom & Prénom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nom" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Nom <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="nom"
                                        name="nom"
                                        type="text"
                                        autoComplete="family-name"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Alaoui"
                                        className={`block w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.nom && touched.nom
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.nom && !errors.nom && formData.nom
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                </div>
                                {errors.nom && touched.nom && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="prenom" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Prénom <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="prenom"
                                        name="prenom"
                                        type="text"
                                        autoComplete="given-name"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Mohamed"
                                        className={`block w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.prenom && touched.prenom
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.prenom && !errors.prenom && formData.prenom
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                </div>
                                {errors.prenom && touched.prenom && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.prenom}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email & Téléphone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Adresse Email <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="mohamed.alaoui@entreprise.com"
                                        className={`block w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.email && touched.email
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.email && !errors.email && formData.email
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                </div>
                                {errors.email && touched.email && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="telephone" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Téléphone <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="telephone"
                                        name="telephone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="06 12 34 56 78"
                                        className={`block w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.telephone && touched.telephone
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.telephone && !errors.telephone && formData.telephone
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                </div>
                                {errors.telephone && touched.telephone && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.telephone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Mot de passe & Confirmation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Mot de passe <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Min. 6 caractères"
                                        className={`block w-full pl-10 pr-10 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.password && touched.password
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.password && !errors.password && formData.password
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#555555] hover:text-[#888888] focus:outline-none"
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {formData.password && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-[#666666]">Robustesse :</span>
                                            <span className={`font-semibold ${passwordStrength.text}`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                                                style={{ width: `${passwordStrength.score}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {errors.password && touched.password && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                                    Confirmer le mot de passe <span className="text-[#d4a843]">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#555555]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Répétez le mot de passe"
                                        className={`block w-full pl-10 pr-10 py-3 text-sm rounded-xl border bg-[#141414] transition-all duration-200 outline-none text-white placeholder:text-[#444444] ${
                                            errors.confirmPassword && touched.confirmPassword
                                                ? 'border-red-700 bg-red-950/20 focus:border-red-600 focus:ring-4 focus:ring-red-600/10'
                                                : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                                                ? 'border-emerald-700 bg-emerald-950/20 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                                                : 'border-[#2a2a2a] focus:border-[#d4a843] focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#d4a843]/10'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#555555] hover:text-[#888888] focus:outline-none"
                                        aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && touched.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative py-3.5 px-6 rounded-xl font-semibold text-black bg-gradient-to-r from-[#d4a843] via-[#e8c84a] to-[#d4a843] hover:from-[#c49a38] hover:via-[#d4a843] hover:to-[#c49a38] shadow-lg shadow-[#d4a843]/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                                        <span>Création du compte en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>S'inscrire</span>
                                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[#666666]">
                            Vous possédez déjà un compte ?
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#d4a843] hover:text-[#e8c84a] bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-all duration-150 border border-[#2a2a2a] hover:border-[#d4a843]/50"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Se connecter</span>
                        </Link>
                    </div>

                </div>
            </div>

            {/* Right Section - Hero/Info */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-l border-[#1a1a1a] items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a843]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4a843]/5 rounded-full blur-3xl" />
                
                <div className="relative z-10 max-w-md">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center border border-[#d4a843]/30 shadow-lg shadow-[#d4a843]/5 mb-4">
                            <ShieldCheck className="w-8 h-8 text-[#d4a843]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Plateforme Helpdesk
                        </h2>
                        <p className="text-[#888888]">
                            Gérez vos tickets et incidents en toute simplicité
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                                <Award className="w-4 h-4 text-[#d4a843]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Support 24/7</h4>
                                <p className="text-xs text-[#666666]">Assistance disponible à tout moment</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                                <HelpCircle className="w-4 h-4 text-[#d4a843]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Suivi des tickets</h4>
                                <p className="text-xs text-[#666666]">Suivez l'évolution de vos incidents</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                                <Home className="w-4 h-4 text-[#d4a843]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Gestion centralisée</h4>
                                <p className="text-xs text-[#666666]">Tous vos tickets au même endroit</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#666666]">Déjà inscrit ?</p>
                                <p className="text-sm font-semibold text-white">Connectez-vous</p>
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#d4a843] hover:text-[#e8c84a] transition-colors"
                            >
                                <span>Accéder</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-[#333333] uppercase tracking-wider">
                            Plateforme Helpdesk Sécurisée &bull; Support & Assistance
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;