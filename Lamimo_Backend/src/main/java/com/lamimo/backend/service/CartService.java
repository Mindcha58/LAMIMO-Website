package com.lamimo.backend.service;

import com.lamimo.backend.controller.dto.AddCartRequest;
import com.lamimo.backend.entity.CartItem;
import com.lamimo.backend.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository repo;

    public CartService(CartItemRepository repo) {
        this.repo = repo;
    }

    public List<CartItem> list() {
        return repo.findAll();
    }

    // เพิ่มสินค้า: ถ้ามี productId+size เดิม ให้รวม qty
    public CartItem add(AddCartRequest req) {
        if (req == null || req.productId == null) {
            throw new IllegalArgumentException("productId is required");
        }
        String size = (req.size == null) ? "" : req.size;
        int qty = (req.qty == null || req.qty < 1) ? 1 : req.qty;

        return repo.findByProductIdAndSize(req.productId, size)
                .map(existing -> {
                    existing.setQty(existing.getQty() + qty);
                    // อัปเดตข้อมูลล่าสุด (เผื่อชื่อ/ราคาเปลี่ยน)
                    if (req.name != null) existing.setName(req.name);
                    if (req.price != null) existing.setPrice(req.price);
                    if (req.image != null) existing.setImage(req.image);
                    return repo.save(existing);
                })
                .orElseGet(() -> {
                    CartItem it = new CartItem();
                    it.setProductId(req.productId);
                    it.setName(req.name == null ? "" : req.name);
                    it.setPrice(req.price == null ? 0.0 : req.price);
                    it.setImage(req.image == null ? "" : req.image);
                    it.setSize(size);
                    it.setQty(qty);
                    return repo.save(it);
                });
    }

    public CartItem updateQty(Long itemId, int qty) {
        if (qty < 1) qty = 1;
        CartItem it = repo.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("not_found"));
        it.setQty(qty);
        return repo.save(it);
    }

    public void delete(Long itemId) {
        repo.deleteById(itemId);
    }

    public void clear() {
        repo.deleteAll();
    }

    public int totalQty() {
        return repo.findAll().stream().mapToInt(CartItem::getQty).sum();
    }
}
