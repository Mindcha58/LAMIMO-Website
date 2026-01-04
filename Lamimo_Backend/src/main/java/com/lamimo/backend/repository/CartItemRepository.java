package com.lamimo.backend.repository;

import com.lamimo.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findAllByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndSize(Long userId, Integer productId, String size);

    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    void deleteAllByUserId(Long userId);
}
