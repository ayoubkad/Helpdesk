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

        String nomRole = request.getRole().getNom().toUpperCase();
        Role role = roleRepository.findByNom(nomRole)
                .orElseThrow(() -> new RuntimeException("Erreur: Le rôle '" + nomRole + "' n'existe pas en BDD !"));

//        User user = new User();
//        user.setNom(request.getNom());
//        user.setPrenom(request.getPrenom());
//        user.setEmail(request.getEmail());
//        user.setTelephone(request.getTelephone());
//        user.setRole(role);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));

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