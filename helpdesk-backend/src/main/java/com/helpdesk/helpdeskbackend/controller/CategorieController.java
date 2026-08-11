package com.helpdesk.helpdeskbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.helpdesk.helpdeskbackend.service.CategorieService;
import com.helpdesk.helpdeskbackend.dto.CategorieDTO;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategorieController {
    private final CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<CategorieDTO>> listerToutesLesCategories() {
        return ResponseEntity.ok(categorieService.listerToutesLesCategories());
    }

    @PostMapping
    public ResponseEntity<CategorieDTO> creerCategorie(
            @Valid @RequestBody CategorieDTO categorieDTO
    ) {
        return new ResponseEntity<>(categorieService.creerCategorie(categorieDTO), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerCategorie(@PathVariable Long id) {
        categorieService.supprimerCategorie(id);
    }

}
