package com.helpdesk.helpdeskbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttachementDTO {

    private Long id;
    private String nomFichierOriginal;
    private String nomFichierStocke;
    private String typeMime;
    private Long taille;
    private String cheminRelatif;
    private LocalDateTime dateUpload;

    private Long ticketId;
    private Long uploaderId;
    private String uploaderNom;
}