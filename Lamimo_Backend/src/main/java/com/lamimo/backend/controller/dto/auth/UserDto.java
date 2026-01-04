package com.lamimo.backend.controller.dto.auth;

public class UserDto {
    public Long id;
    public String email;
    public String role;

    public UserDto(Long id, String email, String role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }
}
