package com.helpdesk.helpdeskbackend.controller;

import com.helpdesk.helpdeskbackend.dto.AttachementDTO;
import com.helpdesk.helpdeskbackend.entity.Attachement;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import com.helpdesk.helpdeskbackend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttachementController {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    /**
     * Upload d'une pièce jointe pour un ticket.
     */
    @PostMapping(value = "/api/tickets/{ticketId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachementDTO> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        AttachementDTO savedAttachment = fileStorageService.stockerFichier(file, ticketId, currentUser);
        return new ResponseEntity<>(savedAttachment, HttpStatus.CREATED);
    }

    /**
     * Liste des pièces jointes associées à un ticket.
     */
    @GetMapping("/api/tickets/{ticketId}/attachments")
    public ResponseEntity<List<AttachementDTO>> listAttachments(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        List<AttachementDTO> attachments = fileStorageService.listerAttachementsTicket(ticketId, currentUser);
        return ResponseEntity.ok(attachments);
    }

    /**
     * Téléchargement / streaming du fichier physique de la pièce jointe.
     */
    @GetMapping("/api/attachments/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        Attachement metadata = fileStorageService.obtenirMetadonnees(id, currentUser);
        Resource resource = fileStorageService.chargerFichier(id, currentUser);

        String contentType = metadata.getTypeMime() != null ? metadata.getTypeMime() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getNomFichierOriginal() + "\"")
                .body(resource);
    }

    /**
     * Suppression d'une pièce jointe.
     */
    @DeleteMapping("/api/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        fileStorageService.supprimerFichier(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));
    }
}
