package com.lamimo.backend.controller;

import com.lamimo.backend.controller.dto.AddWishlistRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final List<Map<String, Object>> wishlist = new ArrayList<>();
    private final AtomicInteger seq = new AtomicInteger(1);

    // 1) ดึงรายการ wishlist
    @GetMapping
    public List<Map<String, Object>> getWishlist() {
        return wishlist;
    }

    // 2) เพิ่มสินค้าเข้า wishlist (กันซ้ำด้วย productId + size)
    @PostMapping("/items")
    public Map<String, Object> addToWishlist(@RequestBody AddWishlistRequest req) {
        if (req == null || req.productId == null) return Map.of("message", "productId is required");
        if (req.size == null) req.size = "";

        for (Map<String, Object> it : wishlist) {
            int pid = ((Number) it.get("productId")).intValue();
            String sz = String.valueOf(it.getOrDefault("size", ""));
            if (pid == req.productId && Objects.equals(sz, req.size)) {
                return Map.of("message", "already_in_wishlist");
            }
        }

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("itemId", seq.getAndIncrement());
        item.put("productId", req.productId);
        item.put("name", req.name == null ? "" : req.name);
        item.put("price", req.price == null ? 0.0 : req.price);
        item.put("image", req.image == null ? "" : req.image);
        item.put("size", req.size);

        wishlist.add(item);
        return Map.of("message", "added", "wishlistCount", wishlist.size());
    }

    // 3) ลบ item ออกจาก wishlist
    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> remove(@PathVariable int itemId) {
        boolean removed = wishlist.removeIf(it -> ((Number) it.get("itemId")).intValue() == itemId);
        return Map.of("message", removed ? "deleted" : "not_found");
    }

    // 4) ล้าง wishlist ทั้งหมด (สำหรับปุ่ม Clear)
    @DeleteMapping
    public Map<String, Object> clear() {
        wishlist.clear();
        seq.set(1);
        return Map.of("message", "cleared");
    }
}
