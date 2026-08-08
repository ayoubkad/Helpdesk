package com.helpdesk.helpdeskbackend.config;

import com.helpdesk.helpdeskbackend.entity.Role;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.RoleRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

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

//        if (userRepository.count() == 0) {
//
//            User admin = new User();
//            admin.setNom("Admin");
//            admin.setPrenom("System");
//            admin.setEmail("admin@helpdesk.com");
//            admin.setPassword(passwordEncoder.encode("admin123"));
//            admin.setRole(adminRole);
//            admin.setActif(true);
//            admin.setDateCreation(LocalDateTime.now());
//
//            User technicien = new User();
//            technicien.setNom("Tech");
//            technicien.setPrenom("Support");
//            technicien.setEmail("tech@helpdesk.com");
//            technicien.setPassword(passwordEncoder.encode("tech123"));
//            technicien.setRole(technicienRole);
//            technicien.setActif(true);
//            technicien.setDateCreation(LocalDateTime.now());
//
//            User user = new User();
//            user.setNom("User");
//            user.setPrenom("Test");
//            user.setEmail("user@helpdesk.com");
//            user.setPassword(passwordEncoder.encode("user123"));
//            user.setRole(userRole);
//            user.setActif(true);
//            user.setDateCreation(LocalDateTime.now());
//
//            userRepository.save(admin);
//            userRepository.save(technicien);
//            userRepository.save(user);
//
//            System.out.println("✅ Données de test initialisées avec succès !");
//        }
    }
}