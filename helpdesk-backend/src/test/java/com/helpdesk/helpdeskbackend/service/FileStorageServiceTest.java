package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.AttachementDTO;
import com.helpdesk.helpdeskbackend.entity.Attachement;
import com.helpdesk.helpdeskbackend.entity.Role;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.AttachementRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private AttachementRepository attachementRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private FileStorageService fileStorageService;

    @TempDir
    Path tempUploadDir;

    private User utilisateurUser;
    private User autreUser;
    private User adminUser;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        // Injection du dossier de test temporaire dans le service
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempUploadDir.toString());

        utilisateurUser = User.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .email("jean.dupont@helpdesk.com")
                .role(Role.builder().id(1L).nom("USER").build())
                .build();

        autreUser = User.builder()
                .id(2L)
                .nom("Martin")
                .prenom("Paul")
                .email("paul.martin@helpdesk.com")
                .role(Role.builder().id(1L).nom("USER").build())
                .build();

        adminUser = User.builder()
                .id(3L)
                .nom("Admin")
                .prenom("Super")
                .email("admin@helpdesk.com")
                .role(Role.builder().id(3L).nom("ADMIN").build())
                .build();

        ticket = Ticket.builder()
                .id(10L)
                .titre("Problème réseau")
                .createur(utilisateurUser)
                .status(StatutTicket.NOUVEAU)
                .build();
    }

    @Test
    @DisplayName("Upload réussi pour un fichier PDF valide avec stockage sur disque et métadonnées en BDD")
    void stockerFichier_Succes_PDF() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "Contenu de test du PDF".getBytes()
        );

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(attachementRepository.save(any(Attachement.class))).thenAnswer(invocation -> {
            Attachement a = invocation.getArgument(0);
            a.setId(100L);
            return a;
        });

        AttachementDTO result = fileStorageService.stockerFichier(file, 10L, utilisateurUser);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getNomFichierOriginal()).isEqualTo("document.pdf");
        assertThat(result.getTypeMime()).isEqualTo("application/pdf");
        assertThat(result.getTaille()).isEqualTo(file.getSize());
        assertThat(result.getCheminRelatif()).startsWith("ticket-10/");
        assertThat(result.getTicketId()).isEqualTo(10L);
        assertThat(result.getUploaderId()).isEqualTo(1L);

        // Vérification de la création physique du fichier sur le disque local
        Path ticketFolder = tempUploadDir.resolve("ticket-10");
        assertThat(Files.exists(ticketFolder)).isTrue();
        verify(attachementRepository, times(1)).save(any(Attachement.class));
    }

    @Test
    @DisplayName("Upload réussi pour une image PNG")
    void stockerFichier_Succes_PNG() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "capture.png",
                "image/png",
                new byte[]{1, 2, 3, 4}
        );

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(attachementRepository.save(any(Attachement.class))).thenAnswer(invocation -> {
            Attachement a = invocation.getArgument(0);
            a.setId(101L);
            return a;
        });

        AttachementDTO result = fileStorageService.stockerFichier(file, 10L, utilisateurUser);

        assertThat(result).isNotNull();
        assertThat(result.getNomFichierOriginal()).isEqualTo("capture.png");
        assertThat(result.getTypeMime()).isEqualTo("image/png");
    }

    @Test
    @DisplayName("Rejet d'un fichier vide")
    void stockerFichier_RefuseFichierVide() {
        MockMultipartFile file = new MockMultipartFile("file", "vide.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, utilisateurUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Le fichier ne peut pas être vide.");

        verify(attachementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejet d'un fichier dépassant la taille maximale de 5 Mo")
    void stockerFichier_RefuseTailleSuperieureA5Mo() {
        byte[] largeContent = new byte[(int) (FileStorageService.MAX_FILE_SIZE + 1)];
        MockMultipartFile file = new MockMultipartFile("file", "trop_gros.pdf", "application/pdf", largeContent);

        assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, utilisateurUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La taille maximale autorisée par fichier est de 5 Mo.");

        verify(attachementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejet d'une extension non autorisée (.exe)")
    void stockerFichier_RefuseExtensionInterdite() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malware.exe",
                "application/octet-stream",
                "executable".getBytes()
        );

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, utilisateurUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Extension de fichier non autorisée");

        verify(attachementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejet d'un type MIME interdit avec une fausse extension")
    void stockerFichier_RefuseTypeMimeInterdit() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "application/x-msdownload",
                "contenu".getBytes()
        );

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, utilisateurUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Type MIME non autorisé");

        verify(attachementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejet de l'upload si l'utilisateur n'est pas propriétaire du ticket")
    void stockerFichier_RefuseUtilisateurNonAutorise() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "doc.pdf",
                "application/pdf",
                "contenu".getBytes()
        );

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, autreUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Vous n'avez pas accès à ce ticket.");

        verify(attachementRepository, never()).save(any());
    }

    @Nested
    @DisplayName("Tests de Sécurité - Vulnérabilités Path Traversal")
    class PathTraversalSecurityTests {

        @Test
        @DisplayName("Rejet de l'upload avec tentative de Path Traversal dans le nom de fichier (../../evil.pdf)")
        void stockerFichier_RejettePathTraversal_NomFichier() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "../../../../etc/passwd..pdf",
                    "application/pdf",
                    "malicious payload".getBytes()
            );

            when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));

            // Si le nom nettoyé contient encore des séquences interdites
            assertThatThrownBy(() -> fileStorageService.stockerFichier(file, 10L, utilisateurUser))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("tentative de Path Traversal détectée");

            verify(attachementRepository, never()).save(any());
        }

        @Test
        @DisplayName("Neutralisation sécurisée du chemin relatif lors de l'upload (ex: path/sub/document.pdf)")
        void stockerFichier_AssureConfinementDansDossierTicket() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "subfolder/secret_report.pdf",
                    "application/pdf",
                    "test payload".getBytes()
            );

            when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
            when(attachementRepository.save(any(Attachement.class))).thenAnswer(inv -> inv.getArgument(0));

            AttachementDTO result = fileStorageService.stockerFichier(file, 10L, utilisateurUser);

            // Le nom nettoyé ne doit contenir aucun séparateur de chemin
            assertThat(result.getNomFichierOriginal()).isEqualTo("secret_report.pdf");
            assertThat(result.getCheminRelatif()).startsWith("ticket-10/");
            assertThat(result.getCheminRelatif()).doesNotContain("subfolder");

            // Vérification que le fichier est bien stocké sous tempUploadDir/ticket-10/
            Path ticketFolder = tempUploadDir.resolve("ticket-10");
            Path createdFile = tempUploadDir.resolve(result.getCheminRelatif());
            assertThat(createdFile.startsWith(ticketFolder)).isTrue();
        }

        @Test
        @DisplayName("Rejet du chargement si le chemin relatif tente de s'échapper du dossier racine (../../etc/passwd)")
        void chargerFichier_RejettePathTraversal() {
            Attachement maliciousAttachement = Attachement.builder()
                    .id(99L)
                    .nomFichierOriginal("passwd")
                    .nomFichierStocke("passwd")
                    .typeMime("application/pdf")
                    .cheminRelatif("../../../../../etc/passwd")
                    .ticket(ticket)
                    .uploader(utilisateurUser)
                    .build();

            when(attachementRepository.findById(99L)).thenReturn(Optional.of(maliciousAttachement));

            assertThatThrownBy(() -> fileStorageService.chargerFichier(99L, utilisateurUser))
                    .isInstanceOf(SecurityException.class)
                    .hasMessage("Accès au chemin de fichier non autorisé.");
        }

        @Test
        @DisplayName("Rejet de la suppression si le chemin relatif tente de s'échapper du dossier racine")
        void supprimerFichier_RejettePathTraversal() {
            Attachement maliciousAttachement = Attachement.builder()
                    .id(99L)
                    .nomFichierOriginal("system.log")
                    .nomFichierStocke("system.log")
                    .cheminRelatif("../../../var/log/system.log")
                    .ticket(ticket)
                    .uploader(utilisateurUser)
                    .build();

            when(attachementRepository.findById(99L)).thenReturn(Optional.of(maliciousAttachement));

            assertThatThrownBy(() -> fileStorageService.supprimerFichier(99L, utilisateurUser))
                    .isInstanceOf(SecurityException.class)
                    .hasMessage("Accès au chemin de fichier non autorisé.");

            verify(attachementRepository, never()).delete(any());
        }
    }

    @Test
    @DisplayName("Chargement réussi d'un fichier physique existant")
    void chargerFichier_Succes() throws IOException {
        // Préparation du fichier physique sur disque
        Path ticketFolder = tempUploadDir.resolve("ticket-10");
        Files.createDirectories(ticketFolder);
        Path physicalFile = ticketFolder.resolve("stored_doc.pdf");
        Files.writeString(physicalFile, "test-content");

        Attachement attachement = Attachement.builder()
                .id(1L)
                .nomFichierOriginal("doc.pdf")
                .nomFichierStocke("stored_doc.pdf")
                .typeMime("application/pdf")
                .cheminRelatif("ticket-10/stored_doc.pdf")
                .ticket(ticket)
                .uploader(utilisateurUser)
                .build();

        when(attachementRepository.findById(1L)).thenReturn(Optional.of(attachement));

        Resource resource = fileStorageService.chargerFichier(1L, utilisateurUser);

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.isReadable()).isTrue();
    }

    @Test
    @DisplayName("Suppression réussie d'une pièce jointe (disque + BDD)")
    void supprimerFichier_Succes() throws IOException {
        Path ticketFolder = tempUploadDir.resolve("ticket-10");
        Files.createDirectories(ticketFolder);
        Path physicalFile = ticketFolder.resolve("stored_doc.pdf");
        Files.writeString(physicalFile, "test-content");

        Attachement attachement = Attachement.builder()
                .id(1L)
                .nomFichierOriginal("doc.pdf")
                .nomFichierStocke("stored_doc.pdf")
                .cheminRelatif("ticket-10/stored_doc.pdf")
                .ticket(ticket)
                .uploader(utilisateurUser)
                .build();

        when(attachementRepository.findById(1L)).thenReturn(Optional.of(attachement));

        fileStorageService.supprimerFichier(1L, utilisateurUser);

        assertThat(Files.exists(physicalFile)).isFalse();
        verify(attachementRepository, times(1)).delete(attachement);
    }

    @Test
    @DisplayName("Lister les pièces jointes d'un ticket")
    void listerAttachementsTicket_Succes() {
        Attachement attachement = Attachement.builder()
                .id(1L)
                .nomFichierOriginal("doc.pdf")
                .nomFichierStocke("stored_doc.pdf")
                .typeMime("application/pdf")
                .taille(1024L)
                .cheminRelatif("ticket-10/stored_doc.pdf")
                .ticket(ticket)
                .uploader(utilisateurUser)
                .build();

        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(attachementRepository.findByTicketIdOrderByDateUploadDesc(10L)).thenReturn(List.of(attachement));

        List<AttachementDTO> list = fileStorageService.listerAttachementsTicket(10L, utilisateurUser);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getNomFichierOriginal()).isEqualTo("doc.pdf");
    }
}
