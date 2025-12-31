package com.lamimo.backend.controller.dto;

public class AddCartRequest {
    public Integer productId;
    public String name;
    public Double price;
    public String image;
    public String size;   // String เพื่อรองรับทั้ง "36" และ "M"
    public Integer qty;
}
