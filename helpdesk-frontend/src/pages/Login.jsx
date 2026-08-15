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
    ShieldCheck
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

        // Clear error banner on input change
        if (serverError) {
            setServerError('');
        }

        // Live validation if already touched
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full">
                
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-300">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 sm:px-10 py-8 text-white text-center relative overflow-hidden">
                        {/* Decorative background glows */}
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner mb-3 border border-white/20">
                                <LogIn className="w-7 h-7 text-white stroke-[2.2]" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                Connexion
                            </h1>
                            <p className="mt-1.5 text-blue-100 text-sm max-w-xs">
                                Accédez à votre espace Helpdesk pour suivre et gérer vos tickets.
                            </p>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="p-6 sm:p-8">
                        
                        {/* Error Alert Banner */}
                        {serverError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 animate-fadeIn">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="text-sm font-medium">{serverError}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            
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
                                        placeholder="votre@email.com"
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
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Votre mot de passe"
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
                                {errors.password && touched.password && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
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
                                    className="w-full relative py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
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

                        {/* Footer: Dedicated Register Button & Link */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-600">
                                Pas encore de compte ?
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl transition-all duration-150 border border-indigo-100"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>S'inscrire</span>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Subtitle footer note */}
                <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Plateforme Helpdesk Sécurisée &bull; Support & Assistance</span>
                </div>

            </div>
        </div>
    );
};

export default Login;