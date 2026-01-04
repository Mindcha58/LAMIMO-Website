package com.lamimo.backend.controller;

import com.lamimo.backend.repository.CartItemRepository;
import com.lamimo.backend.repository.UserRepository;
import com.lamimo.backend.repository.WishlistItemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepo;
    private final CartItemRepository cartRepo;
    private final WishlistItemRepository wishRepo;

    public AdminController(UserRepository userRepo, CartItemRepository cartRepo, WishlistItemRepository wishRepo) {
        this.userRepo = userRepo;
        this.cartRepo = cartRepo;
        this.wishRepo = wishRepo;
    }

    // เช็คว่า token นี้เป็น admin จริงไหม
    @GetMapping("/me")
    public Map<String, Object> me(Authentication auth) {
        return Map.of(
                "name", auth.getName(),
                "authorities", auth.getAuthorities()
        );
    }

    // ดู user ทั้งหมด (admin only)
    @GetMapping("/users")
    public Object listUsers() {
        return userRepo.findAll();
    }

    // ตัวอย่างสถิติ
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
                "users", userRepo.count(),
                "cartItems", cartRepo.count(),
                "wishlistItems", wishRepo.count()
        );
    }

    // ดู wishlist ทั้งหมด (admin)
    @GetMapping("/wishlist")
    public Object allWishlist() {
        return wishRepo.findAll();
    }

    // ดู cart ทั้งหมด (admin)
    @GetMapping("/cart")
    public Object allCart() {
        return cartRepo.findAll();
    }
}
