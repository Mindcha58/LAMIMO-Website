package com.lamimo.backend.service;

import com.lamimo.backend.controller.dto.AddWishlistRequest;
import com.lamimo.backend.entity.WishlistItem;
import com.lamimo.backend.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository repo;

    public WishlistService(WishlistItemRepository repo) {
        this.repo = repo;
    }

    public List<WishlistItem> list() {
        return repo.findAll();
    }

    // เพิ่ม wishlist: กันซ้ำ productId+size
    public String add(AddWishlistRequest req) {
        if (req == null || req.productId == null) {
            throw new IllegalArgumentException("productId is required");
        }
        String size = (req.size == null) ? "" : req.size;

        boolean exists = repo.findByProductIdAndSize(req.productId, size).isPresent();
        if (exists) return "already_in_wishlist";

        WishlistItem it = new WishlistItem();
        it.setProductId(req.productId);
        it.setName(req.name == null ? "" : req.name);
        it.setPrice(req.price == null ? 0.0 : req.price);
        it.setImage(req.image == null ? "" : req.image);
        it.setSize(size);

        repo.save(it);
        return "added";
    }

    public void delete(Long itemId) {
        repo.deleteById(itemId);
    }

    public void clear() {
        repo.deleteAll();
    }

    public long count() {
        return repo.count();
    }
}
