import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../Context/AuthContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    AlertCircle,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Home,
    HelpCircle,
    ChevronRight
} from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateField = (name, value) => {
        let error = '';
        const trimmed = typeof value === 'string' ? value.trim() : value;

        switch (name) {
            case 'email':
                if (!trimmed) {
                    error = "L'adresse email est requise";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                    error = "Format d'email invalide";
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Le mot de passe est requis';
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

        if (serverError) {
            setServerError('');
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

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const err = validateField(key, formData[key]);
            if (err) newErrors[key] = err;
        });

        setErrors(newErrors);
        setTouched({
            email: true,
            password: true
        });

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            console.log('Tentative de connexion avec:', formData.email);
            const response = await api.post('/api/auth/login', {
                email: formData.email.trim(),
                password: formData.password
            });

            console.log('Réponse du serveur:', response.data);

            if (response.data && response.data.token) {
                login(response.data);

                const role = response.data.role;

                if (role === "TECHNICIEN") {
                    navigate("/technician");
                } else if (role === "ADMIN") {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setServerError("Format de réponse inattendu du serveur");
            }

        } catch (error) {
            console.error('Erreur de connexion:', error);
            if (error.response) {
                setServerError(error.response.data?.message || "Email ou mot de passe incorrect");
            } else if (error.request) {
                setServerError("Impossible de contacter le serveur backend. Vérifiez qu'il est bien démarré.");
            } else {
                setServerError("Une erreur est survenue lors de la connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Left Section - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full max-w-md">
                    
                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#141414] rounded-2xl flex items-center justify-center border border-[#d4a843]/30 shadow-lg shadow-[#d4a843]/5">
                                <LogIn className="w-7 h-7 text-[#d4a843] stroke-[2.2]" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Connexion
                        </h1>
                        <p className="mt-2 text-[#888888] text-sm sm:text-base max-w-xs mx-auto">
                            Accédez à votre espace Helpdesk pour suivre et gérer vos tickets.
                        </p>
                    </div>

                    {/* Error Alert Banner */}
                    {serverError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50 flex items-start gap-3 text-red-300 animate-fadeIn">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm font-medium">{serverError}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        
                        {/* Email */}
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
                                    placeholder="votre@email.com"
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

                        {/* Mot de passe */}
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
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Votre mot de passe"
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
                            {errors.password && touched.password && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.password}
                                </p>
                            )}
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
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                    </>
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Register Link */}
                    <div className="mt-6 pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[#666666]">
                            Pas encore de compte ?
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#d4a843] hover:text-[#e8c84a] bg-[#141414] hover:bg-[#1a1a1a] rounded-xl transition-all duration-150 border border-[#2a2a2a] hover:border-[#d4a843]/50"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>S'inscrire</span>
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
                            Bienvenue sur Helpdesk
                        </h2>
                        <p className="text-[#888888]">
                            Connectez-vous pour gérer vos tickets et incidents
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                                <LogIn className="w-4 h-4 text-[#d4a843]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Accès sécurisé</h4>
                                <p className="text-xs text-[#666666]">Connexion cryptée et protégée</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141414] border border-[#1a1a1a]">
                            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center shrink-0">
                                <HelpCircle className="w-4 h-4 text-[#d4a843]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Support 24/7</h4>
                                <p className="text-xs text-[#666666]">Assistance disponible à tout moment</p>
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
                                <p className="text-xs text-[#666666]">Nouveau sur la plateforme ?</p>
                                <p className="text-sm font-semibold text-white">Créez un compte</p>
                            </div>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#d4a843] hover:text-[#e8c84a] transition-colors"
                            >
                                <span>S'inscrire</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-[#333333] uppercase tracking-wider flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#333333]" />
                            <span>Plateforme Helpdesk Sécurisée &bull; Support & Assistance</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;