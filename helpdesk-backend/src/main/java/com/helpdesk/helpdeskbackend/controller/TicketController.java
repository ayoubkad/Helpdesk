package com.helpdesk.helpdeskbackend.controller;

import com.helpdesk.helpdeskbackend.dto.TicketDTO;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketDTO> creerTicket(
            @Valid @RequestBody TicketDTO ticketDTO,
            @RequestParam Long createurId) {
        return new ResponseEntity<>(ticketService.creerTicket(ticketDTO, createurId), HttpStatus.CREATED);
    }

    /* @GetMapping
    public ResponseEntity<List<TicketDTO>> listerTousLesTickets() {
        return ResponseEntity.ok(ticketService.listTousTickets());
    } */

    // GET /api/tickets accepte maintenant page, size, sort en query params
    @GetMapping
    public ResponseEntity<Page<TicketDTO>> listerTousLesTickets(
            @PageableDefault(size = 10, sort = "dateCreation") Pageable pageable) {
        return ResponseEntity.ok(ticketService.listTousTickets(pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketDTO>> listerTicketsParUtilisateur(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.listerTicketsParUtilisateur(userId));
    }

    // RBAC (Semaine 2 - Mercredi) : seuls TECHNICIEN et ADMIN peuvent s'assigner un ticket
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'ADMIN')")
    @PutMapping("/{id}/assigner")
    public ResponseEntity<TicketDTO> assignerTechnicien(
            @PathVariable Long id,
            @RequestParam Long techId) {
        return ResponseEntity.ok(ticketService.assignerTechnicien(id, techId));
    }

    // RBAC (Semaine 2 - Mercredi) : seuls TECHNICIEN et ADMIN peuvent changer le statut
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'ADMIN')")
    @PutMapping("/{id}/statut")
    public ResponseEntity<TicketDTO> changerStatut(
            @PathVariable Long id,
            @RequestParam StatutTicket statutTicket) {
        return ResponseEntity.ok(ticketService.changerStatut(id, statutTicket));
    }

    @PreAuthorize("hasAnyRole('TECHNICIEN', 'ADMIN')")
    @PutMapping("/{id}/cloturer")
    public ResponseEntity<TicketDTO> cloturerTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.cloturerTicket(id));
    }

    @PreAuthorize("hasAnyRole('TECHNICIEN', 'ADMIN')")
    @PutMapping("/{id}/rouvrir")
    public ResponseEntity<TicketDTO> rouvrirTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.rouvrirTicket(id));
    }
}