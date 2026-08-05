package com.helpdesk.helpdeskbackend.dto;

import com.helpdesk.helpdeskbackend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
}