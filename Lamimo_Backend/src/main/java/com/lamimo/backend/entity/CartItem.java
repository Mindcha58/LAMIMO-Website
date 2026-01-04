package com.lamimo.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(
    name = "cart_items",
    uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "product_id", "size" })
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    private String name;
    private Double price;
    private String image;
    private String size;

    @Column(nullable = false)
    private Integer qty;

    private LocalDateTime createdAt;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (qty == null || qty < 1) qty = 1;
        if (size == null) size = "";
    }

    @JsonProperty("itemId")
    public Long getItemId() {
        return id;
    }

    // ถ้าไม่อยากให้ส่ง "id" ออกไปซ้ำด้วย ให้ ignore getId()
    @JsonIgnore
    public Long getId() {
        return id;
    }

    public void setId(Long id) { this.id = id; }

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
