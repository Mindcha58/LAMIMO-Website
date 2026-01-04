package com.lamimo.backend.repository;

import com.lamimo.backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findAllByUserId(Long userId);

    Optional<WishlistItem> findByUserIdAndProductIdAndSize(Long userId, Integer productId, String size);

    long countByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("delete from WishlistItem w where w.id = :id and w.userId = :userId")
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("delete from WishlistItem w where w.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
