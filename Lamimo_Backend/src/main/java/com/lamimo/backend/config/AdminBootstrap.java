package com.lamimo.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.lamimo.backend.entity.Role;
import com.lamimo.backend.entity.User;
import com.lamimo.backend.repository.UserRepository;

@Configuration
public class AdminBootstrap {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            String email = "admin@lamimo.com";
            String rawPassword = "Admin1234";

            var existing = userRepo.findByEmail(email).orElse(null);

            if (existing == null) {
                User u = new User();
                u.setEmail(email);
                u.setPasswordHash(encoder.encode(rawPassword));
                u.setFirstName("Admin");
                u.setLastName("LAMIMO");
                u.setRole(Role.ADMIN); // ใช้ enum
                userRepo.save(u);
                System.out.println("Created admin: " + email);
            } else {
                if (existing.getRole() != Role.ADMIN) { // เปรียบเทียบ enum
                    existing.setRole(Role.ADMIN);
                    userRepo.save(existing);
                    System.out.println("Promoted to admin: " + email);
                }
            }
        };
    }
}
