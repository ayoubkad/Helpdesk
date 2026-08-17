package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.Priorite;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {  // ajout de , JpaSpecificationExecutor<Ticket>

    List<Ticket> findByCreateurId(Long createurId);

    List<Ticket> findByTechnicienId(Long technicienId);

    List<Ticket> findByStatus(StatutTicket status);

    List<Ticket> findByPriorite(Priorite priorite);

    List<Ticket> findByCategorieId(Long categorieId);

    List<Ticket> findByTechnicienIdAndStatus(Long technicienId, StatutTicket status);

    Optional<Ticket> findTicketsByCreateur(User createur);

    boolean existsByIdAndCreateur(Long id, User createur);

    boolean existsByIdAndTechnicien(Long id, User technicien);

    long countByStatus(StatutTicket status);
}