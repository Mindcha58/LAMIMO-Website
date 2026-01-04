package com.lamimo.backend.service;

import com.lamimo.backend.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key key;
    private final long expMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expirationMinutes}") long expMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expMillis = expMinutes * 60_000L;
    }

    public String generate(User user) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expMillis))
                .addClaims(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long parseUserId(String token) {
        String sub = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
        return Long.valueOf(sub);
    }

    public String parseRole(String token) {
        Object role = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("role");
        return role == null ? "USER" : String.valueOf(role);
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key) // ใช้ตัวแปร key ที่ประกาศไว้ด้านบน
                .build()
                .parseClaimsJws(token)
                .getBody()          // ใช้ getBody() แทน getPayload()
                .get("email", String.class); // ดึงค่าจาก Claim ที่ชื่อ "email"
    }
    
    public boolean isTokenValid(String token, User user) {
        try {
            String email = extractEmail(token);
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();

            // เช็คว่า Email ตรงกัน และ วันหมดอายุยังไม่มาถึง (หลังเวลาปัจจุบัน)
            return email.equals(user.getEmail()) && expiration.after(new Date());
        } catch (Exception e) {
            return false; // ถ้า Token ผิดรูปแบบ หรือหมดอายุ จะโยน Exception ให้คืนเป็น false
        }
    }

}
