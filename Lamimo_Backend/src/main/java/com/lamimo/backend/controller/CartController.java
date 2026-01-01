package com.lamimo.backend.controller;

import com.lamimo.backend.controller.dto.AddCartRequest;
import com.lamimo.backend.entity.CartItem;
import com.lamimo.backend.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public List<CartItem> getCart() {
        return service.list();
    }

    @PostMapping("/items")
    public Map<String, Object> addToCart(@RequestBody AddCartRequest req) {
        service.add(req);
        return Map.of(
                "message", "added",
                "cartItemCount", service.totalQty());
    }

    @PatchMapping("/items/{itemId}")
    public Map<String, Object> updateQty(@PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        int qty = ((Number) body.getOrDefault("qty", 1)).intValue();
        service.updateQty(itemId, qty);
        return Map.of("message", "updated");
    }

    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> delete(@PathVariable Long itemId) {
        service.delete(itemId);
        return Map.of("message", "deleted");
    }

    @DeleteMapping
    public Map<String, Object> clear() {
        service.clear();
        return Map.of("message", "cleared");
    }
}
