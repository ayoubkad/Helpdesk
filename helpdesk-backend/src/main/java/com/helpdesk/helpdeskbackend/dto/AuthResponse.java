package com.helpdesk.helpdeskbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long id;

    public AuthResponse(String token, String email, String role) {
        this.token = token;
        this.email = email;
        this.role = role;
    }
}