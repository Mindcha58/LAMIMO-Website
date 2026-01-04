package com.lamimo.backend.service;

import com.lamimo.backend.controller.dto.AddWishlistRequest;
import com.lamimo.backend.entity.WishlistItem;
import com.lamimo.backend.repository.WishlistItemRepository;
import com.lamimo.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository repo;
    private final UserRepository userRepo;

    public WishlistService(WishlistItemRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> list(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return repo.findAllByUserId(user.getId());
    }

    @Transactional
    public String add(AddWishlistRequest req, String email) {
        if (req == null || req.productId == null) {
            throw new IllegalArgumentException("productId is required");
        }

        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String size = (req.size == null) ? "" : req.size;

        boolean exists = repo.findByUserIdAndProductIdAndSize(user.getId(), req.productId, size).isPresent();
        if (exists) return "already_in_wishlist";

        WishlistItem it = new WishlistItem();
        it.setUserId(user.getId());
        it.setProductId(req.productId);
        it.setName(req.name == null ? "" : req.name);
        it.setPrice(req.price == null ? 0.0 : req.price);
        it.setImage(req.image == null ? "" : req.image);
        it.setSize(size);

        repo.save(it);
        return "added";
    }

    @Transactional
    public void delete(Long itemId, String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        repo.deleteByIdAndUserId(itemId, user.getId());
    }

    @Transactional
    public void clear(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        repo.deleteAllByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public long count(String email) {
        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return repo.countByUserId(user.getId());
    }
}
