package com.helpdesk.helpdeskbackend.service;

import com.helpdesk.helpdeskbackend.dto.CategorieDTO;
import com.helpdesk.helpdeskbackend.entity.Categorie;
import com.helpdesk.helpdeskbackend.repository.CategorieRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategorieService {
    private final CategorieRepository categorieRepository;

    @Transactional(readOnly = true)
    public List<CategorieDTO> listerToutesLesCategories() {
        return categorieRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public CategorieDTO creerCategorie(CategorieDTO categorieDTO) {
        if (categorieDTO.getNom() == null || categorieDTO.getNom().isEmpty()) {
            throw new RuntimeException("Erreur: le nom de catégorie est obligatoire !!!");
        }
        String nomCategorie = categorieDTO.getNom().trim();

        if (categorieRepository.existsByNomIgnoreCase(nomCategorie)) {
            throw new RuntimeException("Erreur: La catégorie '" + nomCategorie + "' existe déjà !");
        }

        Categorie categorie = Categorie.builder()
                .id(categorieDTO.getId())
                .nom(categorieDTO.getNom())
                .description(categorieDTO.getDescription() == null ? null : categorieDTO.getDescription().trim())
                .build();
        Categorie categorieSauvegarde = categorieRepository.save(categorie);
        log.info("Catégorie ajoute avec succès ID={}", categorieSauvegarde.getId());
        return toDTO(categorieSauvegarde);
    }

    @Transactional
    public void supprimerCategorie(Long id) {
        Categorie categorie = categorieRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Erreur: La catégorie avec l'ID " + id + " n'existe pas !"));
        try {
            categorieRepository.delete(categorie);
            log.info("Catégorie supprimée avec succès: ID={}", id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Erreur: Impossible de supprimer cette catégorie car elle est liée à des tickets existants !");
        }
    }

    public CategorieDTO toDTO(@NotNull Categorie categorie) {
        return CategorieDTO.builder()
                .id(categorie.getId())
                .nom(categorie.getNom())
                .description(categorie.getDescription())
                .build();
    }
}
