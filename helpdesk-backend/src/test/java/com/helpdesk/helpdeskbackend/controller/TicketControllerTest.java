package com.helpdesk.helpdeskbackend.controller;

import com.helpdesk.helpdeskbackend.dto.TicketDTO;
import com.helpdesk.helpdeskbackend.entity.Priorite;
import com.helpdesk.helpdeskbackend.entity.StatutTicket;
import com.helpdesk.helpdeskbackend.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class TicketControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private TicketController ticketController;

    private ObjectMapper objectMapper;
    private TicketDTO ticketDTOInput;
    private TicketDTO ticketDTOResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(ticketController).build();
        objectMapper = new ObjectMapper();

        ticketDTOInput = TicketDTO.builder()
                .titre("Problème d'impression")
                .description("L'imprimante ne répond plus depuis ce matin")
                .priorite(Priorite.HAUTE)
                .categorieId(5L)
                .build();

        ticketDTOResponse = TicketDTO.builder()
                .id(1L)
                .titre("Problème d'impression")
                .description("L'imprimante ne répond plus depuis ce matin")
                .status(StatutTicket.NOUVEAU)
                .priorite(Priorite.HAUTE)
                .dateCreation(LocalDateTime.now())
                .createurId(10L)
                .categorieId(5L)
                .build();
    }

    @Nested
    @DisplayName("POST /api/tickets - Création de ticket")
    class CreerTicketControllerTests {

        @Test
        @DisplayName("Devrait retourner HTTP 201 Created et le ticket créé lors d'un POST valide")
        void creerTicket_DevraitRetourner201EtTicket() throws Exception {
            // Arrange
            when(ticketService.creerTicket(any(TicketDTO.class), eq(10L))).thenReturn(ticketDTOResponse);

            // Act & Assert
            mockMvc.perform(post("/api/tickets")
                            .param("createurId", "10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(ticketDTOInput)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.titre", is("Problème d'impression")))
                    .andExpect(jsonPath("$.description", is("L'imprimante ne répond plus depuis ce matin")))
                    .andExpect(jsonPath("$.status", is("NOUVEAU")))
                    .andExpect(jsonPath("$.priorite", is("HAUTE")))
                    .andExpect(jsonPath("$.createurId", is(10)))
                    .andExpect(jsonPath("$.categorieId", is(5)));

            verify(ticketService).creerTicket(any(TicketDTO.class), eq(10L));
        }

        @Test
        @DisplayName("Devrait retourner HTTP 400 Bad Request si le paramètre createurId est manquant")
        void creerTicket_DevraitRetourner400_SiParametreCreateurIdAbsence() throws Exception {
            mockMvc.perform(post("/api/tickets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(ticketDTOInput)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/tickets - Lister tous les tickets")
    class ListerTousLesTicketsControllerTests {

        /* @Test
        @DisplayName("Devrait retourner HTTP 200 OK et la liste des tickets")
        void listerTousLesTickets_DevraitRetourner200EtListe() throws Exception {
            // Arrange
            TicketDTO secondTicket = TicketDTO.builder()
                    .id(2L)
                    .titre("Écran cassé")
                    .description("Écran fissuré après une chute")
                    .status(StatutTicket.EN_COURS)
                    .priorite(Priorite.MOYENNE)
                    .createurId(11L)
                    .build();

            when(ticketService.listTousTickets()).thenReturn(List.of(ticketDTOResponse, secondTicket));

            // Act & Assert
            mockMvc.perform(get("/api/tickets")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].titre", is("Problème d'impression")))
                    .andExpect(jsonPath("$[1].id", is(2)))
                    .andExpect(jsonPath("$[1].titre", is("Écran cassé")));

            verify(ticketService).listTousTickets();
        }

        @Test
        @DisplayName("Devrait retourner HTTP 200 OK et une liste vide si aucun ticket n'existe")
        void listerTousLesTickets_DevraitRetourner200EtListeVide() throws Exception {
            // Arrange
            when(ticketService.listTousTickets()).thenReturn(List.of());

            // Act & Assert
            mockMvc.perform(get("/api/tickets")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(ticketService).listTousTickets();
        } */

        @Test
        @DisplayName("Devrait retourner HTTP 200 OK et la liste paginée des tickets")
        void listerTousLesTickets_DevraitRetourner200EtListe() throws Exception {
            // Arrange
            TicketDTO secondTicket = TicketDTO.builder()
                    .id(2L)
                    .titre("Écran cassé")
                    .description("Écran fissuré après une chute")
                    .status(StatutTicket.EN_COURS)
                    .priorite(Priorite.MOYENNE)
                    .createurId(11L)
                    .build();

            Pageable pageable = PageRequest.of(0, 10);
            Page<TicketDTO> pageTickets = new PageImpl<>(List.of(ticketDTOResponse, secondTicket), pageable, 2);

            when(ticketService.listTousTickets(any(Pageable.class))).thenReturn(pageTickets); // any(Pageable.class) dit à Mockito "peu importe quel Pageable est passé, retourne ce résultat"
            // Le vrai changement côté JSON : avant, la réponse était un tableau brut [...], donc $ pointait directement dessus ($[0].id). Maintenant c'est un objet paginé, donc il faut viser $.content[0].id et non plus $[0].id.
            // Act & Assert
            mockMvc.perform(get("/api/tickets")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].id", is(1)))
                    .andExpect(jsonPath("$.content[0].titre", is("Problème d'impression")))
                    .andExpect(jsonPath("$.content[1].id", is(2)))
                    .andExpect(jsonPath("$.content[1].titre", is("Écran cassé")))
                    .andExpect(jsonPath("$.totalElements", is(2)));

            verify(ticketService).listTousTickets(any(Pageable.class));
        }

        @Test
        @DisplayName("Devrait retourner HTTP 200 OK et une page vide si aucun ticket n'existe")
        void listerTousLesTickets_DevraitRetourner200EtListeVide() throws Exception {
            // Arrange
            Pageable pageable = PageRequest.of(0, 10);
            Page<TicketDTO> pageVide = new PageImpl<>(List.of(), pageable, 0);

            when(ticketService.listTousTickets(any(Pageable.class))).thenReturn(pageVide);

            // Act & Assert
            mockMvc.perform(get("/api/tickets")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(ticketService).listTousTickets(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Autres endpoints GET de TicketController")
    class AutresEndpointsGetControllerTests {

        @Test
        @DisplayName("GET /api/tickets/{id} - Devrait retourner HTTP 200 OK et le ticket")
        void getTicketById_DevraitRetourner200() throws Exception {
            when(ticketService.getTicketById(1L)).thenReturn(ticketDTOResponse);

            mockMvc.perform(get("/api/tickets/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.titre", is("Problème d'impression")));
        }

        @Test
        @DisplayName("GET /api/tickets/user/{userId} - Devrait retourner HTTP 200 OK et les tickets de l'utilisateur")
        void listerTicketsParUtilisateur_DevraitRetourner200() throws Exception {
            when(ticketService.listerTicketsParUtilisateur(10L)).thenReturn(List.of(ticketDTOResponse));

            mockMvc.perform(get("/api/tickets/user/10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].createurId", is(10)));
        }
    }

    @Nested
    @DisplayName("Endpoints PUT de modification de TicketController")
    class ModificationEndpointsControllerTests {

        @Test
        @DisplayName("PUT /api/tickets/{id}/assigner - Devrait retourner HTTP 200 OK")
        void assignerTechnicien_DevraitRetourner200() throws Exception {
            ticketDTOResponse.setTechnicienId(2L);
            ticketDTOResponse.setStatus(StatutTicket.EN_COURS);
            when(ticketService.assignerTechnicien(1L, 2L)).thenReturn(ticketDTOResponse);

            mockMvc.perform(put("/api/tickets/1/assigner")
                            .param("techId", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.technicienId", is(2)))
                    .andExpect(jsonPath("$.status", is("EN_COURS")));
        }

        @Test
        @DisplayName("PUT /api/tickets/{id}/statut - Devrait retourner HTTP 200 OK")
        void changerStatut_DevraitRetourner200() throws Exception {
            ticketDTOResponse.setStatus(StatutTicket.RESOLU);
            when(ticketService.changerStatut(1L, StatutTicket.RESOLU)).thenReturn(ticketDTOResponse);

            mockMvc.perform(put("/api/tickets/1/statut")
                            .param("statutTicket", "RESOLU"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("RESOLU")));
        }

        @Test
        @DisplayName("PUT /api/tickets/{id}/cloturer - Devrait retourner HTTP 200 OK")
        void cloturerTicket_DevraitRetourner200() throws Exception {
            ticketDTOResponse.setStatus(StatutTicket.CLOTURE);
            when(ticketService.cloturerTicket(1L)).thenReturn(ticketDTOResponse);

            mockMvc.perform(put("/api/tickets/1/cloturer"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("CLOTURE")));
        }

        @Test
        @DisplayName("PUT /api/tickets/{id}/rouvrir - Devrait retourner HTTP 200 OK")
        void rouvrirTicket_DevraitRetourner200() throws Exception {
            ticketDTOResponse.setStatus(StatutTicket.EN_COURS);
            when(ticketService.rouvrirTicket(1L)).thenReturn(ticketDTOResponse);

            mockMvc.perform(put("/api/tickets/1/rouvrir"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("EN_COURS")));
        }
    }
}
