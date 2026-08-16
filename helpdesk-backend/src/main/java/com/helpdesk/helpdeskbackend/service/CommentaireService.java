package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.CommentaireRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.helpdesk.helpdeskbackend.dto.CommentaireDTO;
import com.helpdesk.helpdeskbackend.entity.Commentaire;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentaireService {
    private final CommentaireRepository commentaireRepository;
    private final TicketRepository ticketRepository;

    public CommentaireDTO ajouterCommentaire(Long ticketId, String contenu, boolean estInterne, @NonNull User user) {
        if (contenu == null || contenu.trim().isEmpty()) {
            throw new RuntimeException("Erreur: Le contenu du commentaire ne peut pas être vide !");
        }

        if (estInterne && user.getRole().getNom().equalsIgnoreCase("USER")) {
            throw new RuntimeException(
                    "Accès refusé : Les utilisateurs simples ne peuvent pas créer de notes internes !"
            );
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException(" Ticket avec l'ID " + ticketId + " n'est existe pas"));

        Commentaire commentaire = Commentaire.builder()
                .contenu(contenu.trim())
                .auteur(user)
                .estInterne(estInterne)
                .ticket(ticket)
                .build();
        Commentaire commentaireSauvegarde = commentaireRepository.save(commentaire);
        return commentaireToDTO(commentaireSauvegarde);
    }

    public List<CommentaireDTO> listCommentairesParTicket(Long ticketId, @NonNull User user) {
        List<Commentaire> commentaires;

        if(!ticketRepository.existsById(ticketId)){
            throw new RuntimeException("Le ticket avec l'ID " + ticketId + " n'existe pas !");
        }

        if (user.getRole().getNom().equals("USER")) {
            commentaires = commentaireRepository
                    .findByTicketIdAndEstInterneFalse(ticketId);
        } else {
            commentaires = commentaireRepository
                    .findByTicketId(ticketId);
        }

        return commentaires
                .stream()
                .map(this::commentaireToDTO)
                .toList();
    }

    public CommentaireDTO commentaireToDTO(@NonNull Commentaire commentaire) {
        return CommentaireDTO.builder()
                .id(commentaire.getId())
                .contenu(commentaire.getContenu())
                .estInterne(commentaire.isEstInterne())
                .auteurId(commentaire.getAuteur() != null ? commentaire.getAuteur().getId() : null)
                .auteurNom(commentaire.getAuteur() != null ? commentaire.getAuteur().getNom() + " " + commentaire.getAuteur().getPrenom() : null)
                .ticketId(commentaire.getTicket() != null ? commentaire.getTicket().getId() : null)
                .build();
    }
}
