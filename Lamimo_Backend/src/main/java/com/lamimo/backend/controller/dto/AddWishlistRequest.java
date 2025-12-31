package com.lamimo.backend.controller.dto;

public class AddWishlistRequest {
    public Integer productId;
    public String name;
    public Double price;
    public String image;
    public String size;   // รองรับทั้ง "36" และ "M"
}
