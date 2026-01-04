package com.lamimo.backend.controller.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @Email @NotBlank
    public String email;

    @NotBlank
    public String password;

    public String firstName;
    public String lastName;
    public String phone;
    public String gender; // optional
    public String dob;    // "YYYY-MM-DD" optional
}
