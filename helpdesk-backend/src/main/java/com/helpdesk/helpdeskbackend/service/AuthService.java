package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.AuthResponse;
import com.helpdesk.helpdeskbackend.dto.LoginRequest;
import com.helpdesk.helpdeskbackend.dto.RegisterRequest;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import com.helpdesk.helpdeskbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // Inscription d'un utilisateur
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Erreur: Cet email est déjà utilisé !");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        // Hachage du mot de passe avec BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        return "Utilisateur enregistré avec succès !";
    }

    // Connexion d'un utilisateur
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect !");
        }

        // Génération du Token JWT
        String token = jwtUtils.generateJwtToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}