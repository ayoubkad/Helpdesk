package com.helpdesk.helpdeskbackend.controller;

import com.helpdesk.helpdeskbackend.dto.AuthResponse;
import com.helpdesk.helpdeskbackend.dto.LoginRequest;
import com.helpdesk.helpdeskbackend.dto.RegisterRequest;
import com.helpdesk.helpdeskbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}