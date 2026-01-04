package com.lamimo.backend.controller.auth;

import com.lamimo.backend.controller.dto.auth.*;
import com.lamimo.backend.entity.Role;
import com.lamimo.backend.entity.User;
import com.lamimo.backend.repository.UserRepository;
import com.lamimo.backend.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository userRepo, PasswordEncoder encoder, JwtService jwt) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.email)) {
            throw new RuntimeException("Email already exists");
        }

        User u = new User();
        u.setEmail(req.email);
        u.setPasswordHash(encoder.encode(req.password));
        u.setFirstName(req.firstName);
        u.setLastName(req.lastName);
        u.setPhone(req.phone);
        u.setGender(req.gender);
        u.setRole(Role.USER); // ปลอดภัย: สมัครเองเป็น USER เท่านั้น

        if (req.dob != null && !req.dob.isBlank()) {
            u.setDob(LocalDate.parse(req.dob));
        }

        userRepo.save(u);
        return "registered";
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = userRepo.findByEmail(req.email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!encoder.matches(req.password, u.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwt.generate(u);
        return new AuthResponse(token, new UserDto(u.getId(), u.getEmail(), u.getRole().name()));
    }
}
