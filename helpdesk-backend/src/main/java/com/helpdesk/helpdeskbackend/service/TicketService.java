package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.TicketDTO;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.Categorie;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import com.helpdesk.helpdeskbackend.repository.CategorieRepository;
import lombok.NonNull;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CategorieRepository categorieRepository;


    @Transactional
    public TicketDTO creerTicket(@NonNull TicketDTO dto, Long createurId) {

        User createur = userRepository
                .findById(createurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'ID : " + createurId));

        Categorie categorie = null;
        if (dto.getCategorieId() != null) {
            categorie = categorieRepository
                    .findById(dto.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie introuvable avec l'ID : " + dto.getCategorieId()));
        }

        Ticket ticket = Ticket.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : StatutTicket.NOUVEAU)
                .priorite(dto.getPriorite())
                .categorie(categorie)
                .createur(createur)
                .build();

        Ticket ticketSauvegarde = ticketRepository.save(ticket);


        return mapToDTO(ticketSauvegarde);
    }


    @Transactional(readOnly = true)
    public List<TicketDTO> listTousTickets() {
        return ticketRepository
                .findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> listerTicketsParUtilisateur(Long userId){
        return ticketRepository.findByCreateurId(userId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + id));
        return mapToDTO(ticket);
    }

    @Transactional
    public TicketDTO assignerTechnicien(Long ticketId, Long techId) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));
        User technicien = userRepository
                .findById(techId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable avec l'ID : " + techId));

        ticket.assignerTechnicien(technicien);
        Ticket ticketSauvegarde = ticketRepository.save(ticket);
        return mapToDTO(ticketSauvegarde);
    }

    @Transactional
    public TicketDTO changerStatut(Long ticketId, StatutTicket statutTicket) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));
        ticket.changerStatut(statutTicket);
        Ticket ticketSauvegarde = ticketRepository.save(ticket);
        return mapToDTO(ticketSauvegarde);
    }

    @Transactional
    public TicketDTO cloturerTicket(Long ticketId) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));
        ticket.clotureTicket();
        Ticket ticketSauvegarde = ticketRepository.save(ticket);
        return mapToDTO(ticketSauvegarde);
    }

    @Transactional
    public TicketDTO rouvrirTicket(Long ticketId) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));
        ticket.rouvrirTicket();
        Ticket ticketSauvegarde = ticketRepository.save(ticket);
        return mapToDTO(ticketSauvegarde);
    }


    private TicketDTO mapToDTO(@NonNull Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .titre(ticket.getTitre())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priorite(ticket.getPriorite())
                .dateCreation(ticket.getDateCreation())
                .dateResolution(ticket.getDateResolution())
                .dateCloture(ticket.getDateCloture())
                .dateModification(ticket.getDateModification())
                .createurId(ticket.getCreateur() != null ? ticket.getCreateur().getId() : null)
                .technicienId(ticket.getTechnicien() != null ? ticket.getTechnicien().getId() : null)
                .categorieId(ticket.getCategorie() != null ? ticket.getCategorie().getId() : null)
                .categorieNom(ticket.getCategorie() != null ? ticket.getCategorie().getNom() : null)
                .build();
    }
}