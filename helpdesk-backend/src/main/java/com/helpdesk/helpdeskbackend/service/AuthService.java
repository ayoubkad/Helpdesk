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

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Erreur: Cet email est déjà utilisé !");
        }

        User user = new User();
        // Correction : Utilisation de setNom au lieu de setUsername
        user.setNom(request.getNom()); 
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

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
        
        // Correction : getNom() au lieu de getLibelle()
        String roleName = (user.getRole() != null) ? user.getRole().getNom() : "USER";

        return new AuthResponse(token, user.getEmail(), roleName);
    }
}