package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.Attachement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachementRepository extends JpaRepository<Attachement, Long> {

    List<Attachement> findByTicketId(Long ticketId);

    List<Attachement> findByTicketIdOrderByDateUploadDesc(Long ticketId);
}
