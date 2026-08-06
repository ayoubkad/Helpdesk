package com.helpdesk.helpdeskbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(name = "file_type")
    private String fileType;

    private Long taille;

    @Column(name = "date_upload", nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @PrePersist
    protected void onCreate() {
        this.dateUpload = LocalDateTime.now();
    }
}