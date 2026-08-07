import axios from "axios";
import { useState } from "react";
import "./CreateTicket.css";

function CreateTicket() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8081/api/tickets",
        {
          titre: titre,
          description: description,
          priorite: priority,
        }
      );

      console.log("Ticket créé :", response.data);
      alert("Le ticket a été créé avec succès !");

      // Réinitialiser le formulaire
      setTitre("");
      setDescription("");
      setPriority("");

    } catch (error) {
    console.log(error);
    console.log(error.response);
    console.log(error.response?.status);
    console.log(error.response?.data);

    alert("Erreur lors de la création du ticket.");
    }
  };

  return (
    <div className="ticket-form">
      <h2>Créer un Ticket</h2>

      <form onSubmit={handleSubmit}>
        <label>Titre</label>
        <input
          type="text"
          placeholder="Entrer le titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />

        <label>Description</label>
        <textarea
          placeholder="Décrire le problème"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <label>Priorité</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Choisir une priorité</option>
          <option value="Faible">Faible</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Haute">Haute</option>
        </select>

        <button type="submit">Créer le ticket</button>
      </form>
    </div>
  );
}

export default CreateTicket;