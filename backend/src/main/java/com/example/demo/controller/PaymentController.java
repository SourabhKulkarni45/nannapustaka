package com.example.demo.controller;
 
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());
            
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int)(amount * 100)); // amount in the smallest currency unit (paise)
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString().substring(0, 8));

            Order order = razorpay.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body("Error creating Razorpay order: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    @PostMapping("/upi/process")
    public ResponseEntity<?> processUpiPayment(@RequestBody Map<String, Object> payload) {
        String upiId = (String) payload.get("upiId");
        Double amount = null;
        if(payload.get("amount") != null) {
            amount = Double.valueOf(payload.get("amount").toString());
        }

        if (upiId == null || upiId.isEmpty()) {
            return ResponseEntity.badRequest().body("UPI ID is required");
        }

        // Simulate processing delay (e.g., waiting for user to accept mandate on their phone)
        try {
            Thread.sleep(2500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Generate a mock transaction ID
        String transactionId = "TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Payment processed successfully");
        response.put("transactionId", transactionId);
        response.put("amount", amount);
        response.put("upiId", upiId);

        return ResponseEntity.ok(response);
    }
}
