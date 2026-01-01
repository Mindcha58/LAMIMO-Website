package com.lamimo.backend.controller;

import com.lamimo.backend.controller.dto.AddWishlistRequest;
import com.lamimo.backend.entity.WishlistItem;
import com.lamimo.backend.service.WishlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService service;

    public WishlistController(WishlistService service) {
        this.service = service;
    }

    @GetMapping
    public List<WishlistItem> getWishlist() {
        return service.list();
    }

    @PostMapping("/items")
    public Map<String, Object> addToWishlist(@RequestBody AddWishlistRequest req) {
        String msg = service.add(req);
        return Map.of(
                "message", msg,
                "wishlistCount", service.count()
        );
    }

    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> remove(@PathVariable Long itemId) {
        service.delete(itemId);
        return Map.of("message", "deleted");
    }

    @DeleteMapping
    public Map<String, Object> clear() {
        service.clear();
        return Map.of("message", "cleared");
    }
}
