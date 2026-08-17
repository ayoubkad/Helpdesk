package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.Commentaire;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import org.hibernate.procedure.internal.ProcedureCallImpl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    Optional<Commentaire> findByAuteur(User auteur);

    Optional<Commentaire> findByEstInterne(boolean estInterne);

    List<Commentaire> findByTicketId(Long ticketId);


    List<Commentaire> findByTicketIdAndEstInterneFalse(Long ticketId);
}
