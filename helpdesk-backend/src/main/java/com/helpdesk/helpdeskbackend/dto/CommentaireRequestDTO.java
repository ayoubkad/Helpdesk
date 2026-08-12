package com.helpdesk.helpdeskbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentaireRequestDTO {
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String contenu;

    private boolean estInterne;
}
