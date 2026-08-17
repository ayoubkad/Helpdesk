package com.helpdesk.helpdeskbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachements")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Attachement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier_original", nullable = false)
    private String nomFichierOriginal;

    @Column(name = "nom_fichier_stocke", nullable = false)
    private String nomFichierStocke;

    @Column(name = "type_mime", nullable = false)
    private String typeMime;

    @Column(name = "taille", nullable = false)
    private Long taille;

    @Column(name = "chemin_relatif", nullable = false)
    private String cheminRelatif;

    @Column(name = "date_upload", nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @PrePersist
    protected void onCreate() {
        if (this.dateUpload == null) {
            this.dateUpload = LocalDateTime.now();
        }
    }
}