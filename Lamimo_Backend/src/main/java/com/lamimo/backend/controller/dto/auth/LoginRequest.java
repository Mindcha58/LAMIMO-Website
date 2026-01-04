package com.lamimo.backend.controller.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "กรุณากรอกอีเมล")
    @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
    public String email;

    @NotBlank(message = "กรุณากรอกรหัสผ่าน")
    public String password;
}
