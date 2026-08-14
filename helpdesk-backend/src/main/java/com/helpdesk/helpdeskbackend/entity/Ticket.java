package com.helpdesk.helpdeskbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTicket status = StatutTicket.NOUVEAU;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priorite priorite;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_resolution")
    private LocalDateTime dateResolution;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createur_id", nullable = false)
    private User createur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    private User technicien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;


    public void assignerTechnicien(User tech) {
        this.technicien = tech;
        if (this.status == StatutTicket.NOUVEAU) {
            this.status = StatutTicket.EN_COURS;
        }
    }

    public void changerStatut(StatutTicket statut) {
    this.status = statut;
    if (statut == StatutTicket.RESOLU) {
        this.dateResolution = LocalDateTime.now();
    } else if (statut == StatutTicket.CLOTURE) {
        this.dateCloture = LocalDateTime.now();
    }
}

    public void clotureTicket() {
        this.status = StatutTicket.CLOTURE;
        this.dateCloture = LocalDateTime.now();
    }

    public void rouvrirTicket() {
        this.status = StatutTicket.EN_COURS;
        this.dateCloture = null;
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.status == null) {
            this.status = StatutTicket.NOUVEAU;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}