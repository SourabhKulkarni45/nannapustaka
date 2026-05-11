package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.demo.security.JwtUtil;
import com.example.demo.dto.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.example.demo.service.EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("First name is required");
        }
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists! Please choose a different one.");
        }
        
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            String subject = "Welcome to NannaPustaka!";
            String text = "Dear " + user.getFirstName() + ",\n\n" +
                    "Welcome to NannaPustaka! Your account has been successfully created.\n\n" +
                    "Start exploring our collection of books today.\n\n" +
                    "Best regards,\nThe NannaPustaka Team";
            emailService.sendSimpleEmail(user.getEmail(), subject, text);
        }
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        User user = userRepository.findByUsername(loginUser.getUsername());
        if (user != null && passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token, user));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody com.example.demo.dto.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername());
        if (user != null && passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("Invalid username or previous password");
    }
}
