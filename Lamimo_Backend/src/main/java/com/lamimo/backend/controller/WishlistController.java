package com.lamimo.backend.controller;

import com.lamimo.backend.controller.dto.AddWishlistRequest;
import com.lamimo.backend.entity.WishlistItem;
import com.lamimo.backend.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService service;

    public WishlistController(WishlistService service) {
        this.service = service;
    }

    @PostMapping("/items")
    public Map<String, String> addToWishlist(@RequestBody AddWishlistRequest req,
            Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String email = auth.getName();
        String result = service.add(req, email);
        return Map.of("message", result);
    }

    @GetMapping
    public List<WishlistItem> list(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return service.list(auth.getName());
    }

    @DeleteMapping("/items/{itemId}")
    public void delete(@PathVariable Long itemId, Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        service.delete(itemId, auth.getName());
    }

    @DeleteMapping
    public void clear(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        service.clear(auth.getName());
    }
}
