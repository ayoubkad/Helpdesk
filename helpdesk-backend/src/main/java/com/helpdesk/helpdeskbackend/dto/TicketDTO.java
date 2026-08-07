package com.helpdesk.helpdeskbackend.dto;

import com.helpdesk.helpdeskbackend.entity.Priorite;
import jdk.jfr.DataAmount;
import lombok.*;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDTO {

    private Long id;
    private String titre;
    private String description;
    private StatutTicket status;
    private Priorite priorite;
    private LocalDateTime dateCreation;
    private LocalDateTime dateResolution;
    private LocalDateTime dateCloture;
    private LocalDateTime dateModification;
    private Long createurId;
    private Long technicienId;
    private Long categorieId;

}
