package com.helpdesk.helpdeskbackend.config;

import com.helpdesk.helpdeskbackend.entity.*;
import com.helpdesk.helpdeskbackend.repository.CategorieRepository;
import com.helpdesk.helpdeskbackend.repository.RoleRepository;
import com.helpdesk.helpdeskbackend.repository.TicketRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategorieRepository categorieRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // 1. Initialisation des Rôles
        Role adminRole = roleRepository.findByNom("ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setNom("ADMIN");
                    r.setDescription("Administrateur Système");
                    return roleRepository.save(r);
                });

        Role technicienRole = roleRepository.findByNom("TECHNICIEN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setNom("TECHNICIEN");
                    r.setDescription("Technicien Support");
                    return roleRepository.save(r);
                });

        Role userRole = roleRepository.findByNom("USER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setNom("USER");
                    r.setDescription("Utilisateur Standard");
                    return roleRepository.save(r);
                });

        // 2. Initialisation des Utilisateurs de test
        User admin = userRepository.findByEmail("admin@helpdesk.com")
                .orElseGet(() -> {
                    User u = User.builder()
                            .nom("Admin")
                            .prenom("System")
                            .email("admin@helpdesk.com")
                            .password(passwordEncoder.encode("admin123"))
                            .role(adminRole)
                            .actif(true)
                            .telephone("0600000001")
                            .dateCreation(LocalDateTime.now())
                            .build();
                    return userRepository.save(u);
                });

        User technicien = userRepository.findByEmail("tech@helpdesk.com")
                .orElseGet(() -> {
                    User u = User.builder()
                            .nom("Tech")
                            .prenom("Support")
                            .email("tech@helpdesk.com")
                            .password(passwordEncoder.encode("tech123"))
                            .role(technicienRole)
                            .actif(true)
                            .telephone("0600000002")
                            .dateCreation(LocalDateTime.now())
                            .build();
                    return userRepository.save(u);
                });

        User user = userRepository.findByEmail("user@helpdesk.com")
                .orElseGet(() -> {
                    User u = User.builder()
                            .nom("User")
                            .prenom("Test")
                            .email("user@helpdesk.com")
                            .password(passwordEncoder.encode("user123"))
                            .role(userRole)
                            .actif(true)
                            .telephone("0600000003")
                            .dateCreation(LocalDateTime.now())
                            .build();
                    return userRepository.save(u);
                });

        // 3. Initialisation des Catégories de test
        Categorie catMateriel = categorieRepository.findByNom("Matériel")
                .orElseGet(() -> categorieRepository.save(Categorie.builder()
                        .nom("Matériel")
                        .description("Problèmes liés aux équipements physiques : ordinateurs, imprimantes, écrans, périphériques.")
                        .build()));

        Categorie catLogiciel = categorieRepository.findByNom("Logiciel")
                .orElseGet(() -> categorieRepository.save(Categorie.builder()
                        .nom("Logiciel")
                        .description("Installation, licences, bugs applicatifs et mises à jour de logiciels.")
                        .build()));

        Categorie catReseau = categorieRepository.findByNom("Réseau & Connexion")
                .orElseGet(() -> categorieRepository.save(Categorie.builder()
                        .nom("Réseau & Connexion")
                        .description("Problèmes de connectivité Wi-Fi, VPN, pare-feu et accès Internet.")
                        .build()));

        Categorie catAcces = categorieRepository.findByNom("Accès & Comptes")
                .orElseGet(() -> categorieRepository.save(Categorie.builder()
                        .nom("Accès & Comptes")
                        .description("Gestion des identifiants, réinitialisation de mot de passe et habilitations.")
                        .build()));

        // 4. Initialisation des Tickets de test (si aucun ticket n'existe)
        if (ticketRepository.count() == 0) {
            Ticket ticket1 = Ticket.builder()
                    .titre("Écran secondaire ne s'allume plus")
                    .description("Depuis ce matin, mon deuxième écran branché en HDMI reste noir malgré le redémarrage du PC.")
                    .priorite(Priorite.HAUTE)
                    .status(StatutTicket.NOUVEAU)
                    .categorie(catMateriel)
                    .createur(user)
                    .dateCreation(LocalDateTime.now().minusHours(3))
                    .build();

            Ticket ticket2 = Ticket.builder()
                    .titre("Impossible de se connecter au VPN entreprise")
                    .description("Erreur d'authentification SSL lors de la connexion au VPN depuis mon domicile.")
                    .priorite(Priorite.HAUTE)
                    .status(StatutTicket.EN_COURS)
                    .categorie(catReseau)
                    .createur(user)
                    .technicien(technicien)
                    .dateCreation(LocalDateTime.now().minusDays(1))
                    .build();

            Ticket ticket3 = Ticket.builder()
                    .titre("Demande d'installation de Docker et VS Code")
                    .description("Besoin des outils de développement pour le nouveau projet frontend et backend.")
                    .priorite(Priorite.MOYENNE)
                    .status(StatutTicket.RESOLU)
                    .categorie(catLogiciel)
                    .createur(user)
                    .technicien(technicien)
                    .dateCreation(LocalDateTime.now().minusDays(3))
                    .dateResolution(LocalDateTime.now().minusHours(5))
                    .build();

            Ticket ticket4 = Ticket.builder()
                    .titre("Réinitialisation du mot de passe messagerie")
                    .description("Compte de messagerie Outlook bloqué suite à plusieurs tentatives erronées.")
                    .priorite(Priorite.BASSE)
                    .status(StatutTicket.CLOTURE)
                    .categorie(catAcces)
                    .createur(user)
                    .technicien(technicien)
                    .dateCreation(LocalDateTime.now().minusDays(5))
                    .dateResolution(LocalDateTime.now().minusDays(4))
                    .dateCloture(LocalDateTime.now().minusDays(4))
                    .build();

            Ticket ticket5 = Ticket.builder()
                    .titre("Bourrage papier récurent sur l'imprimante RH")
                    .description("L'imprimante multifonction du 2ème étage bloque les feuilles dans le bac 2.")
                    .priorite(Priorite.MOYENNE)
                    .status(StatutTicket.NOUVEAU)
                    .categorie(catMateriel)
                    .createur(user)
                    .dateCreation(LocalDateTime.now().minusMinutes(45))
                    .build();

            ticketRepository.save(ticket1);
            ticketRepository.save(ticket2);
            ticketRepository.save(ticket3);
            ticketRepository.save(ticket4);
            ticketRepository.save(ticket5);

            System.out.println("✅ Données de test (Rôles, Utilisateurs, Catégories et Tickets) initialisées avec succès !");
        }
    }
}