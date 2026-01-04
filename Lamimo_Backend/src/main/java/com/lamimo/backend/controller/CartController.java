package com.lamimo.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lamimo.backend.config.security.UserPrincipal;
import com.lamimo.backend.controller.dto.AddCartRequest;
import com.lamimo.backend.entity.CartItem;
import com.lamimo.backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public List<CartItem> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return service.list(principal.getId());
    }

    @PostMapping("/items")
    public Map<String, Object> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody AddCartRequest req) {

        // เพิ่มตรงนี้เพื่อป้องกัน App พังและบอก User ให้รู้ตัว
        if (principal == null) {
            throw new RuntimeException("กรุณา Login ก่อนเพิ่มสินค้าลงตะกร้า");
        }

        service.add(principal.getId(), req);
        return Map.of(
                "message", "added",
                "cartItemCount", service.totalQty(principal.getId()));
    }

    @PatchMapping("/items/{itemId}")
    public Map<String, Object> updateQty(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {

        int qty = ((Number) body.getOrDefault("qty", 1)).intValue();
        service.updateQty(principal.getId(), itemId, qty);
        return Map.of("message", "updated");
    }

    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {

        service.delete(principal.getId(), itemId);
        return Map.of("message", "deleted");
    }

    @DeleteMapping
    public Map<String, Object> clear(@AuthenticationPrincipal UserPrincipal principal) {
        service.clear(principal.getId());
        return Map.of("message", "cleared");
    }
}