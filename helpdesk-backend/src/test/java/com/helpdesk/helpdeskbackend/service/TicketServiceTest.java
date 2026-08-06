package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.TicketDTO;
import com.helpdesk.helpdeskbackend.entity.Categorie;
import com.helpdesk.helpdeskbackend.entity.Priorite;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.entity.Ticket;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.CategorieRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategorieRepository categorieRepository;

    @InjectMocks
    private TicketService ticketService;

    private User createur;
    private User technicien;
    private Categorie categorie;
    private TicketDTO ticketDTOInput;
    private Ticket ticketSauvegarde;

    @BeforeEach
    void setUp() {
        createur = User.builder()
                .id(1L)
                .nom("Dupont")
                .prenom("Jean")
                .email("jean.dupont@example.com")
                .password("password")
                .actif(true)
                .build();

        technicien = User.builder()
                .id(2L)
                .nom("Martin")
                .prenom("Alice")
                .email("alice.martin@example.com")
                .password("password")
                .actif(true)
                .build();

        categorie = Categorie.builder()
                .id(10L)
                .nom("Réseau")
                .description("Problèmes de connexion réseau")
                .build();

        ticketDTOInput = TicketDTO.builder()
                .titre("Problème connexion Wi-Fi")
                .description("Impossible de se connecter au réseau Wi-Fi du 2ème étage")
                .priorite(Priorite.HAUTE)
                .status(StatutTicket.NOUVEAU)
                .categorieId(10L)
                .build();

        ticketSauvegarde = Ticket.builder()
                .id(100L)
                .titre("Problème connexion Wi-Fi")
                .description("Impossible de se connecter au réseau Wi-Fi du 2ème étage")
                .status(StatutTicket.NOUVEAU)
                .priorite(Priorite.HAUTE)
                .dateCreation(LocalDateTime.now())
                .createur(createur)
                .categorie(categorie)
                .build();
    }

    @Nested
    @DisplayName("Tests pour creerTicket")
    class CreerTicketTests {

        @Test
        @DisplayName("Devrait créer un ticket avec succès lorsque toutes les données sont valides")
        void creerTicket_Succes_AvecCategorie() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(createur));
            when(categorieRepository.findById(10L)).thenReturn(Optional.of(categorie));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(ticketSauvegarde);

            // Act
            TicketDTO meResultat = ticketService.creerTicket(ticketDTOInput, 1L);

            // Assert
            assertThat(meResultat).isNotNull();
            assertThat(meResultat.getId()).isEqualTo(100L);
            assertThat(meResultat.getTitre()).isEqualTo("Problème connexion Wi-Fi");
            assertThat(meResultat.getCreateurId()).isEqualTo(1L);
            assertThat(meResultat.getCategorieId()).isEqualTo(10L);
            assertThat(meResultat.getStatus()).isEqualTo(StatutTicket.NOUVEAU);

            verify(userRepository, times(1)).findById(1L);
            verify(categorieRepository, times(1)).findById(10L);
            verify(ticketRepository, times(1)).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Devrait créer un ticket sans catégorie si categorieId est null")
        void creerTicket_Succes_SansCategorie() {
            // Arrange
            ticketDTOInput.setCategorieId(null);
            ticketSauvegarde.setCategorie(null);

            when(userRepository.findById(1L)).thenReturn(Optional.of(createur));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(ticketSauvegarde);

            // Act
            TicketDTO resultat = ticketService.creerTicket(ticketDTOInput, 1L);

            // Assert
            assertThat(resultat).isNotNull();
            assertThat(resultat.getCategorieId()).isNull();

            verify(categorieRepository, never()).findById(any());
            verify(ticketRepository, times(1)).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Devrait attribuer le statut NOUVEAU par défaut si le statut est null dans le DTO")
        void creerTicket_Succes_StatutParDefautSiNull() {
            // Arrange
            ticketDTOInput.setStatus(null);

            when(userRepository.findById(1L)).thenReturn(Optional.of(createur));
            when(categorieRepository.findById(10L)).thenReturn(Optional.of(categorie));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(ticketSauvegarde);

            // Act
            ticketService.creerTicket(ticketDTOInput, 1L);

            // Assert
            ArgumentCaptor<Ticket> ticketCaptor = ArgumentCaptor.forClass(Ticket.class);
            verify(ticketRepository).save(ticketCaptor.capture());
            assertThat(ticketCaptor.getValue().getStatus()).isEqualTo(StatutTicket.NOUVEAU);
        }

        @Test
        @DisplayName("Devrait lancer RuntimeException si l'utilisateur créateur est introuvable")
        void creerTicket_UtilisateurIntrouvable_LanceException() {
            // Arrange
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> ticketService.creerTicket(ticketDTOInput, 99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Utilisateur introuvable avec l'ID : 99");

            verify(ticketRepository, never()).save(any());
        }

        @Test
        @DisplayName("Devrait lancer RuntimeException si la catégorie est introuvable")
        void creerTicket_CategorieIntrouvable_LanceException() {
            // Arrange
            when(userRepository.findById(1L)).thenReturn(Optional.of(createur));
            when(categorieRepository.findById(10L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> ticketService.creerTicket(ticketDTOInput, 1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Catégorie introuvable avec l'ID : 10");

            verify(ticketRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Tests pour la lecture de tickets (listTousTickets, listerTicketsParUtilisateur, getTicketById)")
    class LectureTicketsTests {

        @Test
        @DisplayName("Devrait retourner la liste de tous les tickets")
        void listTousTickets_RetourneListe() {
            // Arrange
            Ticket ticket2 = Ticket.builder()
                    .id(101L)
                    .titre("Écran noir")
                    .status(StatutTicket.EN_COURS)
                    .createur(createur)
                    .build();

            when(ticketRepository.findAll()).thenReturn(List.of(ticketSauvegarde, ticket2));

            // Act
            List<TicketDTO> resultat = ticketService.listTousTickets();

            // Assert
            assertThat(resultat).hasSize(2);
            assertThat(resultat.get(0).getId()).isEqualTo(100L);
            assertThat(resultat.get(1).getId()).isEqualTo(101L);
            verify(ticketRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Devrait retourner une liste vide s'il n'y a pas de tickets")
        void listTousTickets_RetourneListeVide() {
            // Arrange
            when(ticketRepository.findAll()).thenReturn(List.of());

            // Act
            List<TicketDTO> resultat = ticketService.listTousTickets();

            // Assert
            assertThat(resultat).isEmpty();
        }

        @Test
        @DisplayName("Devrait retourner la liste des tickets d'un utilisateur spécifique")
        void listerTicketsParUtilisateur_RetourneTicketsUtilisateur() {
            // Arrange
            when(ticketRepository.findByCreateurId(1L)).thenReturn(List.of(ticketSauvegarde));

            // Act
            List<TicketDTO> resultat = ticketService.listerTicketsParUtilisateur(1L);

            // Assert
            assertThat(resultat).hasSize(1);
            assertThat(resultat.get(0).getCreateurId()).isEqualTo(1L);
            verify(ticketRepository, times(1)).findByCreateurId(1L);
        }

        @Test
        @DisplayName("Devrait retourner un ticket par son ID s'il existe")
        void getTicketById_Succes() {
            // Arrange
            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));

            // Act
            TicketDTO resultat = ticketService.getTicketById(100L);

            // Assert
            assertThat(resultat).isNotNull();
            assertThat(resultat.getId()).isEqualTo(100L);
            assertThat(resultat.getTitre()).isEqualTo("Problème connexion Wi-Fi");
        }

        @Test
        @DisplayName("Devrait lancer RuntimeException si le ticket n'existe pas par son ID")
        void getTicketById_Introuvable_LanceException() {
            // Arrange
            when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> ticketService.getTicketById(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Ticket introuvable avec l'ID : 999");
        }
    }

    @Nested
    @DisplayName("Tests pour la gestion du cycle de vie des tickets (assigner, statut, cloturer, rouvrir)")
    class CycleDeVieTicketTests {

        @Test
        @DisplayName("Devrait assigner un technicien et passer le statut à EN_COURS si NOUVEAU")
        void assignerTechnicien_Succes() {
            // Arrange
            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));
            when(userRepository.findById(2L)).thenReturn(Optional.of(technicien));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            TicketDTO resultat = ticketService.assignerTechnicien(100L, 2L);

            // Assert
            assertThat(resultat.getTechnicienId()).isEqualTo(2L);
            assertThat(resultat.getStatus()).isEqualTo(StatutTicket.EN_COURS);
            verify(ticketRepository, times(1)).save(ticketSauvegarde);
        }

        @Test
        @DisplayName("Devrait lancer une exception si le technicien à assigner n'existe pas")
        void assignerTechnicien_TechnicienIntrouvable() {
            // Arrange
            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> ticketService.assignerTechnicien(100L, 99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Technicien introuvable avec l'ID : 99");
        }

        @Test
        @DisplayName("Devrait changer le statut du ticket et renseigner dateResolution si RESOLU")
        void changerStatut_Succes_Resolu() {
            // Arrange
            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            TicketDTO resultat = ticketService.changerStatut(100L, StatutTicket.RESOLU);

            // Assert
            assertThat(resultat.getStatus()).isEqualTo(StatutTicket.RESOLU);
            assertThat(resultat.getDateResolution()).isNotNull();
        }

        @Test
        @DisplayName("Devrait clôturer le ticket et renseigner dateCloture")
        void cloturerTicket_Succes() {
            // Arrange
            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            TicketDTO resultat = ticketService.cloturerTicket(100L);

            // Assert
            assertThat(resultat.getStatus()).isEqualTo(StatutTicket.CLOTURE);
            assertThat(resultat.getDateCloture()).isNotNull();
        }

        @Test
        @DisplayName("Devrait rouvrir un ticket clôturé")
        void rouvrirTicket_Succes() {
            // Arrange
            ticketSauvegarde.setStatus(StatutTicket.CLOTURE);
            ticketSauvegarde.setDateCloture(LocalDateTime.now());

            when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticketSauvegarde));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            TicketDTO resultat = ticketService.rouvrirTicket(100L);

            // Assert
            assertThat(resultat.getStatus()).isEqualTo(StatutTicket.EN_COURS);
            assertThat(resultat.getDateCloture()).isNull();
        }
    }
}
