package com.lamimo.backend.controller;

import com.lamimo.backend.controller.dto.AddCartRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final List<Map<String, Object>> cart = new ArrayList<>();
    private final AtomicInteger seq = new AtomicInteger(1);

    // 1) ดึงรายการตะกร้า
    @GetMapping
    public List<Map<String, Object>> getCart() {
        return cart;
    }

    // 2) เพิ่มสินค้าเข้าตะกร้า (มาจากหน้า detail)
    @PostMapping("/items")
    public Map<String, Object> addToCart(@RequestBody AddCartRequest req) {
        if (req == null || req.productId == null) return Map.of("message", "productId is required");
        if (req.qty == null || req.qty < 1) req.qty = 1;
        if (req.size == null) req.size = "";

        // ✅ ถ้าสินค้าเดิม + ไซส์เดิม มีอยู่แล้ว → รวม qty
        for (Map<String, Object> it : cart) {
            int pid = ((Number) it.get("productId")).intValue();
            String size = String.valueOf(it.get("size"));
            if (pid == req.productId && size.equals(req.size)) {
                int oldQty = ((Number) it.get("qty")).intValue();
                it.put("qty", oldQty + req.qty);

                // อัปเดตชื่อ/ราคา/รูป เผื่อบางหน้าไม่ครบ
                if (req.name != null) it.put("name", req.name);
                if (req.price != null) it.put("price", req.price);
                if (req.image != null && !req.image.isBlank()) it.put("image", req.image);

                int totalQty = cart.stream().mapToInt(i -> ((Number) i.get("qty")).intValue()).sum();
                return Map.of("message", "merged", "cartItemCount", totalQty);
            }
        }

        // ✅ ไม่มีซ้ำ → เพิ่มแถวใหม่
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("itemId", seq.getAndIncrement());
        item.put("productId", req.productId);
        item.put("name", req.name == null ? "" : req.name);
        item.put("price", req.price == null ? 0.0 : req.price);
        item.put("image", req.image == null ? "" : req.image);
        item.put("size", req.size);
        item.put("qty", req.qty);

        cart.add(item);

        int totalQty = cart.stream().mapToInt(i -> ((Number) i.get("qty")).intValue()).sum();
        return Map.of("message", "added", "cartItemCount", totalQty);
    }

    // 3) ปรับจำนวนในตะกร้า (สำหรับปุ่ม +/- ในหน้า Cart)
    @PatchMapping("/items/{itemId}")
    public Map<String, Object> updateQty(@PathVariable int itemId, @RequestBody Map<String, Object> body) {
        int qty = ((Number) body.getOrDefault("qty", 1)).intValue();
        if (qty < 1) qty = 1;

        for (Map<String, Object> it : cart) {
            int id = ((Number) it.get("itemId")).intValue();
            if (id == itemId) {
                it.put("qty", qty);
                return Map.of("message", "updated");
            }
        }
        return Map.of("message", "not_found");
    }

    // 4) ลบสินค้าออกจากตะกร้า (กดปุ่ม - ตอน qty=1)
    @DeleteMapping("/items/{itemId}")
    public Map<String, Object> deleteItem(@PathVariable int itemId) {
        Iterator<Map<String, Object>> it = cart.iterator();
        while (it.hasNext()) {
            Map<String, Object> item = it.next();
            int id = ((Number) item.get("itemId")).intValue();
            if (id == itemId) {
                it.remove();
                return Map.of("message", "deleted");
            }
        }
        return Map.of("message", "not_found");
    }

}
