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
    UserCog,
    Check
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'USER',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });

    // Roles configuration with icons and descriptions
    const roles = [
        {
            id: 'USER',
            label: 'Utilisateur',
            desc: 'Déposer et suivre des tickets',
            icon: User,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200'
        },
        {
            id: 'TECHNICIEN',
            label: 'Technicien',
            desc: 'Traiter et résoudre les incidents',
            icon: UserCog,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 border-emerald-200'
        },
        {
            id: 'ADMIN',
            label: 'Administrateur',
            desc: 'Gestion globale et supervision',
            icon: ShieldCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200'
        }
    ];

    // Password strength computation
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200', text: '' };
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score === 1) return { score: 25, label: 'Faible', color: 'bg-red-500', text: 'text-red-600' };
        if (score === 2) return { score: 50, label: 'Moyen', color: 'bg-amber-500', text: 'text-amber-600' };
        if (score === 3) return { score: 75, label: 'Bon', color: 'bg-blue-500', text: 'text-blue-600' };
        return { score: 100, label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-600' };
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
            case 'role':
                if (!trimmed) error = 'Veuillez sélectionner un rôle';
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

        // Clear server status message when editing
        if (status.type) {
            setStatus({ type: null, message: '' });
        }

        // Live validation if the field was already touched
        if (touched[name]) {
            const fieldError = validateField(name, value, updatedFormData);
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError
            }));
        }

        // Also re-validate confirmPassword if password changes
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

    const handleRoleSelect = (roleId) => {
        setFormData((prev) => ({ ...prev, role: roleId }));
        setTouched((prev) => ({ ...prev, role: true }));
        setErrors((prev) => ({ ...prev, role: '' }));
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
        // Mark all fields as touched to show validation styles
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
                    nom: formData.role
                }
            });

            console.log('Registration success:', response.data);
            setStatus({
                type: 'success',
                message: typeof response.data === 'string'
                    ? response.data
                    : 'Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.'
            });

            // Reset form upon success
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                role: 'USER',
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-300">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 sm:px-10 py-8 text-white text-center relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner mb-3 border border-white/20">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Créer un compte
                            </h1>
                            <p className="mt-1.5 text-blue-100 text-sm sm:text-base max-w-md">
                                Rejoignez la plateforme Helpdesk pour gérer et suivre vos tickets en temps réel.
                            </p>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="p-6 sm:p-10">
                        
                        {/* Status Message: Error */}
                        {status.type === 'error' && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-fadeIn">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="text-sm font-medium">{status.message}</div>
                            </div>
                        )}

                        {/* Status Message: Success with direct Login Button */}
                        {status.type === 'success' && (
                            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 animate-fadeIn">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-sm text-left">
                                        <p className="font-bold text-emerald-950">Inscription réussie !</p>
                                        <p className="text-emerald-800 mt-0.5">{status.message}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/login"
                                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Se connecter</span>
                                </Link>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            
                            {/* Grid: Nom & Prénom */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                
                                {/* Nom */}
                                <div>
                                    <label htmlFor="nom" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.nom && touched.nom
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.nom && !errors.nom && formData.nom
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                    </div>
                                    {errors.nom && touched.nom && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.nom}
                                        </p>
                                    )}
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label htmlFor="prenom" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.prenom && touched.prenom
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.prenom && !errors.prenom && formData.prenom
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                    </div>
                                    {errors.prenom && touched.prenom && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.prenom}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Grid: Email & Téléphone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Adresse Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.email && touched.email
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.email && !errors.email && formData.email
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                    </div>
                                    {errors.email && touched.email && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label htmlFor="telephone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.telephone && touched.telephone
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.telephone && !errors.telephone && formData.telephone
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                    </div>
                                    {errors.telephone && touched.telephone && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.telephone}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Type de profil (Rôle) <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {roles.map((r) => {
                                        const IconComp = r.icon;
                                        const isSelected = formData.role === r.id;
                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => handleRoleSelect(r.id)}
                                                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 relative ${
                                                    isSelected
                                                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 shadow-sm'
                                                        : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full mb-1.5">
                                                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                                                    {r.label}
                                                </span>
                                                <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                    {r.desc}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.role && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Grid: Mot de passe & Confirmation */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                
                                {/* Mot de passe */}
                                <div>
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.password && touched.password
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.password && !errors.password && formData.password
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password strength indicator */}
                                    {formData.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between items-center text-[11px]">
                                                <span className="text-slate-500">Robustesse :</span>
                                                <span className={`font-semibold ${passwordStrength.text}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                                                    style={{ width: `${passwordStrength.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {errors.password && touched.password && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirmation Mot de passe */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Confirmer le mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                                            className={`block w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm rounded-xl border bg-slate-50/50 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 ${
                                                errors.confirmPassword && touched.confirmPassword
                                                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                                    : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                                                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                                                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                            aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
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
                                    className="w-full relative py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
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

                        {/* Footer: Dedicated Login Button & Link */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-600">
                                Vous possédez déjà un compte ?
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl transition-all duration-150 border border-indigo-100"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Se connecter</span>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Subtitle footer note */}
                <div className="text-center mt-6 text-xs text-slate-400">
                    Plateforme Helpdesk Sécurisée &bull; Support & Assistance
                </div>

            </div>
        </div>
    );
};

export default Register;