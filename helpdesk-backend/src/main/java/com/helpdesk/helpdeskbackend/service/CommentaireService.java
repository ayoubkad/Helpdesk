package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.CommentaireRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.helpdesk.helpdeskbackend.dto.CommentaireDTO;
import com.helpdesk.helpdeskbackend.entity.Commentaire;

import java.util.List;
import java.util.Objects;

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

        if (ticket.getStatus() == StatutTicket.CLOTURE) {
            throw new IllegalStateException("Ce ticket est clôturé : aucun nouveau commentaire n'est autorisé.");
        }

//        if (user.getRole().getNom().equalsIgnoreCase("TECHNICIEN")) {
//            boolean isAssigned = ticket.getTechnicien() != null
//                    && ticket.getTechnicien().getId().equals(user.getId());
//
//            if (!isAssigned) {
//                throw new AccessDeniedException("Accès refusé : vous n'avez pas les droits pour ajouter un commentaire a cette ticket.");
//            }
//
//            Commentaire commentaire = Commentaire.builder()
//                    .contenu(contenu.trim())
//                    .auteur(user)
//                    .estInterne(estInterne)
//                    .ticket(ticket)
//                    .build();
//            Commentaire commentaireSauvegarde = commentaireRepository.save(commentaire);
//            return commentaireToDTO(commentaireSauvegarde);
//        }

        Commentaire commentaire = Commentaire.builder()
                .contenu(contenu.trim())
                .auteur(user)
                .estInterne(estInterne)
                .ticket(ticket)
                .build();
        Commentaire commentaireSauvegarde = commentaireRepository.save(commentaire);
        return commentaireToDTO(commentaireSauvegarde);
    }

    public List<CommentaireDTO> listCommentairesParTicket(
            Long ticketId,
            @NonNull User user
    ) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));

        if (user.getRole().getNom().equalsIgnoreCase("USER")) {

            boolean isOwner = ticketRepository.existsByIdAndCreateur(ticketId, user);

            if (!isOwner) {
                throw new AccessDeniedException("Vous n'avez pas accès à ce ticket.");
            }

            return commentaireRepository
                    .findByTicketIdAndEstInterneFalse(ticketId)
                    .stream()
                    .map(this::commentaireToDTO)
                    .toList();
        }
//        if (user.getRole().getNom().equalsIgnoreCase("TECHNICIEN")) {
//            boolean isAssigned = ticket.getTechnicien() != null
//                    && ticket.getTechnicien().getId().equals(user.getId());
//
//            boolean isAvailable = ticket.getTechnicien() == null
//                    && ticket.getStatus() == StatutTicket.NOUVEAU;
//
//            if (!isAssigned && !isAvailable) {
//                throw new AccessDeniedException("Accès refusé : vous n'avez pas les droits pour consulter ce ticket.");
//            }
//
//            return commentaireRepository.findByTicketId(ticketId)
//                    .stream()
//                    .map(this::commentaireToDTO)
//                    .toList();
//        }
        return commentaireRepository
                .findByTicketId(ticketId)
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
