package com.lamimo.backend.repository;

import com.lamimo.backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByProductIdAndSize(Integer productId, String size);
}
