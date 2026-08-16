package com.helpdesk.helpdeskbackend.controller;

import com.helpdesk.helpdeskbackend.dto.CommentaireDTO;
import com.helpdesk.helpdeskbackend.dto.CommentaireRequestDTO;
import com.helpdesk.helpdeskbackend.entity.User;
import com.helpdesk.helpdeskbackend.repository.UserRepository;
import com.helpdesk.helpdeskbackend.service.CommentaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentaireController {

    private final CommentaireService commentaireService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<CommentaireDTO> ajouterCommentaire(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentaireRequestDTO commentaireRequestDTO,
            Authentication authentication
    ) {
        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));

        CommentaireDTO commentaireDTO = commentaireService.ajouterCommentaire(
                ticketId,
                commentaireRequestDTO.getContenu(),
                commentaireRequestDTO.isEstInterne(),
                currentUser
        );

        return new ResponseEntity<>(commentaireDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CommentaireDTO>> listCommentairesParTicket(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        User currentUser = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));

        List<CommentaireDTO> commentaireDTOSList = commentaireService.listCommentairesParTicket(ticketId, currentUser);
        return ResponseEntity.ok(commentaireDTOSList);
    }
}