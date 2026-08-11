import React from "react";
import { useAuth } from "../Context/AuthContext";

const TechnicianDashboard = () => {
    const { userEmail } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-3xl font-bold text-slate-800">
                Dashboard Technicien
            </h1>

            <p className="mt-2 text-slate-600">
                Bienvenue {userEmail}
            </p>

            <div className="mt-8 bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold">
                    Tickets à gérer
                </h2>

                <p className="mt-2 text-slate-500">
                    La gestion des tickets sera ajoutée prochainement.
                </p>
            </div>
        </div>
    );
};

export default TechnicianDashboard;