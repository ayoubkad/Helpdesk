package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.AuthResponse;
import com.helpdesk.helpdeskbackend.dto.LoginRequest;
import com.helpdesk.helpdeskbackend.dto.RegisterRequest;
import com.helpdesk.helpdeskbackend.entity.Role;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.RoleRepository;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import com.helpdesk.helpdeskbackend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RoleRepository roleRepository;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Erreur: Cet email est déjà utilisé !");
        }
        //Correction de sécurité (Semaine 2 - Priorité 1) :
        // le rôle n'est JAMAIS pris depuis la requête envoyée par le client.
        // Tout compte créé via /api/auth/register est forcément un USER.
        // Les comptes TECHNICIEN et ADMIN ne sont créés que par DataInitializer.
        Role role = roleRepository.findByNom("USER")
                .orElseThrow(() -> new RuntimeException("Erreur: Le rôle 'USER' n'existe pas en BDD !"));

        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .role(role)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        return "Utilisateur enregistré avec succès !";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect !");
        }

        String token = jwtUtils.generateTokenFromUsername(user.getEmail());
        
        String roleName = (user.getRole() != null) ? user.getRole().getNom() : "USER";

        return new AuthResponse(token, user.getEmail(), roleName, user.getId());
    }
}