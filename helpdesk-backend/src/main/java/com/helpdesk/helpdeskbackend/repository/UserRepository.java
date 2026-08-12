package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Pour la recherche par email
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
    Optional<User> findAllByEmail(String email); // Tu peux garder celle-ci si besoin ailleurs

    // Pour la vérification d'existence
    boolean existsByEmail(String email);
    boolean existsAllByEmail(String email);

    // Tes filtres spécifiques
    List<User> findAllByActif(boolean actif);

    List<User> findByRoleNom(String nomRole);
}