package com.example.demo.controller;

import com.example.demo.model.WishlistItem;
import com.example.demo.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @GetMapping("/{userId}")
    public List<Long> getWishlist(@PathVariable Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(WishlistItem::getBookId)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody WishlistItem item) {
        if (wishlistRepository.existsByUserIdAndBookId(item.getUserId(), item.getBookId())) {
            return ResponseEntity.badRequest().body("Book already in wishlist");
        }
        item.setAddedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(wishlistRepository.save(item));
    }

    @DeleteMapping("/{userId}/{bookId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long userId, @PathVariable Long bookId) {
        wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
        return ResponseEntity.ok().build();
    }
}
