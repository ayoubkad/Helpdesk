package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.dto.CategorieDTO;
import com.helpdesk.helpdeskbackend.entity.Categorie;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    Optional<Categorie> findAllByNom(String nom);
    Optional<Categorie> findByNom(String nom);
    boolean existsByNomIgnoreCase(String nom);
}
