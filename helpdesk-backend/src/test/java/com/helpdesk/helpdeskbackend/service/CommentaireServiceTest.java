package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.entity.Role;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.CommentaireRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentaireServiceTest {

    @Mock
    private CommentaireRepository commentaireRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private CommentaireService commentaireService;

    @Test
    void ajouterCommentaire_RefusePourUnTicketCloture() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .status(StatutTicket.CLOTURE)
                .build();
        User utilisateur = User.builder()
                .id(2L)
                .role(Role.builder().nom("USER").build())
                .build();
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> commentaireService.ajouterCommentaire(1L, "Message", false, utilisateur))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Ce ticket est clôturé : aucun nouveau commentaire n'est autorisé.");

        verify(commentaireRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
