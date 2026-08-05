package com.helpdesk.helpdeskbackend.config;

import com.helpdesk.helpdeskbackend.entity.Role;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.RoleRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {

            // Correction : findByNom + setNom
            Role adminRole = roleRepository.findByNom("ADMIN")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setNom("ADMIN");
                        return roleRepository.save(r);
                    });

            Role userRole = roleRepository.findByNom("USER")
                    .orElseGet(() -> {
                        Role r = new Role();
                        r.setNom("USER");
                        return roleRepository.save(r);
                    });

            // Correction : setNom et setPrenom au lieu de setUsername
            User admin = new User();
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setEmail("admin@helpdesk.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);

            User user = new User();
            user.setNom("User");
            user.setPrenom("Test");
            user.setEmail("user@helpdesk.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(userRole);

            userRepository.save(admin);
            userRepository.save(user);

            System.out.println("✅ Données de test initialisées avec succès !");
        }
    }
}