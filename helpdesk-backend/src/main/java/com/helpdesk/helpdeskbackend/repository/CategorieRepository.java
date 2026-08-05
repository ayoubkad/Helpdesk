package com.helpdesk.helpdeskbackend.repository;

import com.helpdesk.helpdeskbackend.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    Optional<Categorie> findAllByNom(String nom);
}
