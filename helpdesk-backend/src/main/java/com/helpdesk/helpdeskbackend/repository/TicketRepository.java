package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.Priorite;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreateurId(Long createurId);

    List<Ticket> findByTechnicienId(Long technicienId);

    List<Ticket> findByStatus(StatutTicket status);

    List<Ticket> findByPriorite(Priorite priorite);

    List<Ticket> findByCategorieId(Long categorieId);

    List<Ticket> findByTechnicienIdAndStatus(Long technicienId, StatutTicket status);

    long countByStatus(StatutTicket status);
}