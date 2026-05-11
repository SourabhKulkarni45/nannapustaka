package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Book;
import com.example.demo.repository.BookRepository;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @Autowired
    private com.example.demo.service.EmailService emailService;

    @PostMapping
    public Order placeOrder(@RequestBody Order order) {
        order.setStatus("ORDER CONFIRMED");
        String datePart = new java.text.SimpleDateFormat("yyMMdd").format(new java.util.Date());
        String randomPart = String.format("%06d", new java.util.Random().nextInt(1000000));
        order.setTrackingNumber(datePart + randomPart);
        
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                Book book = bookRepository.findById(item.getBookId()).orElse(null);
                if (book != null && book.getStock() != null && book.getStock() >= item.getQuantity()) {
                    book.setStock(book.getStock() - item.getQuantity());
                    bookRepository.save(book);
                }
            });
        }
        Order savedOrder = orderRepository.save(order);
        
        if (savedOrder.getUserId() != null) {
            com.example.demo.model.User user = userRepository.findById(savedOrder.getUserId()).orElse(null);
            if (user != null && user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                String subject = "Order Invoice - " + savedOrder.getTrackingNumber();
                
                StringBuilder invoice = new StringBuilder();
                invoice.append("Dear ").append(user.getFirstName()).append(",\n\n");
                invoice.append("Thank you for your order! Your order has been placed successfully.\n\n");
                
                invoice.append("--- INVOICE DETAILS ---\n");
                invoice.append("Tracking Number: ").append(savedOrder.getTrackingNumber()).append("\n");
                invoice.append("Order Date     : ").append(savedOrder.getOrderDate()).append("\n");
                invoice.append("Payment Mode   : ").append(savedOrder.getPaymentMode()).append("\n");
                if (savedOrder.getTransactionId() != null) {
                    invoice.append("Transaction ID : ").append(savedOrder.getTransactionId()).append("\n");
                }
                
                invoice.append("\n--- CUSTOMER DETAILS ---\n");
                invoice.append("Name    : ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
                invoice.append("Email   : ").append(user.getEmail()).append("\n");
                invoice.append("Contact : ").append(user.getContactNumber()).append("\n");
                
                invoice.append("\n--- SHIPPING ADDRESS ---\n");
                com.example.demo.model.Address addr = savedOrder.getAddress();
                if (addr != null) {
                    invoice.append(addr.getHouseNumber()).append(", ").append(addr.getHouseName()).append("\n");
                    invoice.append("Landmark: ").append(addr.getLandmark()).append("\n");
                    invoice.append(addr.getCity()).append(", ").append(addr.getState()).append(" - ").append(addr.getPinCode()).append("\n");
                }
                
                invoice.append("\n--- ORDER SUMMARY ---\n");
                if (savedOrder.getItems() != null) {
                    for (com.example.demo.model.OrderItem item : savedOrder.getItems()) {
                        invoice.append("- ").append(item.getBookTitle())
                               .append(" (Qty: ").append(item.getQuantity()).append(") ")
                               .append("- Rs. ").append(item.getPrice().multiply(new java.math.BigDecimal(item.getQuantity()))).append("\n");
                    }
                }
                
                invoice.append("\n--------------------------\n");
                invoice.append("Subtotal        : Rs. ").append(savedOrder.getSubtotal()).append("\n");
                invoice.append("Delivery Charge : Rs. ").append(savedOrder.getDeliveryCharge()).append("\n");
                invoice.append("TOTAL AMOUNT    : Rs. ").append(savedOrder.getTotalAmount()).append("\n");
                invoice.append("--------------------------\n\n");
                
                invoice.append("We will notify you once your order is shipped.\n\n");
                invoice.append("Best regards,\nThe NannaPustaka Team");
                
                emailService.sendSimpleEmail(user.getEmail(), subject, invoice.toString());
            }
        }
        
        return savedOrder;
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderRepository.findByUserId(userId);
    }
    
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/user/{userId}/purchased/{bookId}")
    public boolean hasPurchased(@PathVariable Long userId, @PathVariable Long bookId) {
        boolean purchased = orderRepository.hasUserPurchasedBook(userId, bookId);
        System.out.println("Checking purchase for user " + userId + " and book " + bookId + ": " + purchased);
        return purchased;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody String status) {
        Order order = orderRepository.findById(id).orElse(null);
        if(order != null) {
            if ("DELIVERED".equals(order.getStatus())) {
                return ResponseEntity.badRequest().body("Status cannot be changed once an order is DELIVERED");
            }
            order.setStatus(status);
            Order savedOrder = orderRepository.save(order);
            
            if (savedOrder.getUserId() != null) {
                com.example.demo.model.User user = userRepository.findById(savedOrder.getUserId()).orElse(null);
                if (user != null && user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                    String subject = "Order Status Update - " + savedOrder.getTrackingNumber();
                    String text = "Dear " + user.getFirstName() + ",\n\n" +
                            "The status of your order (" + savedOrder.getTrackingNumber() + ") has been updated to: " + status + ".\n\n" +
                            "Thank you for shopping with NannaPustaka!\n\n" +
                            "Best regards,\nThe NannaPustaka Team";
                    emailService.sendSimpleEmail(user.getEmail(), subject, text);
                }
            }
            
            return ResponseEntity.ok(savedOrder);
        }
        return ResponseEntity.notFound().build();
    }
}
