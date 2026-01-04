package com.lamimo.backend.service;

import com.lamimo.backend.controller.dto.AddCartRequest;
import com.lamimo.backend.entity.CartItem;
import com.lamimo.backend.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@jakarta.transaction.Transactional // เพิ่มเพื่อให้ delete/clear ทำงานได้
public class CartService {

    private final CartItemRepository repo;

    public CartService(CartItemRepository repo) {
        this.repo = repo;
    }

    // แก้ไข: ดึงเฉพาะของ User คนนั้น
    public List<CartItem> list(Long userId) {
        return repo.findAllByUserId(userId);
    }

    // แก้ไข: เพิ่มสินค้าโดยผูกกับ userId
    public CartItem add(Long userId, AddCartRequest req) {
        if (req == null || req.productId == null) {
            throw new IllegalArgumentException("productId is required");
        }
        String size = (req.size == null) ? "" : req.size;
        int qty = (req.qty == null || req.qty < 1) ? 1 : req.qty;

        // ค้นหาโดยใช้ userId + productId + size เพื่อไม่ให้ซ้ำคนอื่น
        return repo.findByUserIdAndProductIdAndSize(userId, req.productId, size)
                .map(existing -> {
                    existing.setQty(existing.getQty() + qty);
                    if (req.name != null) existing.setName(req.name);
                    if (req.price != null) existing.setPrice(req.price);
                    if (req.image != null) existing.setImage(req.image);
                    return repo.save(existing);
                })
                .orElseGet(() -> {
                    CartItem it = new CartItem();
                    it.setUserId(userId); // สำคัญ: เซตเจ้าของตะกร้า
                    it.setProductId(req.productId);
                    it.setName(req.name == null ? "" : req.name);
                    it.setPrice(req.price == null ? 0.0 : req.price);
                    it.setImage(req.image == null ? "" : req.image);
                    it.setSize(size);
                    it.setQty(qty);
                    return repo.save(it);
                });
    }

    // แก้ไข: อัปเดตจำนวน (เช็คความเป็นเจ้าของ)
    public CartItem updateQty(Long userId, Long itemId, int qty) {
        if (qty < 1) qty = 1;
        CartItem it = repo.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new IllegalArgumentException("not_found"));
        it.setQty(qty);
        return repo.save(it);
    }

    // แก้ไข: ลบเฉพาะของตนเอง
    public void delete(Long userId, Long itemId) {
        repo.deleteByIdAndUserId(itemId, userId);
    }

    // แก้ไข: ล้างตะกร้าเฉพาะของตนเอง
    public void clear(Long userId) {
        repo.deleteAllByUserId(userId);
    }

    // แก้ไข: นับจำนวนรวมเฉพาะของ User
    public int totalQty(Long userId) {
        return repo.findAllByUserId(userId).stream().mapToInt(CartItem::getQty).sum();
    }
}

