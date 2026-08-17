package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.AttachementDTO;
import com.helpdesk.helpdeskbackend.entity.Attachement;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.AttachementRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AttachementRepository attachementRepository;
    private final TicketRepository ticketRepository;

    @Value("${file.upload-dir:./uploads/tickets/}")
    private String uploadDir;

    // Validation stricte dès l'entrée
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    public static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "pdf", "docx");
    public static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    /**
     * Upload d'un fichier associé à un ticket.
     * Le binaire est écrit sur disque local (dossier configurable),
     * seules les métadonnées et le chemin relatif sont stockés en BDD.
     */
    @Transactional
    public AttachementDTO stockerFichier(MultipartFile file, Long ticketId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utilisateur non authentifié.");
        }

        // 1. Validation de présence du fichier
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier ne peut pas être vide.");
        }

        // 2. Validation stricte de la taille (max 5 Mo)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("La taille maximale autorisée par fichier est de 5 Mo.");
        }

        // 3. Validation de l'existence du ticket et des droits d'accès
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));

        verifierAccesAuTicket(ticket, currentUser);

        // 4. Validation du nom de fichier et protection Path Traversal
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Le nom du fichier original est invalide.");
        }

        Path pathObj = Paths.get(originalFilename).getFileName();
        String cleanFilename = (pathObj != null) ? pathObj.toString() : "";

        if (cleanFilename.isBlank() || cleanFilename.contains("..")) {
            throw new SecurityException("Nom de fichier invalide ou tentative de Path Traversal détectée.");
        }

        String extension = getExtension(cleanFilename);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Extension de fichier non autorisée (" + extension + "). Extensions acceptées : " + ALLOWED_EXTENSIONS);
        }

        // 5. Validation stricte du type MIME
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Type MIME non autorisé : " + contentType);
        }

        try {
            // Emplacement racine configuré
            Path rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path ticketDirectory = rootLocation.resolve("ticket-" + ticketId).normalize();

            // Protection Path Traversal sur le dossier ticket
            if (!ticketDirectory.startsWith(rootLocation)) {
                throw new SecurityException("Tentative de Path Traversal détectée sur l'identifiant du ticket.");
            }

            // Création du sous-dossier dédié au ticket si inexistant
            Files.createDirectories(ticketDirectory);

            // Génération d'un nom unique pour éviter les collisions et l'écrasement
            String storedFilename = UUID.randomUUID() + "_" + cleanFilename;
            Path targetFile = ticketDirectory.resolve(storedFilename).normalize();

            // Protection stricte contre le Path Traversal
            if (!targetFile.startsWith(ticketDirectory)) {
                throw new SecurityException("Tentative de Path Traversal détectée.");
            }

            // Écriture du flux binaire sur le disque local
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Chemin relatif stocké en BDD (ex: ticket-1/uuid_nom.pdf)
            String relativePath = "ticket-" + ticketId + "/" + storedFilename;

            // Enregistrement des métadonnées uniquement dans la BDD (JAMAIS de BLOB)
            Attachement attachement = Attachement.builder()
                    .nomFichierOriginal(cleanFilename)
                    .nomFichierStocke(storedFilename)
                    .typeMime(contentType)
                    .taille(file.getSize())
                    .cheminRelatif(relativePath)
                    .ticket(ticket)
                    .uploader(currentUser)
                    .build();

            Attachement saved = attachementRepository.save(attachement);
            return toDTO(saved);

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'écriture du fichier sur le disque local.", e);
        }
    }

    /**
     * Charger la ressource physique depuis le disque local pour téléchargement/visualisation.
     */
    public Resource chargerFichier(Long attachmentId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utilisateur non authentifié.");
        }

        Attachement attachement = attachementRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Pièce jointe introuvable avec l'ID : " + attachmentId));

        verifierAccesAuTicket(attachement.getTicket(), currentUser);

        try {
            Path rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = rootLocation.resolve(attachement.getCheminRelatif()).normalize();

            // Protection stricte contre le Path Traversal
            if (!filePath.startsWith(rootLocation)) {
                throw new SecurityException("Accès au chemin de fichier non autorisé.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Le fichier physique est introuvable sur le disque.");
            }

            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Impossible de localiser le fichier sur le disque.", e);
        }
    }

    /**
     * Récupérer les métadonnées d'un attachement.
     */
    public Attachement obtenirMetadonnees(Long attachmentId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utilisateur non authentifié.");
        }

        Attachement attachement = attachementRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Pièce jointe introuvable avec l'ID : " + attachmentId));

        verifierAccesAuTicket(attachement.getTicket(), currentUser);
        return attachement;
    }

    /**
     * Lister toutes les pièces jointes d'un ticket.
     */
    public List<AttachementDTO> listerAttachementsTicket(Long ticketId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utilisateur non authentifié.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable avec l'ID : " + ticketId));

        verifierAccesAuTicket(ticket, currentUser);

        return attachementRepository.findByTicketIdOrderByDateUploadDesc(ticketId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Supprimer une pièce jointe (fichier sur disque + métadonnées en BDD).
     */
    @Transactional
    public void supprimerFichier(Long attachmentId, User currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utilisateur non authentifié.");
        }

        Attachement attachement = attachementRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Pièce jointe introuvable avec l'ID : " + attachmentId));

        // Seul l'uploader ou un ADMIN peut supprimer la pièce jointe
        boolean isUploader = attachement.getUploader() != null && attachement.getUploader().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getNom());

        if (!isUploader && !isAdmin) {
            throw new AccessDeniedException("Vous n'avez pas le droit de supprimer cette pièce jointe.");
        }

        // 1. Suppression du fichier physique avec protection Path Traversal
        try {
            Path rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = rootLocation.resolve(attachement.getCheminRelatif()).normalize();

            if (!filePath.startsWith(rootLocation)) {
                throw new SecurityException("Accès au chemin de fichier non autorisé.");
            }

            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log si le fichier physique est déjà absent
        }

        // 2. Suppression de l'enregistrement en BDD
        attachementRepository.delete(attachement);
    }

    /**
     * Vérification RBAC de l'accès au ticket :
     * - ADMIN : accès complet
     * - USER : créateur du ticket uniquement
     * - TECHNICIEN : assigné au ticket ou ticket NOUVEAU
     */
    public void verifierAccesAuTicket(Ticket ticket, User user) {
        if (user == null || user.getRole() == null) {
            throw new AccessDeniedException("Utilisateur ou rôle non défini.");
        }

        String role = user.getRole().getNom().toUpperCase();

        switch (role) {
            case "ADMIN":
                return;

            case "USER":
                if (ticket.getCreateur() == null || !ticket.getCreateur().getId().equals(user.getId())) {
                    throw new AccessDeniedException("Vous n'avez pas accès à ce ticket.");
                }
                return;

            case "TECHNICIEN":
                boolean assignedToCurrentUser = ticket.getTechnicien() != null && ticket.getTechnicien().getId().equals(user.getId());
                boolean availableTicket = ticket.getTechnicien() == null && ticket.getStatus() == StatutTicket.NOUVEAU;

                if (!assignedToCurrentUser && !availableTicket) {
                    throw new AccessDeniedException("Vous n'avez pas accès à ce ticket.");
                }
                return;

            default:
                throw new AccessDeniedException("Rôle non autorisé.");
        }
    }

    /**
     * Conversion Entité -> DTO
     */
    public AttachementDTO toDTO(Attachement attachement) {
        User uploader = attachement.getUploader();

        return AttachementDTO.builder()
                .id(attachement.getId())
                .nomFichierOriginal(attachement.getNomFichierOriginal())
                .nomFichierStocke(attachement.getNomFichierStocke())
                .typeMime(attachement.getTypeMime())
                .taille(attachement.getTaille())
                .cheminRelatif(attachement.getCheminRelatif())
                .dateUpload(attachement.getDateUpload())
                .ticketId(attachement.getTicket() != null ? attachement.getTicket().getId() : null)
                .uploaderId(uploader != null ? uploader.getId() : null)
                .uploaderNom(uploader != null ? uploader.getNom() + " " + uploader.getPrenom() : null)
                .build();
    }

    /**
     * Extraire l'extension d'un nom de fichier.
     */
    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot + 1).toLowerCase();
    }
}