package com.helpdesk.helpdeskbackend.dto;

import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentaireDTO {
    private Long id;
    private String contenu;
    private boolean estInterne;
    private Long auteurId;
    private String auteurNom;
    private Long ticketId;
}