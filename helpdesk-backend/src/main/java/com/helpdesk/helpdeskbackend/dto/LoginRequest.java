package com.helpdesk.helpdeskbackend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}