const getPerson = (ticket, relation, prefix) => {
  const nested = ticket?.[relation];

  return {
    id: nested?.id ?? ticket?.[`${prefix}Id`],
    nom: nested?.nom ?? ticket?.[`${prefix}Nom`],
    prenom: nested?.prenom ?? ticket?.[`${prefix}Prenom`],
    email: nested?.email ?? ticket?.[`${prefix}Email`]
  };
};

const formatPersonName = ({ nom, prenom, email }) => {
  const fullName = [prenom, nom].filter(Boolean).join(" ").trim();
  return fullName || nom || email || null;
};

export const getCreatorName = (ticket) => {
  const creator = getPerson(ticket, "createur", "createur");
  return formatPersonName(creator) || (creator.id ? `Utilisateur #${creator.id}` : "Inconnu");
};

export const getTechnicianName = (ticket) => {
  const technician = getPerson(ticket, "technicien", "technicien");
  return formatPersonName(technician) ||
    (technician.id ? `Technicien #${technician.id}` : "Non assigné");
};

export const hasTechnician = (ticket) => {
  const technician = getPerson(ticket, "technicien", "technicien");
  return Boolean(technician.id || technician.nom || technician.prenom || technician.email);
};

export const isAssignedToUser = (ticket, userId, userEmail) => {
  const technician = getPerson(ticket, "technicien", "technicien");
  return Boolean(
    (userId && technician.id && String(technician.id) === String(userId)) ||
    (userEmail && technician.email && technician.email.toLowerCase() === userEmail.toLowerCase())
  );
};

export const getCurrentUserId = (userId) => userId || localStorage.getItem("userId");

export const normalizeRole = (role) => {
  const normalized = String(role || "").toUpperCase().trim();
  return normalized.startsWith("ROLE_") ? normalized.slice(5) : normalized;
};
